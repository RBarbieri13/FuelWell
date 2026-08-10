"use client";

import { useEffect, useSyncExternalStore } from "react";
import { RECIPES, type Recipe } from "@/lib/recipes-data";
import {
  planDaysSchema,
  type PlanDay,
  type PlannedMeal,
  type PlannedMealStatus,
  type PlanSlot,
} from "@/lib/meal-plan-types";

export type { PlanDay, PlannedMeal, PlannedMealStatus, PlanSlot } from "@/lib/meal-plan-types";

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

const PREVIEW_CACHE_PREFIX = "fuelwell-meal-plan-preview-v2";
const USER_CACHE_PREFIX = "fuelwell-meal-plan-user-v2";
const weekStart = isoDate(mondayOfCurrentWeek());

type MealPlanMode = "unknown" | "preview" | "authenticated";
type MealPlanStatus = "idle" | "loading" | "saving" | "saved" | "error";

export type MealPlanPersistence = {
  mode: MealPlanMode;
  status: MealPlanStatus;
  userId: string | null;
  weekStart: string;
  error: string | null;
};

type MealPlanSnapshot = {
  days: PlanDay[];
  persistence: MealPlanPersistence;
};

type MealPlanResponse = {
  signedIn: boolean;
  userId?: string;
  weekStart?: string;
  days: PlanDay[];
  error?: string;
};

export type MealPlanMutationResult =
  | { ok: true; value: PlanDay[] }
  | { ok: false; error: string };

let snapshot: MealPlanSnapshot = {
  days: buildSeedDays(),
  persistence: {
    mode: "unknown",
    status: "idle",
    userId: null,
    weekStart,
    error: null,
  },
};
const serverSnapshot = snapshot;
const listeners = new Set<() => void>();
let initialized = false;
let initializePromise: Promise<boolean> | null = null;
let mutationQueue: Promise<void> = Promise.resolve();
let storeEpoch = 0;

function emit(next: MealPlanSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function setDays(days: PlanDay[], patch: Partial<MealPlanPersistence> = {}) {
  emit({
    days,
    persistence: { ...snapshot.persistence, ...patch },
  });
}

function previewCacheKey() {
  return `${PREVIEW_CACHE_PREFIX}:${weekStart}`;
}

export function mealPlanUserCachePrefix(userId: string) {
  return `${USER_CACHE_PREFIX}:${userId}:`;
}

function userCacheKey(userId: string) {
  return `${mealPlanUserCachePrefix(userId)}${weekStart}`;
}

function readCache(key: string): PlanDay[] | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(window.localStorage.getItem(key) ?? "null") as {
      days?: unknown;
    } | null;
    const parsed = planDaysSchema.safeParse(cached?.days);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, days: PlanDay[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ weekStart, days }));
  } catch {
    // Signed-in server state remains authoritative; preview persistence is best effort.
  }
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Meal plan persistence failed.";
}

async function readResponse(response: Response): Promise<MealPlanResponse> {
  const body = (await response.json().catch(() => ({}))) as Partial<MealPlanResponse>;
  if (!response.ok) throw new Error(body.error || `Meal plan request failed (${response.status}).`);
  const parsedDays = planDaysSchema.safeParse(body.days);
  if (!parsedDays.success) throw new Error("Meal plan response was incomplete.");
  return { ...body, days: parsedDays.data, signedIn: body.signedIn === true };
}

