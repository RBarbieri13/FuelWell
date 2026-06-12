import type { CoachDaySnapshot, CoachMutation } from "./types";
import { sumMeals } from "@/lib/fuelwell-data";

/**
 * Applies a mutation to the in-turn snapshot draft so later tool calls in the
 * same turn see earlier writes. The client applies the same mutations to the
 * real stores (useDayLog etc.) when it receives the `mutation` SSE event.
 */
export function applySnapshotMutation(snapshot: CoachDaySnapshot, m: CoachMutation): void {
  switch (m.kind) {
    case "add_meal":
      snapshot.meals = [...snapshot.meals, m.meal];
      break;
    case "update_meal":
      snapshot.meals = snapshot.meals.map((meal) => (meal.id === m.mealId ? m.meal : meal));
      break;
    case "remove_meal":
      snapshot.meals = snapshot.meals.filter((meal) => meal.id !== m.mealId);
      break;
    case "add_workout":
      snapshot.workouts = [...snapshot.workouts, m.workout];
      break;
    case "remove_workout":
      snapshot.workouts = snapshot.workouts.filter((w) => w.id !== m.workoutId);
      break;
    case "set_grocery":
      snapshot.grocery = m.items;
      break;
    case "add_body_log":
      snapshot.bodyLog = [...snapshot.bodyLog, m.entry];
      break;
    case "set_preferences":
      snapshot.preferences = { ...snapshot.preferences, ...m.patch };
      break;
  }
  snapshot.totals = sumMeals(snapshot.meals);
}
