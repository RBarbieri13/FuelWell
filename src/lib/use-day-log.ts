"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  SAMPLE_MEALS,
  SAMPLE_TARGETS,
  sumMeals,
  todayIsoDate,
  type MacroTargets,
  type MacroTotals,
  type MealItem,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";

const PREVIEW_CACHE_PREFIX = "fuelwell-day-log-preview-v1";
const USER_CACHE_PREFIX = "fuelwell-day-log-user-v1";

type DayLogMode = "unknown" | "preview" | "authenticated";
type PersistenceStatus = "idle" | "loading" | "saving" | "saved" | "error";

export type DayLogPersistence = {
  mode: DayLogMode;
  status: PersistenceStatus;
  userId: string | null;
  date: string;
  error: string | null;
};

type DayLogSnapshot = {
  meals: MealRecord[];
  persistence: DayLogPersistence;
};

type DayLogResponse = {
  signedIn: boolean;
  userId?: string;
  date?: string;
  meals: MealRecord[];
  error?: string;
};

export type MutationResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type NewMealInput = {
  mealType: MealType;
  name: string;
  items: Array<Omit<MealItem, "id">>;
};

const listeners = new Set<() => void>();
const idAliases = new Map<string, string>();
const date = todayIsoDate();
let pendingSeed: MealRecord[] = SAMPLE_MEALS;
let initialized = false;
let initializePromise: Promise<boolean> | null = null;
let mutationQueue: Promise<unknown> = Promise.resolve();
let snapshot: DayLogSnapshot = {
  meals: SAMPLE_MEALS,
  persistence: { mode: "unknown", status: "idle", userId: null, date, error: null },
};
const serverSnapshot: DayLogSnapshot = snapshot;

function previewCacheKey(day: string) {
  return `${PREVIEW_CACHE_PREFIX}:${day}`;
}

function userCacheKey(userId: string, day: string) {
  return `${USER_CACHE_PREFIX}:${userId}:${day}`;
}

function emit(next: DayLogSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function setMeals(
  meals: MealRecord[],
  persistence: Partial<DayLogPersistence> = {},
) {
  emit({
    meals,
    persistence: { ...snapshot.persistence, ...persistence },
  });
}

function readCache(key: string): MealRecord[] | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
      meals?: MealRecord[];
    } | null;
    return parsed && Array.isArray(parsed.meals) ? parsed.meals : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, meals: MealRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ date, meals }));
  } catch {
    // The server remains authoritative; a full localStorage bucket is non-fatal.
  }
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Meal persistence failed.";
}

async function readResponse(response: Response): Promise<DayLogResponse> {
  const body = (await response.json().catch(() => ({}))) as Partial<DayLogResponse>;
  if (!response.ok) throw new Error(body.error || `Meal persistence failed (${response.status}).`);
  if (!Array.isArray(body.meals)) throw new Error("Day log response was incomplete.");
  return body as DayLogResponse;
}

