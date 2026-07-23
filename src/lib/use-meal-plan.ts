"use client";

import { useEffect, useSyncExternalStore } from "react";
import { RECIPES, type Recipe } from "@/lib/recipes-data";

export type PlanSlot = Recipe["meal"];

export type PlannedMealStatus = "planned" | "logged" | "open" | "added";

export type PlannedMeal = {
  slot: PlanSlot;
  /** id into RECIPES so plan rows can open the real recipe detail */
  recipeId?: string;
  title: string;
  calories: number;
  protein: number;
  prep: string;
  status: PlannedMealStatus;
};

export type PlanDay = {
  id: string;
  label: string;
  date: string;
  /** ISO yyyy-mm-dd, so surfaces can mark "today" */
  iso: string;
  focus: string;
  meals: PlannedMeal[];
};

export const PLAN_SLOTS: PlanSlot[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

/**
 * Seed plan referenced by recipe id — titles/macros/prep derive from the
 * recipe library so the plan never shows numbers the recipe dialog disagrees
 * with. Statuses mirror the sample day log (Mon breakfast + lunch logged).
 */
const SEED_SPECS: Array<{
  id: string;
  offset: number;
  focus: string;
  meals: Array<{ slot: PlanSlot; recipeId: string; status: PlannedMealStatus }>;
}> = [
  {
    id: "mon",
    offset: 0,
    focus: "Training day",
    meals: [
      { slot: "Breakfast", recipeId: "greek-yogurt-power-bowl", status: "logged" },
      { slot: "Lunch", recipeId: "chicken-quinoa-bowl", status: "logged" },
      { slot: "Dinner", recipeId: "salmon-rice-plate", status: "planned" },
      { slot: "Snack", recipeId: "cottage-cheese-toast", status: "planned" },
    ],
  },
  {
    id: "tue",
    offset: 1,
    focus: "Light carbs",
    meals: [
      { slot: "Breakfast", recipeId: "egg-white-oat-cakes", status: "planned" },
      { slot: "Lunch", recipeId: "chicken-salad-classic", status: "planned" },
      { slot: "Dinner", recipeId: "shrimp-zucchini-noodles", status: "open" },
      { slot: "Snack", recipeId: "protein-shake-pb-banana", status: "planned" },
    ],
  },
  {
    id: "wed",
    offset: 2,
    focus: "Busy day",
    meals: [
      { slot: "Breakfast", recipeId: "chicken-breakfast-skillet-speedy", status: "planned" },
      { slot: "Lunch", recipeId: "turkey-avocado-wrap", status: "planned" },
      { slot: "Dinner", recipeId: "chicken-sheet-pan-speedy", status: "planned" },
      { slot: "Snack", recipeId: "chicken-protein-snack-classic", status: "open" },
    ],
  },
  {
    id: "thu",
    offset: 3,
    focus: "Recovery",
    meals: [
      { slot: "Breakfast", recipeId: "veggie-tofu-scramble", status: "planned" },
      { slot: "Lunch", recipeId: "chickpea-power-salad", status: "open" },
      { slot: "Dinner", recipeId: "steak-sweet-potato", status: "planned" },
      { slot: "Snack", recipeId: "cottage-cheese-toast", status: "planned" },
    ],
  },
];

export function plannedMealFromRecipe(
  slot: PlanSlot,
  recipe: Recipe,
  status: PlannedMealStatus,
): PlannedMeal {
  return {
    slot,
    recipeId: recipe.id,
    title: recipe.title,
    calories: recipe.perServing.calories,
    protein: recipe.perServing.protein,
    prep: `${recipe.minutes} min`,
    status,
  };
}

function mondayOfCurrentWeek(now = new Date()): Date {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function isoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Seed dates are generated from the real current week (audit M1). */
export function buildSeedDays(now = new Date()): PlanDay[] {
  const monday = mondayOfCurrentWeek(now);
  return SEED_SPECS.map((spec) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + spec.offset);
    return {
      id: spec.id,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iso: isoDate(date),
      focus: spec.focus,
      meals: spec.meals.flatMap((meal) => {
        const recipe = RECIPES.find((candidate) => candidate.id === meal.recipeId);
        return recipe ? [plannedMealFromRecipe(meal.slot, recipe, meal.status)] : [];
      }),
    };
  });
}

const STORAGE_KEY = `fuelwell-meal-plan-v1:${isoDate(mondayOfCurrentWeek())}`;

let snapshot: PlanDay[] = buildSeedDays();
const serverSnapshot = snapshot;
const listeners = new Set<() => void>();
let initialized = false;

function emit(next: PlanDay[]) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function isValidDays(candidate: unknown): candidate is PlanDay[] {
  return (
    Array.isArray(candidate) &&
    candidate.length > 0 &&
    candidate.every(
      (day) =>
        day &&
        typeof day.id === "string" &&
        typeof day.iso === "string" &&
        Array.isArray(day.meals) &&
        day.meals.every(
          (meal: PlannedMeal) =>
            meal && typeof meal.title === "string" && typeof meal.slot === "string",
        ),
    )
  );
}

function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const cached = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (isValidDays(cached)) emit(cached);
  } catch {
    // Malformed cache — keep the generated seed.
  }
}

function persist(next: PlanDay[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Best-effort local persistence; the in-memory plan stays authoritative.
  }
}

export function setPlanMeal(dayId: string, slot: PlanSlot, meal: PlannedMeal) {
  const next = snapshot.map((day) =>
    day.id === dayId
      ? { ...day, meals: day.meals.map((candidate) => (candidate.slot === slot ? meal : candidate)) }
      : day,
  );
  emit(next);
  persist(next);
}

/**
 * Pick a recipe for a slot, excluding titles already on that day (audit M4)
 * and preferring lean-protein options. `offset` rotates through the ranked
 * pool so repeated swaps do not return the same suggestion.
 */
export function suggestRecipeForSlot(
  slot: PlanSlot,
  excludeTitles: Iterable<string>,
  offset = 0,
): Recipe | undefined {
  const excluded = new Set([...excludeTitles].map((title) => title.toLowerCase()));
  const pool = RECIPES.filter(
    (recipe) => recipe.meal === slot && !excluded.has(recipe.title.toLowerCase()),
  );
  if (pool.length === 0) return undefined;
  const lean = pool.filter((recipe) => recipe.perServing.protein >= 25);
  const ranked = (lean.length > 0 ? lean : pool)
    .slice()
    .sort((a, b) => b.perServing.protein - a.perServing.protein);
  return ranked[offset % ranked.length];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useMealPlan() {
  useEffect(() => {
    initialize();
  }, []);
  const days = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  return { days, setPlanMeal };
}
