import { describe, expect, it } from "vitest";
import "@/lib/coach/tools";
import { getTool, listTools } from "@/lib/coach/registry";
import type { CoachMutation, ToolRunResult } from "@/lib/coach/types";
import { FOOD_DATABASE } from "@/lib/food-database";
import { RECIPES } from "@/lib/recipes-data";
import { makeCtx } from "./helpers";

const CHICKEN_ID = FOOD_DATABASE.find((f) => f.name === "Chicken breast, grilled")!.id;
const RECIPE_ID = RECIPES[0].id;

const MUTATION_KINDS = new Set<CoachMutation["kind"]>([
  "add_meal",
  "update_meal",
  "remove_meal",
  "add_workout",
  "remove_workout",
  "set_grocery",
  "add_body_log",
  "set_preferences",
  "set_goal_plan",
  "set_integration_summary",
]);

const SHELLFISH_RE = /shrimp|prawn|crab|lobster|scallop|mussel|oyster|clam|calamari|squid|octopus/i;

function runTool(name: string, input: unknown): Promise<ToolRunResult> | ToolRunResult {
  const tool = getTool(name);
  if (!tool) throw new Error(`tool not registered: ${name}`);
  const parsed = tool.schema.parse(input);
  return tool.run(parsed, makeCtx().ctx);
}

/** One representative valid + invalid input per registered tool. */
const SCHEMA_CASES: Record<string, { valid: unknown; invalid: unknown }> = {
  get_todays_plate: { valid: {}, invalid: 42 },
  get_goal_plan: { valid: {}, invalid: 42 },
  update_goal_plan: {
    valid: { primary_goal: "perform", protein_strategy: "performance", target_calories: 2400 },
    invalid: { primary_goal: "sleep-more" },
  },
  explain_goal_progress: { valid: { detail: true }, invalid: { detail: "yes" } },
  adapt_today_target: { valid: { reason: "Training day" }, invalid: { reason: 42 } },
  get_weekly_goal_review: { valid: {}, invalid: 42 },
  propose_target_change: {
    valid: {
      target_calories: 2350,
      target_protein: 180,
      target_carbs: 260,
      target_fat: 75,
      reason: "Several training days need more fuel.",
      evidence: ["Garmin shows higher active calories.", "Protein target is still stable."],
    },
    invalid: {
      target_calories: 2350,
      target_protein: 180,
      target_carbs: 260,
      target_fat: 75,
      reason: "short",
      evidence: [],
    },
  },
  search_foods: { valid: { query: "chicken" }, invalid: {} },
  log_meal: {
    valid: { food_id: CHICKEN_ID, portion: 140, meal_slot: "dinner" },
    invalid: { food_id: CHICKEN_ID, portion: 140, meal_slot: "brunch" },
  },
  log_custom_meal: {
    valid: { name: "Mom's lasagna", kcal: 620, protein: 32, carbs: 48, fat: 30, meal_slot: "dinner" },
    invalid: { name: "Mom's lasagna", protein: 32, carbs: 48, fat: 30, meal_slot: "dinner" },
  },
  edit_meal: {
    valid: { meal_id: "sample-lunch", patch: { kcal: 700 } },
    invalid: { meal_id: "sample-lunch", patch: { meal_slot: "brunch" } },
  },
  delete_meal: { valid: { meal_id: "sample-lunch" }, invalid: {} },
  suggest_meal: { valid: {}, invalid: { target_kcal: "lots" } },
  log_workout: {
    valid: { name: "Push day", duration_min: 45, category: "strength" },
    invalid: { name: "Push day", duration_min: 45, category: "dance" },
  },
  plan_workout: {
    valid: { focus: "push", duration_min: 40, equipment: "dumbbell" },
    invalid: { focus: "arms", duration_min: 40 },
  },
  start_workout_session: { valid: { plan_id: "some-plan" }, invalid: {} },
  delete_workout: { valid: { workout_id: "sample-workout" }, invalid: {} },
  log_set: { valid: { exercise: "Push-Up", weight_kg: 0, reps: 12 }, invalid: { exercise: "Push-Up", weight_kg: 0 } },
  end_workout_session: { valid: {}, invalid: 42 },
  suggest_workout: { valid: {}, invalid: 42 },
  search_recipes: { valid: { query: "chicken", max_minutes: 40 }, invalid: { diet: "keto" } },
  get_recipe_detail: { valid: { recipe_id: RECIPE_ID }, invalid: {} },
  log_recipe_as_meal: {
    valid: { recipe_id: RECIPE_ID, meal_slot: "dinner" },
    invalid: { recipe_id: RECIPE_ID, meal_slot: "brunch" },
  },
  add_recipe_to_grocery_list: { valid: { recipe_id: RECIPE_ID }, invalid: {} },
  generate_meal_plan: { valid: { days: 3 }, invalid: {} },
  get_health_score: { valid: { detail: true }, invalid: { detail: "yes" } },
  get_macro_history: { valid: { window: "7d" }, invalid: { window: "3d" } },
  get_inflows_outflows: { valid: { window: "today" }, invalid: { window: "week" } },
  get_weight_trend: { valid: { window: "30d" }, invalid: { window: "7d" } },
  log_weight: { valid: { weight: 80, unit: "kg" }, invalid: { weight: 80, unit: "st" } },
  log_mood: { valid: { score: 4 }, invalid: { score: 9 } },
  log_water: { valid: { amount_ml: 500 }, invalid: {} },
  find_restaurant_picks: { valid: { restaurant: "Chipotle" }, invalid: { restaurant: 42 } },
  get_grocery_list: { valid: {}, invalid: 42 },
  add_grocery_item: { valid: { name: "Oats" }, invalid: {} },
  check_grocery_item: { valid: { item: "Eggs" }, invalid: {} },
  clear_grocery_list: { valid: {}, invalid: 42 },
  update_preferences: { valid: { units: "imperial" }, invalid: { units: "stones" } },
  get_daily_recap: { valid: {}, invalid: 42 },
  explain_metric: { valid: { metric: "nutrition_score" }, invalid: { metric: "bogus" } },
  undo_last_action: { valid: {}, invalid: 42 },
  open_page: {
    valid: { route: "/app/settings", reason: "Edit your profile form there." },
    invalid: { route: "/nope", reason: "x" },
  },
  ask_user_followup: {
    valid: { question: "Which slot?", options: ["Lunch", "Dinner"] },
    invalid: { question: "Which slot?", options: ["Lunch"] },
  },
};

