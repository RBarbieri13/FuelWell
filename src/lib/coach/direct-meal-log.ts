import { macrosForPortion, resolveFood } from "@/lib/food-database";

/**
 * Deterministic meal-log fast path for /api/coach/turn. Messages like
 * "log 2 eggs for breakfast" or "I had oatmeal 300 calories for lunch"
 * execute a real tool without a model call. Two forms:
 *
 * 1. Explicit calories  -> log_custom_meal with a standard macro split.
 * 2. No calories        -> the food is resolved from the food database
 *    (fuzzy name match) and logged via log_meal with real macros; the
 *    quantity ("2 eggs", "a bowl of oatmeal") scales the portion.
 *
 * Returns null when the message doesn't parse confidently — the turn then
 * flows through the normal model path.
 */

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export type DirectMealLog = {
  tool: "log_custom_meal" | "log_meal";
  input: Record<string, unknown>;
  /** Deterministic assistant reply describing exactly what was logged. */
  reply: string;
};

const WORD_COUNTS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  dozen: 12,
};

/** Container/filler words that describe a portion, not the food itself. */
const FILLER_WORDS =
  /\b(a|an|the|some|of|my|bowl|bowls|cup|cups|glass|glasses|plate|plates|serving|servings|portion|portions)\b/gi;

export function parseDirectMealLog(text: string): DirectMealLog | null {
  const normalized = text.trim();
  if (!/\b(i ate|i had|log|add)\b/i.test(normalized)) return null;
  const slot = MEAL_SLOTS.find((candidate) =>
    new RegExp(`\\b${candidate}\\b`, "i").test(normalized),
  );
  if (!slot) return null;

  const calorieMatch = normalized.match(/\b(\d{2,4})\s*(?:kcal|cal(?:orie)?s?)\b/i);
  if (calorieMatch) {
    const kcal = Number(calorieMatch[1]);
    if (!Number.isFinite(kcal) || kcal <= 0) return null;

    const name = normalized
      .replace(/\b(i ate|i had|please log|log|add)\b/i, "")
      .replace(/\b(for|at|to)\s+(breakfast|lunch|dinner|snack)\b/gi, "")
      .replace(/\b\d{2,4}\s*(?:kcal|cal(?:orie)?s?)\b/gi, "")
      .replace(/\b(a|an|the)\b/gi, " ")
      .replace(/[,.;:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (name.length < 2 || name.length > 80) return null;

    const protein = Math.max(1, Math.round((kcal * 0.25) / 4));
    const carbs = Math.max(0, Math.round((kcal * 0.45) / 4));
    const fat = Math.max(0, Math.round((kcal * 0.3) / 9));

    return {
      tool: "log_custom_meal",
      input: { name, kcal, protein, carbs, fat, meal_slot: slot },
      reply: `Logged ${name} as an additional ${slot}.`,
    };
  }

  // No explicit calories: resolve the food from the database.
  let rest = normalized
    .replace(/\b(i ate|i had|please log|log|add)\b/i, "")
    .replace(/\b(for|at|to|as)\s+(breakfast|lunch|dinner|snack)\b/gi, " ")
    .replace(/\b(breakfast|lunch|dinner|snack)\b/gi, " ")
    .replace(/[,.;:!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let count = 1;
  const digitMatch = rest.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  const wordMatch = rest.match(/^([a-z]+)\s+(.+)$/i);
  if (digitMatch) {
    count = Number(digitMatch[1]);
    rest = digitMatch[2];
  } else if (wordMatch && WORD_COUNTS[wordMatch[1].toLowerCase()] !== undefined) {
    count = WORD_COUNTS[wordMatch[1].toLowerCase()];
    rest = wordMatch[2];
  }

  const query = rest.replace(FILLER_WORDS, " ").replace(/\s+/g, " ").trim();
  if (query.length < 3 || query.length > 60) return null;
  if (!Number.isFinite(count) || count <= 0 || count > 50) return null;

  let food = resolveFood(query);
  if (!food && /(?:es|s)$/i.test(query)) {
    food = resolveFood(query.replace(/es$/i, "").replace(/s$/i, ""));
  }
  if (!food) return null;

  // Per-unit grams: an explicit "(N g each)" in the name wins; otherwise the
  // standard one-tap serving preset.
  const each = food.name.match(/\((\d+(?:\.\d+)?)\s*g each\)/i);
  const perUnit = each
    ? Number(each[1])
    : food.commonServings[1]?.amount ?? food.commonServings[0]?.amount ?? 100;
  const portion = Math.min(2000, Math.max(1, Math.round(count * perUnit)));
  const macros = macrosForPortion(food, portion);

  return {
    tool: "log_meal",
    input: { food_id: food.id, portion, meal_slot: slot },
    reply: `Logged ${food.name} (${portion} ${food.servingUnit}, ~${macros.kcal} kcal) as ${slot}.`,
  };
}