export async function initializeMealPlan(): Promise<boolean> {
  if (initialized) return true;
  if (initializePromise) return initializePromise;

  const epoch = storeEpoch;
  setDays(snapshot.days, { status: "loading", error: null });
  initializePromise = (async () => {
    try {
      const response = await fetch(
        `/api/meal-plan?weekStart=${encodeURIComponent(weekStart)}`,
        { cache: "no-store" },
      );
      const body = await readResponse(response);
      if (epoch !== storeEpoch) return false;

      if (body.signedIn) {
        if (!body.userId || body.weekStart !== weekStart) {
          throw new Error("Authenticated meal plan response omitted its owner or week.");
        }
        initialized = true;
        writeCache(userCacheKey(body.userId), body.days);
        setDays(body.days, {
          mode: "authenticated",
          status: "saved",
          userId: body.userId,
          error: null,
        });
        return true;
      }

      initialized = true;
      const previewDays = readCache(previewCacheKey()) ?? buildSeedDays();
      writeCache(previewCacheKey(), previewDays);
      setDays(previewDays, {
        mode: "preview",
        status: "saved",
        userId: null,
        error: null,
      });
      return true;
    } catch (error) {
      if (epoch === storeEpoch) {
        setDays(snapshot.days, {
          mode: "unknown",
          status: "error",
          userId: null,
          error: errorText(error),
        });
      }
      return false;
    } finally {
      if (epoch === storeEpoch) initializePromise = null;
    }
  })();
  return initializePromise;
}

function enqueue(operation: () => Promise<MealPlanMutationResult>) {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function replacePlan(transform: (current: PlanDay[]) => PlanDay[]): Promise<MealPlanMutationResult> {
  return enqueue(async () => {
    if (!(await initializeMealPlan())) {
      return { ok: false, error: snapshot.persistence.error || "Meal plan did not initialize." };
    }

    const before = snapshot.days;
    const parsed = planDaysSchema.safeParse(transform(before));
    if (!parsed.success) return { ok: false, error: "Meal plan update was invalid." };
    const next = parsed.data;
    setDays(next, { status: "saving", error: null });

    if (snapshot.persistence.mode === "preview") {
      writeCache(previewCacheKey(), next);
      setDays(next, { status: "saved", error: null });
      return { ok: true, value: next };
    }

    const expectedUserId = snapshot.persistence.userId;
    if (snapshot.persistence.mode !== "authenticated" || !expectedUserId) {
      const message = "Authentication state is unknown; meal plan was not persisted.";
      setDays(before, { status: "error", error: message });
      return { ok: false, error: message };
    }

    try {
      const body = await readResponse(await fetch("/api/meal-plan", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ weekStart, days: next }),
      }));
      if (
        !body.signedIn ||
        body.userId !== expectedUserId ||
        body.weekStart !== weekStart
      ) {
        throw new Error("Authenticated meal plan response did not match the current user.");
      }
      writeCache(userCacheKey(expectedUserId), body.days);
      setDays(body.days, { status: "saved", error: null });
      return { ok: true, value: body.days };
    } catch (error) {
      const message = errorText(error);
      setDays(before, { status: "error", error: message });
      return { ok: false, error: message };
    }
  });
}

export function setPlanMeal(dayId: string, slot: PlanSlot, meal: PlannedMeal) {
  return replacePlan((current) => current.map((day) =>
    day.id === dayId
      ? {
          ...day,
          meals: day.meals.map((candidate) => candidate.slot === slot ? meal : candidate),
        }
      : day,
  ));
}

export function createStarterMealPlan() {
  return replacePlan(() => buildSeedDays());
}

export function clearMealPlanCacheForUser(userId: string) {
  if (typeof window === "undefined") return;
  try {
    const prefix = mealPlanUserCachePrefix(userId);
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) window.localStorage.removeItem(key);
    }
  } finally {
    if (snapshot.persistence.userId === userId) {
      storeEpoch += 1;
      initialized = false;
      initializePromise = null;
      mutationQueue = Promise.resolve();
      setDays(buildSeedDays(), {
        mode: "unknown",
        status: "idle",
        userId: null,
        error: null,
      });
    }
  }
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

export function getMealPlanSnapshot() {
  return snapshot;
}

export function useMealPlan() {
  useEffect(() => {
    void initializeMealPlan();
  }, []);
  const current = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  return {
    days: current.days,
    persistence: current.persistence,
    setPlanMeal,
    createStarterMealPlan,
  };
}