describe("registry coverage", () => {
  it("has a schema case for every registered tool and no stale cases", () => {
    const registered = listTools()
      .map((t) => t.name)
      .sort();
    expect(registered).toEqual(Object.keys(SCHEMA_CASES).sort());
    expect(registered.length).toBeGreaterThan(0);
  });
});

describe("tool schemas", () => {
  for (const [name, { valid, invalid }] of Object.entries(SCHEMA_CASES)) {
    it(`${name}: parses a valid input and rejects an invalid one`, () => {
      const tool = getTool(name);
      expect(tool, `tool not registered: ${name}`).toBeDefined();
      expect(tool!.schema.safeParse(valid).success).toBe(true);
      expect(tool!.schema.safeParse(invalid).success).toBe(false);
    });
  }
});

describe("tool run invariants", () => {
  for (const [name, { valid }] of Object.entries(SCHEMA_CASES)) {
    it(`${name}: returns a well-formed ToolRunResult`, async () => {
      const result = await runTool(name, valid);
      expect(typeof result.persisted).toBe("boolean");
      expect(result.modelResult).toBeDefined();
      if (result.artifact) {
        expect(typeof result.artifact.id).toBe("string");
        expect(result.artifact.id.length).toBeGreaterThan(0);
        expect(typeof result.artifact.type).toBe("string");
        expect(result.artifact.type.length).toBeGreaterThan(0);
      }
      if (result.mutations) {
        expect(result.mutations.length).toBeGreaterThan(0);
        for (const m of result.mutations) {
          expect(MUTATION_KINDS.has(m.kind)).toBe(true);
        }
      }
    });
  }
});

