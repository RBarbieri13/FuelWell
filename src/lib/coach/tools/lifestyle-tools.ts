import { z } from "zod";
import { registerTools } from "../registry";
import { recordAction } from "../last-action";
import { newEntityId } from "../ids";
import type { CoachToolDef, GroceryItem } from "../types";
import { buildCoachVerdict, remaining } from "@/lib/fuelwell-data";
import { FOOD_DATABASE, macrosForPortion } from "@/lib/food-database";

/**
 * Lifestyle tools: restaurant picks, grocery list, preferences, daily recap.
 */

const FULL_PORTION_G = 300;

/** Preserves the per-tool input type that the registerTools array literal erases. */
function tool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

registerTools([
  tool({
    name: "find_restaurant_picks",
    description:
      "Find the top 3 restaurant/fast-food menu items that fit the user's remaining macros for today (fit remaining calories, maximize protein coverage). Optionally filter by restaurant name (e.g. 'Chipotle') and/or a preference like 'high-protein' or 'low-carb'. Use when the user is eating out and wants to know what to order.",
    schema: z.object({
      restaurant: z
        .string()
        .optional()
        .describe("Restaurant or chain name to filter by, e.g. 'Chipotle' or 'KFC'. Omit to search all restaurant foods."),
      preference: z
        .string()
        .optional()
        .describe("Optional preference filter matched against item names and tags, e.g. 'high-protein', 'low-carb', 'chicken', 'salad'."),
    }),
    run: (input, ctx) => {
      const { totals, targets } = ctx.snapshot;
      const remainingKcal = remaining(totals.calories, targets.calories);
      const remainingProtein = remaining(totals.protein, targets.protein);

      let items = FOOD_DATABASE.filter((f) => f.category === "restaurant");

      let matchedRestaurant = true;
      if (input.restaurant) {
        const q = input.restaurant.trim().toLowerCase();
        const matches = items.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.tags.some((t) => t.toLowerCase().includes(q))
        );
        if (matches.length > 0) {
          items = matches;
        } else {
          matchedRestaurant = false;
        }
      }

      if (input.preference) {
        const p = input.preference.trim().toLowerCase();
        const matches = items.filter(
          (f) =>
            f.name.toLowerCase().includes(p) ||
            f.tags.some((t) => t.toLowerCase().includes(p))
        );
        if (matches.length > 0) items = matches;
      }

      const scored = items.map((f) => {
        const macros = macrosForPortion(f, FULL_PORTION_G);
        const proteinCoverage =
          remainingProtein > 0 ? Math.min(macros.protein / remainingProtein, 1) : 0.5;
        const kcalOverage =
          remainingKcal > 0 ? Math.max(0, macros.kcal - remainingKcal) / remainingKcal : macros.kcal / 500;
        const score = proteinCoverage - kcalOverage * 1.5;
        return { food: f, macros, score };
      });
      scored.sort((a, b) => b.score - a.score);

      const picks = scored.slice(0, 3).map(({ food, macros }) => {
        const fitsKcal = macros.kcal <= remainingKcal;
        const why = fitsKcal
          ? `${macros.protein}g protein for ${macros.kcal} kcal — fits your remaining ${remainingKcal} kcal budget.`
          : `${macros.protein}g protein, but ${macros.kcal} kcal runs over your remaining ${remainingKcal} kcal — consider a half portion.`;
        return {
          foodId: food.id,
          name: food.name,
          macros: {
            calories: macros.kcal,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
          },
          why,
          portion: `Full portion (${FULL_PORTION_G} g)`,
        };
      });

      return {
        persisted: false,
        modelResult: {
          restaurant: input.restaurant ?? null,
          matchedRestaurant,
          remaining: { calories: remainingKcal, protein: remainingProtein },
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
        modelResult: { items: items.map((i) => ({ name: i.name, checked: i.checked })) },
        artifact: { id: ctx.newArtifactId(), type: "grocery_list", items },
      };
    },
  }),
  tool({
    name: "add_grocery_item",
    description:
      "Add one item to the user's grocery list. Deduplicates case-insensitively — if the item is already on the list, nothing changes.",
    schema: z.object({
      name: z.string().describe("Item to add, e.g. 'Greek yogurt' or 'Chicken breast'."),
    }),
    run: (input, ctx) => {
      const old = ctx.snapshot.grocery;
      const name = input.name.trim();
      const exists = old.some((i) => i.name.trim().toLowerCase() === name.toLowerCase());
      if (exists) {
        return {
          persisted: false,
          modelResult: { status: "already on list", name },
          artifact: { id: ctx.newArtifactId(), type: "grocery_list", items: old, added: [] },
        };
      }
      const item: GroceryItem = { id: newEntityId("coach-grocery"), name, checked: false };
      const items = [...old, item];
      ctx.applyMutation({ kind: "set_grocery", items });
      recordAction(ctx.userId, `Added "${name}" to grocery list`, [
        { kind: "set_grocery", items: old },
      ]);
      return {
        persisted: true,
        modelResult: { status: "added", name, listSize: items.length },
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
      const match = old.find(
        (i) => i.id === input.item || i.name.trim().toLowerCase() === q
      );
      if (!match) {
        return {
          persisted: false,
          modelResult: { error: `No grocery item matching "${input.item}"` },
        };
      }
      const items = old.map((i) =>
        i.id === match.id ? { ...i, checked: !i.checked } : i
      );
      ctx.applyMutation({ kind: "set_grocery", items });
      recordAction(ctx.userId, `Toggled "${match.name}" on grocery list`, [
        { kind: "set_grocery", items: old },
      ]);
      return {
        persisted: true,
        modelResult: { toggled: match.name, checked: !match.checked },
        mutations: [{ kind: "set_grocery", items }],
        artifact: { id: ctx.newArtifactId(), type: "grocery_list", items, toggled: match.name },
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