export async function initializeDayLog(): Promise<boolean> {
  if (initialized) return true;
  if (initializePromise) return initializePromise;

  setMeals(snapshot.meals, { status: "loading", error: null });
  initializePromise = (async () => {
    try {
      const response = await fetch(`/api/day-log?date=${encodeURIComponent(date)}`, {
        cache: "no-store",
      });
      const body = await readResponse(response);

      if (body.signedIn) {
        if (!body.userId) throw new Error("Authenticated day log response omitted the user.");
        initialized = true;
        writeCache(userCacheKey(body.userId, date), body.meals);
        setMeals(body.meals, {
          mode: "authenticated",
          status: "saved",
          userId: body.userId,
          error: null,
        });
        return true;
      }

      initialized = true;
      const previewMeals = readCache(previewCacheKey(date)) ?? pendingSeed;
      writeCache(previewCacheKey(date), previewMeals);
      setMeals(previewMeals, {
        mode: "preview",
        status: "saved",
        userId: null,
        error: null,
      });
      return true;
    } catch (error) {
      setMeals(snapshot.meals, {
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

function newUuid() {
  return crypto.randomUUID();
}

function normalizeId(id: string) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  const existing = idAliases.get(id);
  if (existing) return existing;
  const generated = newUuid();
  idAliases.set(id, generated);
  return generated;
}

function normalizeMealIds(meal: MealRecord): MealRecord {
  const mealId = normalizeId(meal.id);
  return {
    ...meal,
    id: mealId,
    items: meal.items.map((item) => ({
      ...item,
      id: normalizeId(item.id),
    })),
  };
}

function resolveMealId(mealId: string) {
  return idAliases.get(mealId) ?? mealId;
}

function enqueue<T>(operation: () => Promise<MutationResult<T>>): Promise<MutationResult<T>> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function mutate<T>(
  optimistic: (current: MealRecord[]) => MealRecord[],
  request: () => Promise<Response>,
  value: T,
): Promise<MutationResult<T>> {
  return enqueue(async () => {
    if (!(await initializeDayLog())) {
      return { ok: false, error: snapshot.persistence.error || "Day log did not initialize." };
    }

    const before = snapshot.meals;
    const optimisticMeals = optimistic(before);
    setMeals(optimisticMeals, { status: "saving", error: null });

    if (snapshot.persistence.mode === "preview") {
      writeCache(previewCacheKey(date), optimisticMeals);
      setMeals(optimisticMeals, { status: "saved", error: null });
      return { ok: true, value };
    }

    if (snapshot.persistence.mode !== "authenticated" || !snapshot.persistence.userId) {
      const message = "Authentication state is unknown; meal was not persisted.";
      setMeals(before, { status: "error", error: message });
      return { ok: false, error: message };
    }

    try {
      const body = await readResponse(await request());
      if (!body.signedIn || body.userId !== snapshot.persistence.userId) {
        throw new Error("Authenticated day log response did not match the current user.");
      }
      writeCache(userCacheKey(body.userId, date), body.meals);
      setMeals(body.meals, { status: "saved", error: null });
      return { ok: true, value };
    } catch (error) {
      const message = errorText(error);
      setMeals(before, { status: "error", error: message });
      return { ok: false, error: message };
    }
  });
}

function jsonRequest(method: "POST" | "PATCH" | "DELETE", body: unknown) {
  return fetch("/api/day-log", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function addMeal(input: NewMealInput): Promise<MutationResult<MealRecord>> {
  const meal: MealRecord = {
    id: newUuid(),
    mealType: input.mealType,
    name: input.name,
    loggedAt: new Date().toISOString(),
    items: input.items.map((item) => ({ ...item, id: newUuid() })),
  };
  return mutate(
    (current) => [...current, meal],
    () => jsonRequest("POST", { date, meal }),
    meal,
  );
}

export function hydrateDayLog(seedMeals: MealRecord[]) {
  pendingSeed = seedMeals;
  if (!initialized && snapshot.persistence.mode === "unknown") {
    setMeals(seedMeals, { status: snapshot.persistence.status });
  }
}

export function addMealRecord(input: MealRecord): Promise<MutationResult<MealRecord>> {
  const meal = normalizeMealIds(input);
  return mutate(
    (current) => [...current.filter((candidate) => candidate.id !== meal.id), meal],
    () => jsonRequest("POST", { date, meal }),
    meal,
  );
}

export function duplicateMeal(mealId: string): Promise<MutationResult<MealRecord | null>> {
  const source = snapshot.meals.find((candidate) => candidate.id === resolveMealId(mealId));
  if (!source) return Promise.resolve({ ok: true, value: null });
  const duplicated: MealRecord = {
    ...source,
    id: newUuid(),
    name: `${source.name} copy`,
    loggedAt: new Date().toISOString(),
    items: source.items.map((item) => ({ ...item, id: newUuid() })),
  };
  return mutate(
    (current) => [...current, duplicated],
    () => jsonRequest("POST", { date, meal: duplicated }),
    duplicated,
  );
}

export function replaceMeal(mealId: string, input: MealRecord) {
  const resolvedId = resolveMealId(mealId);
  const meal = normalizeMealIds({ ...input, id: resolvedId });
  return mutate(
    (current) => current.map((candidate) => (candidate.id === resolvedId ? meal : candidate)),
    () => jsonRequest("POST", { date, meal }),
    meal,
  );
}

export function updateMealItem(
  mealId: string,
  itemId: string,
  patch: Partial<Omit<MealItem, "id">>,
) {
  const resolvedId = resolveMealId(mealId);
  return mutate(
    (current) => current.map((meal) =>
      meal.id !== resolvedId
        ? meal
        : {
            ...meal,
            items: meal.items.map((item) => item.id === itemId ? { ...item, ...patch } : item),
          },
    ),
    () => jsonRequest("PATCH", { date, mealId: resolvedId, itemId, patch }),
    undefined,
  );
}

export function removeMeal(mealId: string) {
  const resolvedId = resolveMealId(mealId);
  return mutate(
    (current) => current.filter((meal) => meal.id !== resolvedId),
    () => jsonRequest("DELETE", { date, mealId: resolvedId }),
    undefined,
  );
}

export async function resetDayLog(): Promise<MutationResult<void>> {
  if (!(await initializeDayLog())) {
    return { ok: false, error: snapshot.persistence.error || "Day log did not initialize." };
  }
  if (snapshot.persistence.mode !== "preview") {
    const message = "Reset is available only for the local preview day log.";
    setMeals(snapshot.meals, { status: "error", error: message });
    return { ok: false, error: message };
  }
  writeCache(previewCacheKey(date), SAMPLE_MEALS);
  setMeals(SAMPLE_MEALS, { status: "saved", error: null });
  return { ok: true, value: undefined };
}

export function getDayLogSnapshot() {
  return snapshot;
}

export function useDayLog() {
  useEffect(() => {
    void initializeDayLog();
  }, []);

  const current = useSyncExternalStore(subscribe, getDayLogSnapshot, () => serverSnapshot);
  const totals: MacroTotals = sumMeals(current.meals);
  const targets: MacroTargets = SAMPLE_TARGETS;

  return {
    meals: current.meals,
    totals,
    targets,
    persistence: current.persistence,
    addMeal,
    duplicateMeal,
    hydrateDayLog,
    updateMealItem,
    removeMeal,
    resetDayLog,
  };
}
