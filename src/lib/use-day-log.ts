"use client";

/**
 * useDayLog — the client-side source of truth for "today's" logged meals.
 *
 * Dashboard/nutrition are server-rendered from Supabase (or SAMPLE_MEALS in
 * preview). This hook gives the interactive surfaces (Log, Coach) one shared,
 * persisted store so a meal added on Log or logged from Coach updates the same
 * totals everywhere those surfaces read. Built on a module-level store +
 * useSyncExternalStore so every mounted consumer stays in sync.
 *
 * Persistence is localStorage, scoped to today's date — a new day starts from
 * the sample seed so the preview is never blank.
 */

import { useSyncExternalStore } from "react";
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

const STORAGE_KEY = "fuelwell-day-log-v1";

type StoredDay = { date: string; meals: MealRecord[] };

function loadInitial(): MealRecord[] {
  const today = todayIsoDate();
  if (typeof window === "undefined") return SAMPLE_MEALS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredDay;
      if (parsed.date === today && Array.isArray(parsed.meals)) return parsed.meals;
    }
  } catch {
    // fall through to seed
  }
  return SAMPLE_MEALS;
}

let meals: MealRecord[] = loadInitial();
const listeners = new Set<() => void>();

function persist(next: MealRecord[]) {
  meals = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayIsoDate(), meals: next } satisfies StoredDay)
      );
    } catch {
      // best-effort persistence only
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}-${todayIsoDate()}`;
}

export type NewMealInput = {
  mealType: MealType;
  name: string;
  items: Array<Omit<MealItem, "id">>;
};

export function addMeal(input: NewMealInput): MealRecord {
  const meal: MealRecord = {
    id: nextId("meal"),
    mealType: input.mealType,
    name: input.name,
    loggedAt: new Date().toISOString(),
    items: input.items.map((item) => ({ ...item, id: nextId("item") })),
  };
  persist([...meals, meal]);
  return meal;
}

/** Add a fully-built MealRecord (Coach tools issue their own ids). */
export function addMealRecord(meal: MealRecord) {
  persist([...meals, meal]);
}

export function replaceMeal(mealId: string, next: MealRecord) {
  persist(meals.map((meal) => (meal.id === mealId ? next : meal)));
}

export function updateMealItem(
  mealId: string,
  itemId: string,
  patch: Partial<Omit<MealItem, "id">>
) {
  persist(
    meals.map((meal) =>
      meal.id !== mealId
        ? meal
        : {
            ...meal,
            items: meal.items.map((item) =>
              item.id === itemId ? { ...item, ...patch } : item
            ),
          }
    )
  );
}

export function removeMeal(mealId: string) {
  persist(meals.filter((meal) => meal.id !== mealId));
}

export function resetDayLog() {
  persist(SAMPLE_MEALS);
}

/**
 * useDayLog — reactive view of the shared day log. Returns meals, derived
 * totals, targets, and the mutators (re-exported for convenience).
 */
export function useDayLog() {
  const current = useSyncExternalStore(
    subscribe,
    () => meals,
    () => SAMPLE_MEALS
  );

  const totals: MacroTotals = sumMeals(current);
  const targets: MacroTargets = SAMPLE_TARGETS;

  return {
    meals: current,
    totals,
    targets,
    addMeal,
    updateMealItem,
    removeMeal,
    resetDayLog,
  };
}
