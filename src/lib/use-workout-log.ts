"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { WorkoutEntry } from "@/lib/coach/types";
import { todayIsoDate } from "@/lib/fuelwell-data";
import type { MutationResult } from "@/lib/use-day-log";

const LEGACY_STORAGE_KEY = "fuelwell-workout-log-v1";
const PREVIEW_CACHE_PREFIX = "fuelwell-workout-log-preview-v2";
const USER_CACHE_PREFIX = "fuelwell-workout-log-user-v2";

type WorkoutLogMode = "unknown" | "preview" | "authenticated";
type PersistenceStatus = "idle" | "loading" | "saving" | "saved" | "error";

export type WorkoutLogPersistence = {
  mode: WorkoutLogMode;
  status: PersistenceStatus;
  userId: string | null;
  date: string;
  error: string | null;
};

type WorkoutLogSnapshot = {
  workouts: WorkoutEntry[];
  persistence: WorkoutLogPersistence;
};

type WorkoutLogResponse = {
  signedIn: boolean;
  userId?: string;
  date?: string;
  workouts: WorkoutEntry[];
  error?: string;
};

const date = todayIsoDate();
const listeners = new Set<() => void>();
const EMPTY: WorkoutEntry[] = [];
let initialized = false;
let initializePromise: Promise<boolean> | null = null;
let mutationQueue: Promise<unknown> = Promise.resolve();
let snapshot: WorkoutLogSnapshot = {
  workouts: EMPTY,
  persistence: { mode: "unknown", status: "idle", userId: null, date, error: null },
};
const serverSnapshot = snapshot;

function previewCacheKey(day: string) {
  return `${PREVIEW_CACHE_PREFIX}:${day}`;
}

function userCacheKey(userId: string, day: string) {
  return `${USER_CACHE_PREFIX}:${userId}:${day}`;
}

function emit(next: WorkoutLogSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function setWorkouts(
  workouts: WorkoutEntry[],
  persistence: Partial<WorkoutLogPersistence> = {},
) {
  emit({ workouts, persistence: { ...snapshot.persistence, ...persistence } });
}

function readCache(key: string): WorkoutEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as
      | WorkoutEntry[]
      | { workouts?: WorkoutEntry[] }
      | null;
    if (Array.isArray(parsed)) return parsed;
    return parsed && Array.isArray(parsed.workouts) ? parsed.workouts : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, workouts: WorkoutEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ date, workouts }));
  } catch {
    // The authenticated server remains authoritative; cache failure is non-fatal.
  }
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Workout persistence failed.";
}

async function readResponse(response: Response): Promise<WorkoutLogResponse> {
  const body = (await response.json().catch(() => ({}))) as Partial<WorkoutLogResponse>;
  if (!response.ok) {
    throw new Error(body.error || `Workout persistence failed (${response.status}).`);
  }
  if (!Array.isArray(body.workouts)) throw new Error("Workout log response was incomplete.");
  return body as WorkoutLogResponse;
}

export async function initializeWorkoutLog(): Promise<boolean> {
  if (initialized) return true;
  if (initializePromise) return initializePromise;
  setWorkouts(snapshot.workouts, { status: "loading", error: null });
  initializePromise = (async () => {
    try {
      const body = await readResponse(await fetch(
        `/api/workout-log?date=${encodeURIComponent(date)}`,
        { cache: "no-store" },
      ));
      if (body.signedIn) {
        if (!body.userId) throw new Error("Authenticated workout response omitted the user.");
        initialized = true;
        writeCache(userCacheKey(body.userId, date), body.workouts);
        setWorkouts(body.workouts, {
          mode: "authenticated",
          status: "saved",
          userId: body.userId,
          error: null,
        });
        return true;
      }

      initialized = true;
      const previewWorkouts =
        readCache(previewCacheKey(date)) ?? readCache(LEGACY_STORAGE_KEY) ?? EMPTY;
      writeCache(previewCacheKey(date), previewWorkouts);
      setWorkouts(previewWorkouts, {
        mode: "preview",
        status: "saved",
        userId: null,
        error: null,
      });
      return true;
    } catch (error) {
      setWorkouts(snapshot.workouts, {
        mode: "unknown",
        status: "error",
        userId: null,
        error: errorText(error),
      });
      return false;
    } finally {
      initializePromise = null;
    }
  })();
  return initializePromise;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function enqueue<T>(operation: () => Promise<MutationResult<T>>): Promise<MutationResult<T>> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function jsonRequest(method: "POST" | "DELETE", body: unknown) {
  return fetch("/api/workout-log", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function mutate<T>(
  optimistic: (current: WorkoutEntry[]) => WorkoutEntry[],
  request: () => Promise<Response>,
  value: T,
): Promise<MutationResult<T>> {
  return enqueue(async () => {
    if (!(await initializeWorkoutLog())) {
      return { ok: false, error: snapshot.persistence.error || "Workout log did not initialize." };
    }
    const before = snapshot.workouts;
    const optimisticWorkouts = optimistic(before);
    setWorkouts(optimisticWorkouts, { status: "saving", error: null });

    if (snapshot.persistence.mode === "preview") {
      writeCache(previewCacheKey(date), optimisticWorkouts);
      setWorkouts(optimisticWorkouts, { status: "saved", error: null });
      return { ok: true, value };
    }
    if (snapshot.persistence.mode !== "authenticated" || !snapshot.persistence.userId) {
      const message = "Authentication state is unknown; workout was not persisted.";
      setWorkouts(before, { status: "error", error: message });
      return { ok: false, error: message };
    }

    try {
      const body = await readResponse(await request());
      if (!body.signedIn || body.userId !== snapshot.persistence.userId) {
        throw new Error("Authenticated workout response did not match the current user.");
      }
      writeCache(userCacheKey(body.userId, date), body.workouts);
      setWorkouts(body.workouts, { status: "saved", error: null });
      return { ok: true, value };
    } catch (error) {
      const message = errorText(error);
      setWorkouts(before, { status: "error", error: message });
      return { ok: false, error: message };
    }
  });
}

export function addWorkout(entry: WorkoutEntry): Promise<MutationResult<WorkoutEntry>> {
  return mutate(
    (current) => [...current.filter((workout) => workout.id !== entry.id), entry],
    () => jsonRequest("POST", { date, workout: entry }),
    entry,
  );
}

export function removeWorkout(workoutId: string): Promise<MutationResult<void>> {
  return mutate(
    (current) => current.filter((workout) => workout.id !== workoutId),
    () => jsonRequest("DELETE", { date, workoutId }),
    undefined,
  );
}

export function updateWorkout(
  workoutId: string,
  patch: Partial<WorkoutEntry>,
): Promise<MutationResult<WorkoutEntry | null>> {
  const existing = snapshot.workouts.find((workout) => workout.id === workoutId);
  if (!existing) return Promise.resolve({ ok: true, value: null });
  const updated: WorkoutEntry = {
    ...existing,
    ...patch,
    id: workoutId,
    source:
      existing.source === "manual_activity"
        ? "manual_activity"
        : patch.source ?? "manual_edit",
  };
  return mutate(
    (current) => current.map((workout) => workout.id === workoutId ? updated : workout),
    () => jsonRequest("POST", { date, workout: updated }),
    updated,
  );
}

export function getWorkoutLogSnapshot() {
  return snapshot;
}

export function useWorkoutLog() {
  useEffect(() => {
    void initializeWorkoutLog();
  }, []);
  const current = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
  return {
    workouts: current.workouts,
    persistence: current.persistence,
    addWorkout,
    removeWorkout,
    updateWorkout,
  };
}
