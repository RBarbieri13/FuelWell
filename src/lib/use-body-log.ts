"use client";

/** Shared persisted body log (weight / mood / water) — useDayLog pattern. */

import { useSyncExternalStore } from "react";
import type { BodyLogEntry } from "@/lib/coach/types";

const STORAGE_KEY = "fuelwell-body-log-v1";

function loadInitial(): BodyLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BodyLogEntry[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fall through
  }
  return [];
}

let entries: BodyLogEntry[] = loadInitial();
const listeners = new Set<() => void>();
const EMPTY: BodyLogEntry[] = [];

function persist(next: BodyLogEntry[]) {
  entries = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // best-effort
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addBodyLogEntry(entry: BodyLogEntry) {
  persist([...entries, entry]);
}

export function useBodyLog() {
  const current = useSyncExternalStore(subscribe, () => entries, () => EMPTY);
  return { entries: current, addBodyLogEntry };
}
