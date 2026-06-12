import { sumMeals, type MealRecord } from "@/lib/fuelwell-data";
import { applySnapshotMutation } from "@/lib/coach/apply-mutation";
import type { CoachDaySnapshot, CoachMutation, ToolContext } from "@/lib/coach/types";

let userCounter = 0;

export function makeSnapshot(overrides: Partial<CoachDaySnapshot> = {}): CoachDaySnapshot {
  const loggedAt = new Date().toISOString();
  const meals: MealRecord[] = [
    {
      id: "sample-breakfast",
      mealType: "breakfast",
      name: "Greek yogurt bowl",
      loggedAt,
      items: [
        {
          id: "item-1",
          name: "Greek yogurt with berries",
          servings: 1,
          calories: 320,
          protein: 28,
          carbs: 30,
          fat: 9,
        },
      ],
    },
    {
      id: "sample-lunch",
      mealType: "lunch",
      name: "Chicken rice bowl",
      loggedAt,
      items: [
        {
          id: "item-2",
          name: "Chicken breast",
          servings: 1,
          calories: 330,
          protein: 43,
          carbs: 0,
          fat: 7,
        },
        { id: "item-3", name: "Rice", servings: 1, calories: 260, protein: 5, carbs: 56, fat: 1 },
      ],
    },
  ];
  return {
    date: new Date().toISOString().slice(0, 10),
    meals,
    totals: sumMeals(meals),
    targets: { calories: 2250, protein: 175, carbs: 240, fat: 75 },
    workouts: [
      {
        id: "sample-workout",
        name: "Morning run",
        category: "cardio",
        durationMin: 30,
        loggedAt,
      },
    ],
    grocery: [
      { id: "g-1", name: "Eggs", checked: false },
      { id: "g-2", name: "Spinach", checked: true },
      { id: "g-3", name: "Greek yogurt", checked: false },
    ],
    bodyLog: [],
    preferences: {
      diets: [],
      allergies: ["Shellfish"],
      likes: [],
      dislikes: [],
      units: "metric",
    },
    profile: {
      displayName: "Sam",
      goal: "maintain",
      activityLevel: "moderate",
      weightKg: 78,
      heightCm: 178,
    },
    ...overrides,
  };
}

export function makeCtx(
  overrides: Partial<CoachDaySnapshot> = {},
  userId?: string,
): { ctx: ToolContext; applied: CoachMutation[] } {
  const snapshot = makeSnapshot(overrides);
  const applied: CoachMutation[] = [];
  let artifactN = 0;
  const ctx: ToolContext = {
    snapshot,
    userId: userId ?? `test-user-${++userCounter}`,
    isPreview: true,
    applyMutation: (m) => {
      applied.push(m);
      applySnapshotMutation(snapshot, m);
    },
    newArtifactId: () => `art-${++artifactN}`,
  };
  return { ctx, applied };
}
