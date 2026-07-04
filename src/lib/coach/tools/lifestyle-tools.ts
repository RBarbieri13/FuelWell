import { z } from "zod";
import { registerTools } from "../registry";
import { recordAction } from "../last-action";
import { newEntityId } from "../ids";
import type { CoachToolDef, GroceryItem } from "../types";
import { groceryItemKey, normalizeGroceryInput } from "@/lib/grocery-normalization";
import { buildCoachVerdict, remaining } from "@/lib/fuelwell-data";
import {
  matchRestaurantByName,
  searchRestaurantMenus,
} from "@/lib/restaurant-menu";

/**
 * Lifestyle tools: restaurant picks, grocery list, preferences, daily recap.
 */

/** Preserves the per-tool input type that the registerTools array literal erases. */
function tool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

registerTools([
  tool({
    name: "find_restaurant_picks",
    description:
      "Find the top 3 menu items across FuelWell's expanded US chain restaurant database (published nutrition data, per-serving) that fit the user's remaining macros for today. Optionally filter by restaurant name (e.g. 'Chipotle', 'CAVA', 'Olive Garden') and/or a preference like 'high-protein', 'low-carb', or a keyword like 'chicken'. Use when the user is eating out and wants to know what to order.",
    schema: z.object({
      restaurant: z
        .string()
        .optional()
        .describe("Restaurant or chain name to filter by, e.g. 'Chipotle' or 'KFC'. Omit to search all 50 chains."),
      preference: z
        .string()
        .optional()
        .describe("Optional preference: 'high-protein', 'low-carb', 'low-fat', or a keyword matched against item names, e.g. 'chicken', 'salad'."),
    }),
    run: (input, ctx) => {
      const { totals, targets } = ctx.snapshot;
      const remainingKcal = remaining(totals.calories, targets.calories);
      const remainingProtein = remaining(totals.protein, targets.protein);
      const remainingCarbs = remaining(totals.carbs, targets.carbs);
      const remainingFat = remaining(totals.fat, targets.fat);

      let matchedRestaurant = true;
      let restaurantId: string | null = null;
      if (input.restaurant) {
        const match = matchRestaurantByName(input.restaurant);
        restaurantId = match?.id ?? null;
        matchedRestaurant = Boolean(match);
      }

      const scored = searchRestaurantMenus({
        query: matchedRestaurant ? undefined : input.restaurant,
        restaurantId,
        preference: input.preference,
        remaining: {
          calories: remainingKcal,
          protein: remainingProtein,
          carbs: remainingCarbs,
          fat: remainingFat,
        },
        limit: 3,
      });

      const picks = scored.map(({ restaurant, item, insight }) => {
        return {
          foodId: item.id,
          name: input.restaurant ? item.name : `${item.name} (${restaurant.name})`,
          macros: {
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
          },
          why: `${insight.headline}. ${insight.proteinLine}. ${insight.nextMove}`,
          portion: item.serving,
        };
      });

      return {
        persisted: false,
        modelResult: {
          restaurant: input.restaurant ?? null,
          matchedRestaurant,
          remaining: {
            calories: remainingKcal,
            protein: remainingProtein,
            carbs: remainingCarbs,
            fat: remainingFat,
          },
          picks: picks.map((p) => ({ foodId: p.foodId, name: p.name, ...p.macros })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "restaurant_picks",
          restaurant: input.restaurant ?? null,
          picks,
        },
      };
    },
  }),
  tool({
    name: "get_grocery_list",
    description:
      "Get the user's current grocery list with each item's checked state. Use before adding items to avoid duplicates.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const items = ctx.snapshot.grocery;
      return {
        persisted: false,
        modelResult: { items: items.map((i) => ({ name: i.name, quantity: i.quantity, checked: i.checked })) },
        artifact: { id: ctx.newArtifactId(), type: "grocery_list", items },
      };
    },
  }),
  tool({
    name: "add_grocery_item",
    description:
      "Add one item to the user's grocery list. Deduplicates case-insensitively. Normalize grocery names to proper title case, and pass quantity separately when the user gives an amount.",
    schema: z.object({
      name: z.string().describe("Item to add, e.g. 'Greek yogurt' or 'Chicken breast'."),
      quantity: z
        .string()
        .optional()
        .describe("Optional quantity or amount, e.g. '5', '2 portions', '32 oz'. Do not append this to the item name."),
    }),
    run: (input, ctx) => {
      const old = ctx.snapshot.grocery;
      const normalized = normalizeGroceryInput(input.name, input.quantity);
      const name = normalized.name;
      const quantity = normalized.quantity;
      const exists = old.some((i) => groceryItemKey(i.name) === groceryItemKey(name));
      if (exists) {
        return {
          persisted: false,
          modelResult: { status: "already on list", name, quantity },
          artifact: { id: ctx.newArtifactId(), type: "grocery_list", items: old, added: [] },
        };
      }
      const item: GroceryItem = {
        id: newEntityId("coach-grocery"),
        name,
        checked: false,
        ...(quantity ? { quantity } : {}),
      };
      const items = [...old, item];
      ctx.applyMutation({ kind: "set_grocery", items });
      recordAction(ctx.userId, `Added "${quantity ? `${quantity} ` : ""}${name}" to grocery list`, [
        { kind: "set_grocery", items: old },
      ]);
      return {
        persisted: true,
        modelResult: { status: "added", name, quantity, listSize: items.length },
        mutations: [{ kind: "set_grocery", items }],
        artifact: { id: ctx.newArtifactId(), type: "grocery_list", items, added: [name] },
      };
    },
  }),
  tool({
    name: "check_grocery_item",
    description:
      "Toggle the checked (bought) state of a grocery list item, matched by id or name (case-insensitive). Use when the user says they got or bought an item.",
    schema: z.object({
      item: z.string().describe("The grocery item's id or name, e.g. 'Greek yogurt'."),
    }),
    run: (input, ctx) => {
      const old = ctx.snapshot.grocery;
      const q = input.item.trim().toLowerCase();
      const normalizedQuery = groceryItemKey(input.item);
      const match = old.find(
        (i) => i.id === input.item || i.name.trim().toLowerCase() === q || groceryItemKey(i.name) === normalizedQuery
      );
      if (!match) {
        return {
          persisted: false,
          modelResult: { error: `No grocery item matching "${input.item}"` },
        };
      }
      const normalizedMatch = normalizeGroceryInput(match.name, match.quantity);
      const items = old.map((i) =>
        i.id === match.id
          ? {
              ...i,
              name: normalizedMatch.name,
              checked: !i.checked,
              ...(normalizedMatch.quantity ? { quantity: normalizedMatch.quantity } : {}),
            }
          : i
      );
      ctx.applyMutation({ kind: "set_grocery", items });
      recordAction(ctx.userId, `Toggled "${normalizedMatch.name}" on grocery list`, [
        { kind: "set_grocery", items: old },
      ]);
      return {
        persisted: true,
        modelResult: { name: normalizedMatch.name, toggled: normalizedMatch.name, checked: !match.checked },
        mutations: [{ kind: "set_grocery", items }],
        artifact: { id: ctx.newArtifactId(), type: "grocery_list", items, toggled: normalizedMatch.name },
      };
    },
  }),
  tool({
    name: "clear_grocery_list",
    description:
      "Remove every item from the grocery list. Destructive — only call after the user explicitly confirms.",
    schema: z.object({}),
    destructive: true,
    run: (_input, ctx) => {
      const old = ctx.snapshot.grocery;
      ctx.applyMutation({ kind: "set_grocery", items: [] });
      recordAction(ctx.userId, "Cleared grocery list", [{ kind: "set_grocery", items: old }]);
      return {
        persisted: true,
        modelResult: { cleared: true, removedCount: old.length },
        mutations: [{ kind: "set_grocery", items: [] }],
        artifact: { id: ctx.newArtifactId(), type: "grocery_list", items: [], cleared: true },
      };
    },
  }),
  tool({
    name: "update_preferences",
    description:
      "Update the user's dietary preferences: diet (e.g. 'vegetarian', 'keto'), allergies list, and/or display units (metric or imperial). Only pass the fields the user wants changed.",
    schema: z.object({
      diet: z
        .string()
        .optional()
        .describe("Diet to set, e.g. 'vegetarian', 'vegan', 'keto'. Replaces the current diet list."),
      allergies: z
        .array(z.string())
        .optional()
        .describe("Full list of allergies, e.g. ['peanuts', 'shellfish']. Replaces the current list."),
      units: z
        .enum(["metric", "imperial"])
        .optional()
        .describe("Preferred measurement units."),
    }),
    run: (input, ctx) => {
      const prefs = ctx.snapshot.preferences;
      const patch: Partial<typeof prefs> = {};
      const inverse: Partial<typeof prefs> = {};
      if (input.diet !== undefined) {
        patch.diets = [input.diet];
        inverse.diets = prefs.diets;
      }
      if (input.allergies !== undefined) {
        patch.allergies = input.allergies;
        inverse.allergies = prefs.allergies;
      }
      if (input.units !== undefined) {
        patch.units = input.units;
        inverse.units = prefs.units;
      }
      if (Object.keys(patch).length === 0) {
        return {
          persisted: false,
          modelResult: { error: "No preference fields provided" },
        };
      }
      ctx.applyMutation({ kind: "set_preferences", patch });
      recordAction(ctx.userId, "Updated preferences", [{ kind: "set_preferences", patch: inverse }]);
      return {
        persisted: true,
        modelResult: { updated: Object.keys(patch) },
        mutations: [{ kind: "set_preferences", patch }],
        artifact: { id: ctx.newArtifactId(), type: "preferences_updated", patch },
      };
    },
  }),
  tool({
    name: "get_daily_recap",
    description:
      "Build an end-of-day recap: totals vs targets, meal and workout counts, hydration/mood highlights, and one recommended next move. Use when the user asks how their day went or for a summary.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const { meals, totals, targets, workouts, bodyLog, date } = ctx.snapshot;
      const mealCount = meals.length;
      const workoutCount = workouts.length;
      const verdict = buildCoachVerdict(totals, targets, mealCount);

      const highlights: string[] = [];
      if (mealCount > 0) {
        highlights.push(`${mealCount} meal${mealCount === 1 ? "" : "s"} logged: ${totals.calories}/${targets.calories} kcal, ${totals.protein}/${targets.protein}g protein.`);
      }
      if (workoutCount > 0) {
        const minutes = workouts.reduce((sum, w) => sum + w.durationMin, 0);
        highlights.push(`${workoutCount} workout${workoutCount === 1 ? "" : "s"} (${minutes} min total).`);
      }
      const todayLog = bodyLog.find((e) => e.date === date);
      if (todayLog?.waterMl !== undefined) {
        highlights.push(`Water: ${todayLog.waterMl} ml.`);
      }
      if (todayLog?.mood !== undefined) {
        highlights.push(`Mood: ${todayLog.mood}/5.`);
      }

      const nextMove = `${verdict.title} ${verdict.body}`;

      return {
        persisted: false,
        modelResult: { totals, targets, mealCount, workoutCount, highlights, nextMove },
        artifact: {
          id: ctx.newArtifactId(),
          type: "daily_recap",
          totals,
          targets,
          mealCount,
          workoutCount,
          highlights,
          nextMove,
        },
      };
    },
  }),
]);
