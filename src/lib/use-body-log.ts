"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { BodyLogEntry } from "@/lib/coach/types";
import { todayIsoDate } from "@/lib/fuelwell-data";
import type { MutationResult } from "@/lib/use-day-log";

const LEGACY_STORAGE_KEY = "fuelwell-body-log-v1";
const PREVIEW_CACHE_PREFIX = "fuelwell-body-log-preview-v2";
const USER_CACHE_PREFIX = "fuelwell-body-log-user-v2";

type BodyLogMode = "unknown" | "preview" | "authenticated";
type PersistenceStatus = "idle" | "loading" | "saving" | "saved" | "error";

export type BodyLogPersistence = {
  mode: BodyLogMode;
  status: PersistenceStatus;
  userId: string | null;
  date: string;
  error: string | null;
};

type BodyLogSnapshot = {
  entries: BodyLogEntry[];
  persistence: BodyLogPersistence;
};

type BodyLogResponse = {
  signedIn: boolean;
  userId?: string;
  entries: BodyLogEntry[];
  error?: string;
};

const date = todayIsoDate();
const listeners = new Set<() => void>();
const EMPTY: BodyLogEntry[] = [];
let initialized = false;
let initializePromise: Promise<boolean> | null = null;
let mutationQueue: Promise<unknown> = Promise.resolve();
let snapshot: BodyLogSnapshot = {
  entries: EMPTY,
  persistence: { mode: "unknown", status: "idle", userId: null, date, error: null },
};
const serverSnapshot = snapshot;

function previewCacheKey(day: string) {
  return `${PREVIEW_CACHE_PREFIX}:${day}`;
}

function userCacheKey(userId: string, day: string) {
  return `${USER_CACHE_PREFIX}:${userId}:${day}`;
}

function emit(next: BodyLogSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function setEntries(entries: BodyLogEntry[], persistence: Partial<BodyLogPersistence> = {}) {
  emit({ entries, persistence: { ...snapshot.persistence, ...persistence } });
}

function readCache(key: string): BodyLogEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as
      | BodyLogEntry[]
      | { entries?: BodyLogEntry[] }
      | null;
    if (Array.isArray(parsed)) return parsed;
    return parsed && Array.isArray(parsed.entries) ? parsed.entries : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, entries: BodyLogEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ date, entries }));
  } catch {
    // The authenticated server remains authoritative; cache failure is non-fatal.
  }
}

function mergeEntry(entries: BodyLogEntry[], entry: BodyLogEntry) {
  const existing = entries.find((candidate) => candidate.date === entry.date);
  const merged = existing ? { ...existing, ...entry, date: entry.date } : entry;
  return [...entries.filter((candidate) => candidate.date !== entry.date), merged]
    .sort((a, b) => a.date.localeCompare(b.date));
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Body log persistence failed.";
}

async function readResponse(response: Response): Promise<BodyLogResponse> {
  const body = (await response.json().catch(() => ({}))) as Partial<BodyLogResponse>;
  if (!response.ok) {
    throw new Error(body.error || `Body log persistence failed (${response.status}).`);
  }
  if (!Array.isArray(body.entries)) throw new Error("Body log response was incomplete.");
  return body as BodyLogResponse;
}

export async function initializeBodyLog(): Promise<boolean> {
  if (initialized) return true;
  if (initializePromise) return initializePromise;
  setEntries(snapshot.entries, { status: "loading", error: null });
  initializePromise = (async () => {
    try {
      const body = await readResponse(await fetch("/api/body-log", { cache: "no-store" }));
      if (body.signedIn) {
        if (!body.userId) throw new Error("Authenticated body log response omitted the user.");
        initialized = true;
        writeCache(userCacheKey(body.userId, date), body.entries);
        setEntries(body.entries, {
          mode: "authenticated",
          status: "saved",
          userId: body.userId,
          error: null,
        });
        return true;
      }

      initialized = true;
      const previewEntries =
        readCache(previewCacheKey(date)) ?? readCache(LEGACY_STORAGE_KEY) ?? EMPTY;
      writeCache(previewCacheKey(date), previewEntries);
      setEntries(previewEntries, {
        mode: "preview",
        status: "saved",
        userId: null,
        error: null,
      });
      return true;
    } catch (error) {
      setEntries(snapshot.entries, {
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

export function addBodyLogEntry(entry: BodyLogEntry): Promise<MutationResult<BodyLogEntry>> {
  const idempotencyKey = crypto.randomUUID();
  return enqueue(async () => {
    if (!(await initializeBodyLog())) {
      return { ok: false, error: snapshot.persistence.error || "Body log did not initialize." };
    }
    const before = snapshot.entries;
    const optimisticEntries = mergeEntry(before, entry);
    setEntries(optimisticEntries, { status: "saving", error: null });

    if (snapshot.persistence.mode === "preview") {
      writeCache(previewCacheKey(date), optimisticEntries);
      setEntries(optimisticEntries, { status: "saved", error: null });
      return { ok: true, value: entry };
    }
    if (snapshot.persistence.mode !== "authenticated" || !snapshot.persistence.userId) {
      const message = "Authentication state is unknown; body log was not persisted.";
      setEntries(before, { status: "error", error: message });
      return { ok: false, error: message };
    }

    try {
      const body = await readResponse(await fetch("/api/body-log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotencyKey, entry }),
      }));
      if (!body.signedIn || body.userId !== snapshot.persistence.userId) {
        throw new Error("Authenticated body log response did not match the current user.");
      }
      writeCache(userCacheKey(body.userId, date), body.entries);
      setEntries(body.entries, { status: "saved", error: null });
      return { ok: true, value: entry };
    } catch (error) {
      const message = errorText(error);
      setEntries(before, { status: "error", error: message });
      return { ok: false, error: message };
    }
  });
}

export function getBodyLogSnapshot() {
  return snapshot;
}

export function useBodyLog() {
  useEffect(() => {
    void initializeBodyLog();
  }, []);
  const current = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
  return {
    entries: current.entries,
    addBodyLogEntry,
    persistence: current.persistence,
  };
}
