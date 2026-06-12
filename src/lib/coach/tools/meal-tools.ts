import { z } from "zod";
import { registerTools } from "../registry";
import type { CoachToolDef } from "../types";
import { recordAction } from "../last-action";
import { newEntityId } from "../ids";
import {
  remaining,
  sumMealItems,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";
import {
  FOOD_DATABASE,
  filterFoods,
  macrosForPortion,
  searchFoods,
  type FoodItem,
} from "@/lib/food-database";

/** Preserves per-tool input inference; registerTools takes the widened CoachToolDef. */
function tool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

const mealSlot = z
  .enum(["breakfast", "lunch", "dinner", "snack"])
  .describe("Which meal slot this belongs to.");

function remainingAfter(
  ctx: { snapshot: { totals: { calories: number; protein: number }; targets: { calories: number; protein: number } } },
  added: { calories: number; protein: number },
) {
  const { totals, targets } = ctx.snapshot;
  return {
    calories: remaining(totals.calories + added.calories, targets.calories),
    protein: remaining(totals.protein + added.protein, targets.protein),
  };
}

function mealLoggedResult(
  ctx: {
    snapshot: { totals: { calories: number; protein: number }; targets: { calories: number; protein: number } };
    newArtifactId: () => string;
  },
  meal: MealRecord,
  opts?: { updated?: boolean; remainingOverride?: { calories: number; protein: number } },
) {
  const macros = sumMealItems(meal.items);
  const left = opts?.remainingOverride ?? remainingAfter(ctx, macros);
  const summary = { id: meal.id, slot: meal.mealType, name: meal.name, macros };
  return {
    persisted: true as const,
    modelResult: { meal: summary, remaining: left },
    artifact: {
      id: ctx.newArtifactId(),
      type: "meal_logged",
      meal: summary,
      remaining: left,
      undoable: true,
      ...(opts?.updated ? { updated: true } : {}),
    },
  };
}

function suggestionPool(preference?: string): FoodItem[] {
  switch (preference) {
    case "high-protein":
      return filterFoods("high-protein");
    case "low-carb":
      return filterFoods("low-carb");
    case "low-fat":
      return filterFoods("low-fat");
    case "vegan-friendly":
    case "vegan":
      return filterFoods("vegan-friendly");
    case "high-fiber":
      return filterFoods("high-fiber");
    default:
      return [...FOOD_DATABASE].sort(
        (a, b) =>
          b.per100.protein / Math.max(b.per100.kcal, 1) -
          a.per100.protein / Math.max(a.per100.kcal, 1),
      );
  }
}

registerTools([
  tool({
    name: "search_foods",
    description:
      "Search the built-in food database (~500 foods, per-100g/ml macros) by name, tag, or category. Use to find a food_id before calling log_meal.",
    schema: z.object({
      query: z.string().describe("Food name or keyword to search for, e.g. 'chicken breast'."),
      limit: z
        .number()
        .optional()
        .describe("Max results to return, 1-10. Default 6."),
    }),
    run: (input, ctx) => {
      const limit = Math.min(Math.max(input.limit ?? 6, 1), 10);
      const foods = searchFoods(input.query, limit);
      return {
        persisted: false,
        modelResult: {
          query: input.query,
          foods: foods.map((f) => ({
            id: f.id,
            name: f.name,
            unit: f.servingUnit,
            per100: f.per100,
          })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "food_search_results",
          query: input.query,
          foods: foods.map((f) => ({
            id: f.id,
            name: f.name,
            categoryLabel: f.categoryLabel,
            per100: f.per100,
            commonServings: f.commonServings,
            servingUnit: f.servingUnit,
          })),
        },
      };
    },
  }),
  tool({
    name: "log_meal",
    description:
      "Log a food from the database to today's plate. portion is in grams (or ml for beverages, per the food's servingUnit). Get food_id from search_foods first.",
    schema: z.object({
      food_id: z.string().describe("Food id from search_foods results."),
      portion: z
        .number()
        .describe("Portion size in grams (or ml for beverages), e.g. 140."),
      meal_slot: mealSlot,
      note: z.string().optional().describe("Optional short note about the meal."),
    }),
    run: (input, ctx) => {
      const food = FOOD_DATABASE.find((f) => f.id === input.food_id);
      if (!food) {
        return {
          persisted: false,
          modelResult: { error: `No food with id "${input.food_id}". Use search_foods to find a valid id.` },
        };
      }
      const macros = macrosForPortion(food, input.portion);
      const meal: MealRecord = {
        id: newEntityId("coach-meal"),
        mealType: input.meal_slot,
        name: food.name,
        loggedAt: new Date().toISOString(),
        items: [
          {
            id: newEntityId("coach-item"),
            name: `${food.name} (${input.portion} ${food.servingUnit})`,
            servings: 1,
            calories: macros.kcal,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
          },
        ],
      };
      recordAction(ctx.userId, `Logged ${food.name}`, [
        { kind: "remove_meal", mealId: meal.id },
      ]);
      return {
        ...mealLoggedResult(ctx, meal),
        mutations: [{ kind: "add_meal", meal }],
      };
    },
  }),
  tool({
    name: "log_custom_meal",
    description:
      "Log a meal with user-provided macros when it isn't in the food database (restaurant dish, homemade recipe). kcal in calories, protein/carbs/fat in grams.",
    schema: z.object({
      name: z.string().describe("Name of the meal, e.g. 'Mom's lasagna'."),
      kcal: z.number().describe("Total calories of the meal."),
      protein: z.number().describe("Protein in grams."),
      carbs: z.number().describe("Carbs in grams."),
      fat: z.number().describe("Fat in grams."),
      meal_slot: mealSlot,
    }),
    run: (input, ctx) => {
      const meal: MealRecord = {
        id: newEntityId("coach-meal"),
        mealType: input.meal_slot,
        name: input.name,
        loggedAt: new Date().toISOString(),
        items: [
          {
            id: newEntityId("coach-item"),
            name: input.name,
            servings: 1,
            calories: input.kcal,
            protein: input.protein,
            carbs: input.carbs,
            fat: input.fat,
          },
        ],
      };
      recordAction(ctx.userId, `Logged ${input.name}`, [
        { kind: "remove_meal", mealId: meal.id },
      ]);
      return {
        ...mealLoggedResult(ctx, meal),
        mutations: [{ kind: "add_meal", meal }],
      };
    },
  }),
  tool({
    name: "edit_meal",
    description:
      "Edit an already-logged meal: rename it, move it to another slot, or correct its macros. Only provide the fields that change.",
    schema: z.object({
      meal_id: z.string().describe("Id of the logged meal to edit (from get_todays_plate)."),
      patch: z
        .object({
          name: z.string().optional().describe("New meal name."),
          meal_slot: mealSlot.optional(),
          kcal: z.number().optional().describe("Corrected total calories."),
          protein: z.number().optional().describe("Corrected protein in grams."),
          carbs: z.number().optional().describe("Corrected carbs in grams."),
          fat: z.number().optional().describe("Corrected fat in grams."),
        })
        .describe("Fields to change; omit anything that stays the same."),
    }),
    run: (input, ctx) => {
      const original = ctx.snapshot.meals.find((m) => m.id === input.meal_id);
      if (!original) {
        return {
          persisted: false,
          modelResult: { error: `No logged meal with id "${input.meal_id}".` },
        };
      }
      const p = input.patch;
      const items = original.items.map((item, i) =>
        i === 0
          ? {
              ...item,
              ...(p.name !== undefined ? { name: p.name } : {}),
              ...(p.kcal !== undefined ? { calories: p.kcal } : {}),
              ...(p.protein !== undefined ? { protein: p.protein } : {}),
              ...(p.carbs !== undefined ? { carbs: p.carbs } : {}),
              ...(p.fat !== undefined ? { fat: p.fat } : {}),
            }
          : item,
      );
      const updated: MealRecord = {
        ...original,
        name: p.name ?? original.name,
        mealType: (p.meal_slot ?? original.mealType) as MealType,
        items,
      };
      recordAction(ctx.userId, `Edited ${original.name}`, [
        { kind: "update_meal", mealId: original.id, meal: original },
      ]);
      const originalMacros = sumMealItems(original.items);
      const updatedMacros = sumMealItems(updated.items);
      // remaining reflects the macro delta from this edit on top of snapshot totals
      const remainingOverride = remainingAfter(ctx, {
        calories: updatedMacros.calories - originalMacros.calories,
        protein: updatedMacros.protein - originalMacros.protein,
      });
      return {
        ...mealLoggedResult(ctx, updated, { updated: true, remainingOverride }),
        mutations: [{ kind: "update_meal", mealId: updated.id, meal: updated }],
      };
    },
  }),
  tool({
    name: "delete_meal",
    description:
      "Delete a logged meal from today's plate. Destructive — the user must confirm before this runs.",
    destructive: true,
    schema: z.object({
      meal_id: z.string().describe("Id of the logged meal to delete (from get_todays_plate)."),
    }),
    run: (input, ctx) => {
      const original = ctx.snapshot.meals.find((m) => m.id === input.meal_id);
      if (!original) {
        return {
          persisted: false,
          modelResult: { error: `No logged meal with id "${input.meal_id}".` },
        };
      }
      recordAction(ctx.userId, `Deleted ${original.name}`, [
        { kind: "add_meal", meal: original },
      ]);
      return {
        persisted: true,
        modelResult: { deleted: { id: original.id, name: original.name } },
        mutations: [{ kind: "remove_meal", mealId: original.id }],
        artifact: {
          id: ctx.newArtifactId(),
          type: "meal_deleted",
          mealId: original.id,
          name: original.name,
        },
      };
    },
  }),
  tool({
    name: "suggest_meal",
    description:
      "Suggest 3 foods from the database that fit the user's remaining calorie/protein budget (or explicit targets). Each suggestion includes the food_id, portion, and slot needed to log it with log_meal.",
    schema: z.object({
      target_kcal: z
        .number()
        .optional()
        .describe("Calorie budget for the suggestion. Defaults to remaining calories vs today's target."),
      target_protein: z
        .number()
        .optional()
        .describe("Protein goal in grams. Defaults to remaining protein vs today's target."),
      preference: z
        .string()
        .optional()
        .describe(
          "Optional style filter: 'high-protein', 'low-carb', 'low-fat', 'vegan-friendly', 'high-fiber', or free text like 'quick'.",
        ),
    }),
    run: (input, ctx) => {
      const { totals, targets, meals } = ctx.snapshot;
      const kcalBudget =
        input.target_kcal ?? remaining(totals.calories, targets.calories);
      const proteinGoal =
        input.target_protein ?? remaining(totals.protein, targets.protein);
      const loggedSlots = new Set(meals.map((m) => m.mealType));
      const slot: MealType =
        (["breakfast", "lunch", "dinner"] as const).find((s) => !loggedSlots.has(s)) ??
        "snack";

      const pool = suggestionPool(input.preference);
      const candidates: Array<{ food: FoodItem; portion: number; macros: ReturnType<typeof macrosForPortion> }> = [];
      for (const food of pool) {
        const portion =
          food.commonServings[1]?.amount ?? food.commonServings[0]?.amount ?? 100;
        const macros = macrosForPortion(food, portion);
        if (macros.kcal > 0 && macros.kcal <= kcalBudget) {
          candidates.push({ food, portion, macros });
          if (candidates.length === 3) break;
        }
      }

      const suggestions = candidates.map(({ food, portion, macros }) => ({
        foodId: food.id,
        name: food.name,
        portion,
        slot,
        macros,
        why:
          proteinGoal > 0
            ? `${macros.kcal} kcal and ${macros.protein}g protein toward your ${proteinGoal}g protein gap.`
            : `Fits your ${kcalBudget} kcal budget at ${macros.kcal} kcal.`,
      }));

      return {
        persisted: false,
        modelResult: {
          budget: { kcal: kcalBudget, protein: proteinGoal },
          suggestions: suggestions.map((s) => ({
            foodId: s.foodId,
            name: s.name,
            portion: s.portion,
            slot: s.slot,
            kcal: s.macros.kcal,
            protein: s.macros.protein,
          })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "meal_suggestions",
          suggestions,
        },
      };
    },
  }),
]);
