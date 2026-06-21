import { describe, expect, it } from "vitest";
import "@/lib/coach/tools";
import { getTool } from "@/lib/coach/registry";
import { FOOD_COUNT, searchFoods } from "@/lib/food-database";
import { RECIPE_COUNT, searchRecipes } from "@/lib/recipes-data";
import { WORKOUT_COUNT, searchWorkouts, workouts } from "@/lib/workout-library";
import type { ToolRunResult } from "@/lib/coach/types";
import { makeCtx } from "./helpers";

describe("seed data verifier", () => {
  it("meets minimum seed counts", () => {
    expect(FOOD_COUNT).toBeGreaterThanOrEqual(500);
    expect(RECIPE_COUNT).toBeGreaterThanOrEqual(150);
    expect(WORKOUT_COUNT).toBeGreaterThanOrEqual(100);
  });

  it("keeps generated workout identifiers unique for stable app routes and React keys", () => {
    const ids = workouts.map((workout) => workout.id);
    expect(new Set(ids).size).toBe(ids.length);
    const titles = workouts.map((workout) => workout.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("supports useful autocomplete and closest-match search across domains", () => {
    expect(searchFoods("chikn", 5).map((food) => food.name).join(" ")).toMatch(/Chicken/i);
    expect(searchFoods("greek yog", 5)[0].name).toMatch(/Greek yogurt/i);

    expect(searchRecipes("chiken bowl").map((recipe) => recipe.title).join(" ")).toMatch(/Chicken/i);
    expect(searchRecipes("post workout smoothie").map((recipe) => recipe.title).join(" ")).toMatch(/smoothie/i);

    expect(searchWorkouts("mobility reset").map((workout) => workout.title).join(" ")).toMatch(/Mobility/i);
    expect(searchWorkouts("uppper pull").map((workout) => workout.title).join(" ")).toMatch(/Upper pull/i);
  });
});

describe("coach action verifier", () => {
  it("can create/update meal, grocery, workout, and plan state through safe tools", async () => {
    const { ctx } = makeCtx();

    const meal = (await getTool("log_custom_meal")!.run(
      { name: "Verifier dinner", kcal: 510, protein: 38, carbs: 52, fat: 14, meal_slot: "dinner" },
      ctx,
    )) as ToolRunResult;
    expect(meal.persisted).toBe(true);
    expect(meal.mutations?.[0]?.kind).toBe("add_meal");

    const grocery = (await getTool("add_grocery_item")!.run(
      { name: "Bananas" },
      ctx,
    )) as ToolRunResult;
    expect(grocery.persisted).toBe(true);
    expect(grocery.mutations?.[0]?.kind).toBe("set_grocery");

    const workout = (await getTool("log_workout")!.run(
      { name: "Verifier walk", duration_min: 25, category: "cardio", calories: 120 },
      ctx,
    )) as ToolRunResult;
    expect(workout.persisted).toBe(true);
    expect(workout.mutations?.[0]?.kind).toBe("add_workout");

    const plan = (await getTool("update_goal_plan")!.run(
      { primary_goal: "perform", target_calories: 2400, target_protein: 180 },
      ctx,
    )) as ToolRunResult;
    expect(plan.persisted).toBe(true);
    expect(plan.mutations?.[0]?.kind).toBe("set_goal_plan");
  });
});
