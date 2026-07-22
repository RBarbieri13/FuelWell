import { z } from "zod";
import { registerTools } from "../registry";
import { recordAction } from "../last-action";
import { newEntityId } from "../ids";
import type { CoachToolDef, GroceryItem } from "../types";
import { groceryItemKey, normalizeGroceryInput } from "@/lib/grocery-normalization";
import { remaining, sumMeals, type MealRecord } from "@/lib/fuelwell-data";
import {
  RECIPES,
  applyRecipeFilters,
  resolveRecipe,
  searchRecipes,
  type Recipe,
} from "@/lib/recipes-data";
import type { DietFilter } from "@/lib/use-preferences";

const DIET_IDS = ["high-protein", "low-carb", "low-fat", "vegan"] as const;

function isDietFilter(value: string): value is DietFilter {
  return (DIET_IDS as readonly string[]).includes(value);
}

function snapshotDiets(diets: string[]): DietFilter[] {
  return diets.filter(isDietFilter);
}

/** Preserves the per-tool schema generic so `input` is typed inside `run`. */
function defineTool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

registerTools([
  defineTool({
    name: "search_recipes",
    description:
      "Search the recipe library by keyword (matches title, ingredients, tags), optionally filtered by diet and max prep minutes. The user's allergies are applied automatically. Use before recommending a recipe.",
    schema: z.object({
      query: z
        .string()
        .optional()
        .describe("Search text matched against title, ingredients, and tags. Omit to browse all recipes."),
      diet: z
        .enum(DIET_IDS)
        .optional()
        .describe("Restrict results to recipes matching this diet filter."),
      max_minutes: z
        .number()
        .optional()
        .describe("Only return recipes that take at most this many minutes to prepare."),
    }),
    run: (input, ctx) => {
      let results = input.query ? searchRecipes(input.query) : RECIPES;
      results = applyRecipeFilters(
        results,
        input.diet ? [input.diet] : [],
        ctx.snapshot.preferences.allergies
      );
      if (input.max_minutes !== undefined) {
        results = results.filter((r) => r.minutes <= input.max_minutes!);
      }
      const top = results.slice(0, 4);
      const recipes = top.map((r) => ({
        id: r.id,
        title: r.title,
        meal: r.meal,
        minutes: r.minutes,
        perServing: r.perServing,
        tags: r.tags,
      }));
      return {
        persisted: false,
        modelResult: {
          count: results.length,
          recipes: top.map((r) => ({
            id: r.id,
            title: r.title,
            meal: r.meal,
            minutes: r.minutes,
            calories: r.perServing.calories,
            protein: r.perServing.protein,
          })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "recipe_list",
          recipes,
        },
      };
    },
  }),
  defineTool({
    name: "get_recipe_detail",
    description:
      "Get the full detail for one recipe by id: per-serving nutrition, measured ingredients, and steps. Use after search_recipes when the user wants to cook or inspect a recipe.",
    schema: z.object({
      recipe_id: z
        .string()
        .describe(
          "Recipe id from search_recipes results, or the recipe title to match directly (typos and partial titles are tolerated).",
        ),
    }),
    run: (input, ctx) => {
      const recipe = resolveRecipe(input.recipe_id);
      if (!recipe) {
        return {
          persisted: false,
          modelResult: { error: `No recipe matching "${input.recipe_id}".` },
        };
      }
      return {
        persisted: false,
        modelResult: {
          id: recipe.id,
          title: recipe.title,
          minutes: recipe.minutes,
          servings: recipe.servings,
          perServing: recipe.perServing,
          ingredientCount: recipe.ingredients.length,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "recipe_detail",
          recipe: {
            id: recipe.id,
            title: recipe.title,
            meal: recipe.meal,
            minutes: recipe.minutes,
            servings: recipe.servings,
            perServing: recipe.perServing,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            tags: recipe.tags,
          },
        },
      };
    },
  }),
  defineTool({
    name: "log_recipe_as_meal",
    description:
      "Log a recipe to today's food log as a meal in the given slot, scaled by servings eaten. Updates today's macro totals. Use when the user says they made/ate a recipe.",
    schema: z.object({
      recipe_id: z
        .string()
        .describe("Recipe id to log, or the recipe title to match directly (typos and partial titles are tolerated)."),
      servings: z
        .number()
        .min(0.25)
        .max(20)
        .optional()
        .describe("Number of servings eaten (0.25-20). Defaults to 1."),
      meal_slot: z
        .enum(["breakfast", "lunch", "dinner", "snack"])
        .describe("Which meal slot to log this under."),
    }),
    run: (input, ctx) => {
      const recipe = resolveRecipe(input.recipe_id);
      if (!recipe) {
        return {
          persisted: false,
          modelResult: { error: `No recipe matching "${input.recipe_id}".` },
        };
      }
      const servings = input.servings ?? 1;
      const macros = {
        calories: Math.round(recipe.perServing.calories * servings),
        protein: Math.round(recipe.perServing.protein * servings),
        carbs: Math.round(recipe.perServing.carbs * servings),
        fat: Math.round(recipe.perServing.fat * servings),
      };
      const meal: MealRecord = {
        id: newEntityId("coach-meal"),
        mealType: input.meal_slot,
        name: recipe.title,
        loggedAt: new Date().toISOString(),
        items: [
          {
            id: newEntityId("coach-item"),
            name: recipe.title,
            servings,
            ...macros,
          },
        ],
      };
      ctx.applyMutation({ kind: "add_meal", meal });
      recordAction(ctx.userId, `Logged ${recipe.title}`, [
        { kind: "remove_meal", mealId: meal.id },
      ]);
      const { targets } = ctx.snapshot;
      const totals = sumMeals(ctx.snapshot.meals);
      const remainingAfter = {
        calories: remaining(totals.calories, targets.calories),
        protein: remaining(totals.protein, targets.protein),
      };
      return {
        persisted: true,
        mutations: [{ kind: "add_meal", meal }],
        modelResult: {
          mealId: meal.id,
          name: meal.name,
          slot: meal.mealType,
          macros,
          remaining: remainingAfter,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "meal_logged",
          meal: { id: meal.id, slot: meal.mealType, name: meal.name, macros },
          remaining: remainingAfter,
          undoable: true,
        },
      };
    },
  }),
  defineTool({
    name: "add_recipe_to_grocery_list",
    description:
      "Add a recipe's ingredients to the user's grocery list, skipping items already on it. Use when the user wants to shop for or plan to cook a recipe.",
    schema: z.object({
      recipe_id: z
        .string()
        .describe(
          "Recipe id whose ingredients should be added, or the recipe title to match directly (typos and partial titles are tolerated).",
        ),
    }),
    run: (input, ctx) => {
      const recipe = resolveRecipe(input.recipe_id);
      if (!recipe) {
        return {
          persisted: false,
          modelResult: { error: `No recipe matching "${input.recipe_id}".` },
        };
      }
      const oldList = ctx.snapshot.grocery;
      const existing = new Set(oldList.map((g) => groceryItemKey(g.name)));
      const added: GroceryItem[] = [];
      for (const ing of recipe.ingredients) {
        const normalized = normalizeGroceryInput(ing.item, ing.amount);
        const key = groceryItemKey(normalized.name);
        if (existing.has(key)) continue;
        existing.add(key);
        added.push({
          id: newEntityId("coach-grocery"),
          name: normalized.name,
          checked: false,
          ...(normalized.quantity ? { quantity: normalized.quantity } : {}),
        });
      }
      const newList = [...oldList, ...added];
      ctx.applyMutation({ kind: "set_grocery", items: newList });
      recordAction(ctx.userId, `Added ${recipe.title} ingredients to grocery list`, [
        { kind: "set_grocery", items: oldList },
      ]);
      return {
        persisted: true,
        mutations: [{ kind: "set_grocery", items: newList }],
        modelResult: {
          added: added.map((g) => g.name),
          skippedAsDuplicates: recipe.ingredients.length - added.length,
          listSize: newList.length,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "grocery_list",
          items: newList,
          added: added.map((g) => g.name),
        },
      };
    },
  }),
  defineTool({
    name: "generate_meal_plan",
    description:
      "Generate a breakfast/lunch/dinner meal plan for 1-7 days from the recipe library, respecting the user's diets and allergies and varying recipes across days. Read-only — does not log anything.",
    schema: z.object({
      days: z
        .number()
        .describe("Number of days to plan, from 1 to 7."),
      goal: z
        .string()
        .optional()
        .describe("Optional goal to mention in the plan summary, e.g. 'high protein' or 'cutting'."),
    }),
    run: (input, ctx) => {
      const dayCount = Math.min(7, Math.max(1, Math.round(input.days)));
      const diets = snapshotDiets(ctx.snapshot.preferences.diets);
      const allergies = ctx.snapshot.preferences.allergies;
      const pool = (meal: Recipe["meal"], slotFallback: Recipe["meal"][]) => {
        let candidates = applyRecipeFilters(
          RECIPES.filter((r) => r.meal === meal),
          diets,
          allergies
        );
        if (candidates.length === 0) {
          candidates = applyRecipeFilters(
            RECIPES.filter((r) => slotFallback.includes(r.meal)),
            diets,
            allergies
          );
        }
        return candidates;
      };
      const slots: Array<{ slot: string; recipes: Recipe[] }> = [
        { slot: "breakfast", recipes: pool("Breakfast", ["Snack"]) },
        { slot: "lunch", recipes: pool("Lunch", ["Dinner"]) },
        { slot: "dinner", recipes: pool("Dinner", ["Lunch"]) },
      ];
      if (slots.some((s) => s.recipes.length === 0)) {
        return {
          persisted: false,
          modelResult: {
            error:
              "Not enough recipes match the user's diet and allergy filters to build a full plan.",
          },
        };
      }
      const days = Array.from({ length: dayCount }, (_, dayIdx) => {
        const meals = slots.map(({ slot, recipes }) => {
          const recipe = recipes[dayIdx % recipes.length];
          return { slot, recipeId: recipe.id, title: recipe.title, perServing: recipe.perServing };
        });
        const dayTotals = meals.reduce(
          (t, m) => ({
            calories: t.calories + m.perServing.calories,
            protein: t.protein + m.perServing.protein,
            carbs: t.carbs + m.perServing.carbs,
            fat: t.fat + m.perServing.fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        return { day: dayIdx + 1, meals, dayTotals };
      });
      const avgCalories = Math.round(
        days.reduce((s, d) => s + d.dayTotals.calories, 0) / days.length
      );
      const summary = `${dayCount}-day plan${input.goal ? ` for ${input.goal}` : ""}, ~${avgCalories} kcal/day, respecting your diet and allergy filters.`;
      return {
        persisted: false,
        modelResult: {
          summary,
          days: days.map((d) => ({
            day: d.day,
            meals: d.meals.map((m) => `${m.slot}: ${m.title}`),
            calories: d.dayTotals.calories,
            protein: d.dayTotals.protein,
          })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "meal_plan",
          days,
          summary,
        },
      };
    },
  }),
]);
