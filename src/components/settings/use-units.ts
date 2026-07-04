"use client";

/**
 * useUnits — persisted metric/imperial preference for the Settings page.
 *
 * Settings owns this key. A module-level store + useSyncExternalStore keeps any
 * mounted consumer in sync, mirroring the usePreferences pattern. This only
 * records the user's display preference; it does not convert other screens.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "fuelwell-units-v1";

export type UnitSystem = "metric" | "imperial";

const DEFAULT: UnitSystem = "metric";

function loadInitial(): UnitSystem {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "metric" || raw === "imperial") return raw;
  } catch {
    // fall through
  }
  return DEFAULT;
}

let state: UnitSystem = loadInitial();
const listeners = new Set<() => void>();

function persist(next: UnitSystem) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
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

export function setUnits(next: UnitSystem) {
  persist(next);
}

export function useUnits() {
  const units = useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULT
  );

  return { units, setUnits };
}