describe("edge cases", () => {
  it("log_meal with an unknown food_id returns an error-shaped result, not a throw", async () => {
    const result = await runTool("log_meal", {
      food_id: "no-such-food",
      portion: 100,
      meal_slot: "lunch",
    });
    expect(result.persisted).toBe(false);
    expect(result.mutations).toBeUndefined();
    expect((result.modelResult as { error: string }).error).toMatch(/no-such-food/);
  });

  it("log_meal with a known food persists an add_meal mutation with the right macros", async () => {
    const result = await runTool("log_meal", {
      food_id: CHICKEN_ID,
      portion: 140,
      meal_slot: "dinner",
    });
    expect(result.persisted).toBe(true);
    expect(result.mutations).toHaveLength(1);
    const m = result.mutations![0];
    expect(m.kind).toBe("add_meal");
    if (m.kind === "add_meal") {
      // Chicken breast, grilled: 165 kcal / 31g protein per 100g, 140g portion
      expect(m.meal.items[0].calories).toBe(231);
      expect(m.meal.items[0].protein).toBe(43);
    }
    expect(result.artifact?.type).toBe("meal_logged");
  });

  it("propose_target_change renders an approval card without mutating targets", async () => {
    const result = await runTool("propose_target_change", {
      target_calories: 2400,
      target_protein: 180,
      target_carbs: 260,
      target_fat: 80,
      reason: "Several training days need more fuel.",
      evidence: ["Garmin shows higher active calories."],
    });
    expect(result.persisted).toBe(false);
    expect(result.mutations).toBeUndefined();
    expect(result.artifact?.type).toBe("target_change_proposal");
  });

  it("find_restaurant_picks uses the expanded Log restaurant database", async () => {
    const result = await runTool("find_restaurant_picks", {
      restaurant: "CAVA",
      preference: "chicken",
    });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { matchedRestaurant: boolean }).matchedRestaurant).toBe(true);
    expect(result.artifact?.type).toBe("restaurant_picks");
    const artifact = result.artifact as unknown as { picks: { name: string; why: string }[] };
    expect(artifact.picks.length).toBeGreaterThan(0);
    expect(artifact.picks[0].why).toMatch(/protein/i);
  });

  it("update_goal_plan can persist accepted macro target changes", async () => {
    const result = await runTool("update_goal_plan", {
      target_calories: 2400,
      target_protein: 180,
      target_carbs: 260,
      target_fat: 80,
      goal_reason: "Accepted target proposal.",
    });
    expect(result.persisted).toBe(true);
    expect(result.mutations?.[0].kind).toBe("set_goal_plan");
    const mutation = result.mutations?.[0];
    if (mutation?.kind === "set_goal_plan") {
      expect(mutation.plan.macroTargets).toEqual({
        calories: 2400,
        protein: 180,
        carbs: 260,
        fat: 80,
      });
    }
  });

  it("edit_meal with an unknown meal id returns an error-shaped result", async () => {
    const result = await runTool("edit_meal", { meal_id: "ghost-meal", patch: { kcal: 100 } });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/ghost-meal/);
  });

  it("delete_meal with an unknown meal id returns an error-shaped result", async () => {
    const result = await runTool("delete_meal", { meal_id: "ghost-meal" });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/ghost-meal/);
  });

  it("log_meal resolves a fuzzy food name (typo) to the right database food", async () => {
    const result = await runTool("log_meal", {
      food_id: "chiken breast",
      portion: 140,
      meal_slot: "dinner",
    });
    expect(result.persisted).toBe(true);
    const m = result.mutations![0];
    expect(m.kind).toBe("add_meal");
    if (m.kind === "add_meal") {
      expect(m.meal.name).toMatch(/^Chicken breast/);
    }
  });

  it("edit_meal retargets a meal referenced by name to another slot", async () => {
    const result = await runTool("edit_meal", {
      meal_id: "chicken rice bowl",
      patch: { meal_slot: "dinner" },
    });
    expect(result.persisted).toBe(true);
    const m = result.mutations![0];
    expect(m.kind).toBe("update_meal");
    if (m.kind === "update_meal") {
      expect(m.mealId).toBe("sample-lunch");
      expect(m.meal.mealType).toBe("dinner");
    }
  });

  it("edit_meal resolves 'last' to the most recently logged meal", async () => {
    const { ctx } = makeCtx();
    const latest = ctx.snapshot.meals.reduce((best, m) =>
      best.loggedAt > m.loggedAt ? best : m,
    );
    const tool = getTool("edit_meal")!;
    const result = await tool.run(
      tool.schema.parse({ meal_id: "last", patch: { meal_slot: "snack" } }),
      ctx,
    );
    expect(result.persisted).toBe(true);
    const m = result.mutations![0];
    if (m.kind === "update_meal") {
      expect(m.mealId).toBe(latest.id);
    }
  });

  it("delete_meal resolves a meal by name", async () => {
    const result = await runTool("delete_meal", { meal_id: "greek yogurt bowl" });
    expect(result.persisted).toBe(true);
    const m = result.mutations![0];
    expect(m.kind).toBe("remove_meal");
    if (m.kind === "remove_meal") {
      expect(m.mealId).toBe("sample-breakfast");
    }
  });

  it("delete_meal stays destructive so the route requires confirmation", () => {
    expect(getTool("delete_meal")!.destructive).toBe(true);
    expect(getTool("clear_grocery_list")!.destructive).toBe(true);
  });

  it("log_recipe_as_meal resolves a recipe by title instead of id", async () => {
    const title = RECIPES[0].title;
    const result = await runTool("log_recipe_as_meal", {
      recipe_id: title,
      meal_slot: "dinner",
    });
    expect(result.persisted).toBe(true);
    const m = result.mutations![0];
    expect(m.kind).toBe("add_meal");
    if (m.kind === "add_meal") {
      expect(m.meal.name).toBe(title);
    }
  });

  it("add_recipe_to_grocery_list resolves a recipe by title instead of id", async () => {
    const result = await runTool("add_recipe_to_grocery_list", {
      recipe_id: RECIPES[0].title,
    });
    expect(result.persisted).toBe(true);
    expect(result.mutations![0].kind).toBe("set_grocery");
  });

  it("get_recipe_detail with an unresolvable title returns an error-shaped result", async () => {
    const result = await runTool("get_recipe_detail", { recipe_id: "zzz-not-a-recipe" });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/zzz-not-a-recipe/);
  });

  it("check_grocery_item with no match returns an error-shaped result", async () => {
    const result = await runTool("check_grocery_item", { item: "plutonium" });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/plutonium/);
  });

  it("undo_last_action with nothing recorded returns undone:false", async () => {
    const result = await runTool("undo_last_action", {});
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { undone: boolean }).undone).toBe(false);
  });

  it("undo_last_action after log_meal reverses the write for that user", async () => {
    const { ctx } = makeCtx();
    const logged = (await getTool("log_meal")!.run(
      { food_id: CHICKEN_ID, portion: 140, meal_slot: "dinner" },
      ctx,
    )) as ToolRunResult;
    expect(logged.persisted).toBe(true);
    const undo = (await getTool("undo_last_action")!.run({}, ctx)) as ToolRunResult;
    expect(undo.persisted).toBe(true);
    expect((undo.modelResult as { undone: boolean }).undone).toBe(true);
    expect(undo.mutations).toEqual([
      { kind: "remove_meal", mealId: (logged.mutations![0] as { meal: { id: string } }).meal.id },
    ]);
  });

  it("suggest_meal respects a Shellfish allergy", async () => {
    // Sanity: without the allergy, the default protein-density pool surfaces shellfish.
    const noAllergy = await getTool("suggest_meal")!.run(
      {},
      makeCtx({ preferences: { diets: [], allergies: [], likes: [], dislikes: [] } }).ctx,
    );
    const namesWithout = (
      (noAllergy as ToolRunResult).modelResult as { suggestions: { name: string }[] }
    ).suggestions.map((s) => s.name);
    expect(namesWithout.some((n) => SHELLFISH_RE.test(n))).toBe(true);

    // With the allergy (helper default), no shellfish food may be suggested.
    const withAllergy = (await runTool("suggest_meal", {})) as ToolRunResult;
    const suggestions = (
      withAllergy.modelResult as { suggestions: { name: string }[] }
    ).suggestions;
    expect(suggestions.length).toBeGreaterThan(0);
    for (const s of suggestions) {
      expect(s.name).not.toMatch(SHELLFISH_RE);
    }
  });

  it("generate_meal_plan(days:3) returns 3 days with 3 meals each", async () => {
    const result = (await runTool("generate_meal_plan", { days: 3 })) as ToolRunResult;
    const model = result.modelResult as { days: { day: number; meals: string[] }[] };
    expect(model.days).toHaveLength(3);
    expect(model.days.map((d) => d.day)).toEqual([1, 2, 3]);
    const artifactDays = result.artifact!.days as { meals: unknown[] }[];
    expect(artifactDays).toHaveLength(3);
    for (const day of artifactDays) expect(day.meals).toHaveLength(3);
  });

  it("plan_workout -> start -> log_set -> end chain logs an aggregated workout", async () => {
    const { ctx, applied } = makeCtx();
    const plan = (await getTool("plan_workout")!.run(
      { focus: "push", duration_min: 40, equipment: "dumbbell" },
      ctx,
    )) as ToolRunResult;
    const planId = (plan.modelResult as { planId: string }).planId;
    expect(planId).toBeTruthy();
    expect((plan.modelResult as { exercises: string[] }).exercises.length).toBeGreaterThanOrEqual(4);

    const started = (await getTool("start_workout_session")!.run(
      { plan_id: planId },
      ctx,
    )) as ToolRunResult;
    expect((started.modelResult as { started: boolean }).started).toBe(true);

    const set1 = (await getTool("log_set")!.run(
      { exercise: "Push-Up", weight_kg: 0, reps: 12 },
      ctx,
    )) as ToolRunResult;
    expect((set1.modelResult as { totalSets: number }).totalSets).toBe(1);
    const set2 = (await getTool("log_set")!.run(
      { exercise: "Push-Up", weight_kg: 0, reps: 10 },
      ctx,
    )) as ToolRunResult;
    expect((set2.modelResult as { totalSets: number }).totalSets).toBe(2);

    const ended = (await getTool("end_workout_session")!.run({}, ctx)) as ToolRunResult;
    expect(ended.persisted).toBe(true);
    expect((ended.modelResult as { totalSets: number }).totalSets).toBe(2);
    const mutation = ended.mutations![0];
    expect(mutation.kind).toBe("add_workout");
    if (mutation.kind === "add_workout") {
      expect(mutation.workout.exercises).toEqual([
        { name: "Push-Up", sets: 2, reps: 12, weightKg: undefined },
      ]);
    }
    // The mutation was applied to the in-turn snapshot draft too.
    expect(applied.some((m) => m.kind === "add_workout")).toBe(true);
    expect(ctx.snapshot.workouts).toHaveLength(2);

    // Ending again with no active session is an error-shaped result.
    const again = (await getTool("end_workout_session")!.run({}, ctx)) as ToolRunResult;
    expect(again.persisted).toBe(false);
    expect((again.modelResult as { error: string }).error).toMatch(/no active/i);
  });

  it("start_workout_session with an unknown plan id returns an error-shaped result", async () => {
    const result = await runTool("start_workout_session", { plan_id: "ghost-plan" });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/ghost-plan/);
  });

  it("start_workout_session starts directly from a library workout name and ends with its title", async () => {
    const { ctx } = makeCtx();
    const started = (await getTool("start_workout_session")!.run(
      { workout: "recovery walk" },
      ctx,
    )) as ToolRunResult;
    expect((started.modelResult as { started: boolean }).started).toBe(true);
    expect((started.modelResult as { workout: string }).workout).toBe("Recovery walk");

    const ended = (await getTool("end_workout_session")!.run({}, ctx)) as ToolRunResult;
    expect(ended.persisted).toBe(true);
    const mutation = ended.mutations![0];
    expect(mutation.kind).toBe("add_workout");
    if (mutation.kind === "add_workout") {
      expect(mutation.workout.name).toBe("Recovery walk");
    }
  });

  it("start_workout_session with an unresolvable workout name returns an error-shaped result", async () => {
    const result = await runTool("start_workout_session", { workout: "no such thing xyz" });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/no such thing xyz/i);
  });

  it("log_workout canonicalizes a typo'd library title and links catalog metadata", async () => {
    const result = await runTool("log_workout", {
      name: "zone 2 rdie",
      duration_min: 40,
      category: "cardio",
    });
    expect(result.persisted).toBe(true);
    const model = result.modelResult as { name: string; library?: { id: string } };
    expect(model.name).toBe("Zone 2 ride");
    expect(model.library?.id).toBe("zone-2-ride");
  });

  it("log_workout keeps a generic name as said instead of renaming to a library title", async () => {
    const result = await runTool("log_workout", {
      name: "Upper body",
      duration_min: 30,
      category: "strength",
    });
    expect(result.persisted).toBe(true);
    expect((result.modelResult as { name: string }).name).toBe("Upper body");
  });

  it("delete_workout resolves a workout by fuzzy name and emits remove_workout", async () => {
    const { ctx } = makeCtx();
    const result = (await getTool("delete_workout")!.run(
      { workout_id: "morning runn" },
      ctx,
    )) as ToolRunResult;
    expect(result.persisted).toBe(true);
    expect(result.modelResult).toEqual({
      deleted: { id: "sample-workout", name: "Morning run" },
    });
    expect(result.mutations).toEqual([{ kind: "remove_workout", workoutId: "sample-workout" }]);
  });

  it("delete_workout resolves 'last' to the most recently logged workout", async () => {
    const { ctx } = makeCtx();
    ctx.snapshot.workouts = [
      ...ctx.snapshot.workouts,
      {
        id: "w-late",
        name: "Evening lift",
        category: "strength",
        durationMin: 40,
        loggedAt: new Date(Date.now() + 60_000).toISOString(),
      },
    ];
    const result = (await getTool("delete_workout")!.run({ workout_id: "last" }, ctx)) as ToolRunResult;
    expect((result.modelResult as { deleted: { id: string } }).deleted.id).toBe("w-late");
  });

  it("delete_workout with an unknown reference returns an error-shaped result", async () => {
    const result = await runTool("delete_workout", { workout_id: "spelunking" });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/spelunking/);
  });

  it("delete_workout stays destructive so the route requires confirmation", () => {
    expect(getTool("delete_workout")!.destructive).toBe(true);
  });

  it("log_set with no active session returns an error-shaped result", async () => {
    const result = await runTool("log_set", { exercise: "Push-Up", weight_kg: 0, reps: 12 });
    expect(result.persisted).toBe(false);
    expect((result.modelResult as { error: string }).error).toMatch(/no active/i);
  });

  it("check_grocery_item toggles by name case-insensitively and persists", async () => {
    const { ctx } = makeCtx();
    const result = (await getTool("check_grocery_item")!.run({ item: "eggs" }, ctx)) as ToolRunResult;
    expect(result.persisted).toBe(true);
    expect(result.modelResult).toEqual({ name: "Eggs", toggled: "Eggs", checked: true });
    expect(ctx.snapshot.grocery.find((g) => g.name === "Eggs")?.checked).toBe(true);
  });
});
