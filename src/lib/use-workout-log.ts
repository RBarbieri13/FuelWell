"use client";

/**
 * Shared persisted workout log — same module-store pattern as useDayLog.
 * Coach tool writes and the Workouts surface read/write the same list, so
 * a workout logged in chat shows up everywhere (D-gate).
 */

import { useSyncExternalStore } from "react";
import type { WorkoutEntry } from "@/lib/coach/types";

const STORAGE_KEY = "fuelwell-workout-log-v1";

function loadInitial(): WorkoutEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkoutEntry[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fall through
  }
  return [];
}

let workouts: WorkoutEntry[] = loadInitial();
const listeners = new Set<() => void>();
const EMPTY: WorkoutEntry[] = [];

function persist(next: WorkoutEntry[]) {
  workouts = next;
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

export function addWorkout(entry: WorkoutEntry) {
  persist([...workouts, entry]);
}

export function removeWorkout(workoutId: string) {
  persist(workouts.filter((w) => w.id !== workoutId));
}

export function updateWorkout(workoutId: string, patch: Partial<WorkoutEntry>) {
  persist(
    workouts.map((workout) =>
      workout.id === workoutId
        ? {
            ...workout,
            ...patch,
            source: patch.source ?? "manual_edit",
          }
        : workout
    )
  );
}

export function useWorkoutLog() {
  const current = useSyncExternalStore(subscribe, () => workouts, () => EMPTY);
  return { workouts: current, addWorkout, removeWorkout, updateWorkout };
}
