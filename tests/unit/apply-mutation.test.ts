import { describe, expect, it } from "vitest";
import { applySnapshotMutation } from "@/lib/coach/apply-mutation";
import { sumMeals, type MealRecord } from "@/lib/fuelwell-data";
import { makeSnapshot } from "./helpers";

const newMeal: MealRecord = {
  id: "m-new",
  mealType: "dinner",
  name: "Salmon plate",
  loggedAt: new Date().toISOString(),
  items: [
    { id: "i-new", name: "Salmon", servings: 1, calories: 400, protein: 35, carbs: 5, fat: 20 },
  ],
};

describe("applySnapshotMutation", () => {
  it("add_meal appends the meal and recomputes totals", () => {
    const snapshot = makeSnapshot();
    const before = snapshot.totals;
    applySnapshotMutation(snapshot, { kind: "add_meal", meal: newMeal });
    expect(snapshot.meals.map((m) => m.id)).toContain("m-new");
    expect(snapshot.meals).toHaveLength(3);
    expect(snapshot.totals.calories).toBe(before.calories + 400);
    expect(snapshot.totals.protein).toBe(before.protein + 35);
    expect(snapshot.totals).toEqual(sumMeals(snapshot.meals));
  });

  it("update_meal replaces the matching meal and recomputes totals", () => {
    const snapshot = makeSnapshot();
    const replacement: MealRecord = {
      ...snapshot.meals[1],
      name: "Lighter lunch",
      items: [
        { id: "i-x", name: "Salad", servings: 1, calories: 250, protein: 12, carbs: 20, fat: 14 },
      ],
    };
    applySnapshotMutation(snapshot, {
      kind: "update_meal",
      mealId: "sample-lunch",
      meal: replacement,
    });
    expect(snapshot.meals).toHaveLength(2);
    const lunch = snapshot.meals.find((m) => m.id === "sample-lunch");
    expect(lunch?.name).toBe("Lighter lunch");
    expect(snapshot.totals).toEqual(sumMeals(snapshot.meals));
    expect(snapshot.totals.calories).toBe(320 + 250);
  });

  it("remove_meal drops the meal and recomputes totals", () => {
    const snapshot = makeSnapshot();
    applySnapshotMutation(snapshot, { kind: "remove_meal", mealId: "sample-lunch" });
    expect(snapshot.meals.map((m) => m.id)).toEqual(["sample-breakfast"]);
    expect(snapshot.totals).toEqual(sumMeals(snapshot.meals));
    expect(snapshot.totals.calories).toBe(320);
  });

  it("add_workout appends the workout", () => {
    const snapshot = makeSnapshot();
    applySnapshotMutation(snapshot, {
      kind: "add_workout",
      workout: {
        id: "w-new",
        name: "Push day",
        category: "strength",
        durationMin: 45,
        loggedAt: new Date().toISOString(),
      },
    });
    expect(snapshot.workouts.map((w) => w.id)).toEqual(["sample-workout", "w-new"]);
  });

  it("remove_workout drops the workout", () => {
    const snapshot = makeSnapshot();
    applySnapshotMutation(snapshot, { kind: "remove_workout", workoutId: "sample-workout" });
    expect(snapshot.workouts).toEqual([]);
  });

  it("set_grocery replaces the grocery list wholesale", () => {
    const snapshot = makeSnapshot();
    const items = [{ id: "g-9", name: "Oats", checked: false }];
    applySnapshotMutation(snapshot, { kind: "set_grocery", items });
    expect(snapshot.grocery).toEqual(items);
  });

  it("add_body_log appends the entry", () => {
    const snapshot = makeSnapshot();
    applySnapshotMutation(snapshot, {
      kind: "add_body_log",
      entry: { date: snapshot.date, weightKg: 77.5 },
    });
    expect(snapshot.bodyLog).toEqual([{ date: snapshot.date, weightKg: 77.5 }]);
  });

  it("set_preferences merges the patch without clobbering other fields", () => {
    const snapshot = makeSnapshot();
    applySnapshotMutation(snapshot, {
      kind: "set_preferences",
      patch: { diets: ["vegetarian"], units: "imperial" },
    });
    expect(snapshot.preferences.diets).toEqual(["vegetarian"]);
    expect(snapshot.preferences.units).toBe("imperial");
    expect(snapshot.preferences.allergies).toEqual(["Shellfish"]);
  });

  it("meal mutations keep totals consistent across a sequence", () => {
    const snapshot = makeSnapshot();
    applySnapshotMutation(snapshot, { kind: "add_meal", meal: newMeal });
    applySnapshotMutation(snapshot, { kind: "remove_meal", mealId: "sample-breakfast" });
    expect(snapshot.totals).toEqual(sumMeals(snapshot.meals));
  });
});
