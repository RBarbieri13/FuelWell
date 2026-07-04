/**
 * coach-logging — pure parsing helpers for the Coach chat log flow.
 *
 * Turns a free-text message ("log 2 eggs and toast", "ate a chicken bowl",
 * "log a 30 min walk") into a structured intent the page can render as a
 * confirm chip. No persistence here — the page commits on confirm via
 * useDayLog().addMeal. Workouts have no store yet, so they resolve to an
 * in-session acknowledgement only.
 */

import {
  macrosForPortion,
  searchFoods,
  type FoodItem,
} from "@/lib/food-database";
import type { MealType } from "@/lib/fuelwell-data";

export type ParsedFood = {
  food: FoodItem;
  /** quantity multiplier the user implied ("2 eggs" -> 2). */
  quantity: number;
  /** grams/ml committed (base serving x quantity). */
  amount: number;
  servingLabel: string;
  macros: { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
};

export type MealLogIntent = {
  kind: "meal";
  mealType: MealType;
  /** original noun phrase, for the meal record name. */
  name: string;
  foods: ParsedFood[];
};

export type WorkoutLogIntent = {
  kind: "workout";
  /** human label, e.g. "30 min walk". */
  label: string;
  minutes: number | null;
};

export type LogIntent = MealLogIntent | WorkoutLogIntent;

const LOG_TRIGGERS = /\b(log|ate|eat|eating|had|track|add)\b/;

const WORKOUT_WORDS = [
  "walk",
  "run",
  "jog",
  "ride",
  "cycle",
  "bike",
  "swim",
  "lift",
  "workout",
  "yoga",
  "hike",
  "row",
  "session",
  "training",
  "cardio",
  "strength",
];

const STOP_WORDS = new Set([
  "log",
  "ate",
  "eat",
  "eating",
  "had",
  "track",
  "add",
  "a",
  "an",
  "the",
  "some",
  "of",
  "and",
  "with",
  "plus",
  "my",
  "for",
  "to",
  "i",
  "just",
  "today",
  "please",
  "this",
  "that",
  "bowl",
  "plate",
  "serving",
  "servings",
  "portion",
]);

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  half: 0.5,
};

/** True when the message reads like a request to log something. */
export function isLogMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return LOG_TRIGGERS.test(lower);
}

function looksLikeWorkout(lower: string): boolean {
  return WORKOUT_WORDS.some((w) => new RegExp(`\\b${w}`).test(lower));
}

function parseMinutes(lower: string): number | null {
  const match = lower.match(/(\d+)\s*(?:min|minute|minutes|m)\b/);
  if (match) return Number(match[1]);
  const hour = lower.match(/(\d+)\s*(?:hr|hour|hours|h)\b/);
  if (hour) return Number(hour[1]) * 60;
  return null;
}

function workoutLabel(lower: string): string {
  const verb = WORKOUT_WORDS.find((w) => new RegExp(`\\b${w}`).test(lower));
  const minutes = parseMinutes(lower);
  const noun = verb ?? "workout";
  if (minutes) return `${minutes} min ${noun}`;
  return noun;
}

/**
 * Pull candidate food phrases from the message. We split on connectors
 * ("and", "with", "plus", commas) so "2 eggs and toast" -> ["2 eggs", "toast"].
 */
function splitPhrases(lower: string): string[] {
  return lower
    .replace(LOG_TRIGGERS, " ")
    .split(/\b(?:and|with|plus)\b|,|&/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function leadingQuantity(phrase: string): { quantity: number; rest: string } {
  const numMatch = phrase.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
  if (numMatch) return { quantity: Number(numMatch[1]), rest: numMatch[2] };
  const words = phrase.split(/\s+/);
  const first = words[0];
  if (first && NUMBER_WORDS[first] !== undefined) {
    return { quantity: NUMBER_WORDS[first], rest: words.slice(1).join(" ") };
  }
  return { quantity: 1, rest: phrase };
}

function cleanNoun(rest: string): string {
  return rest
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    .join(" ")
    .trim();
}

function resolveFood(phrase: string): ParsedFood | null {
  const { quantity, rest } = leadingQuantity(phrase);
  const noun = cleanNoun(rest);
  if (noun.length < 2) return null;

  let matches = searchFoods(noun, 1);
  if (matches.length === 0) {
    // Retry on the last word — "wheat toast" -> "toast".
    const lastWord = noun.split(/\s+/).pop();
    if (lastWord && lastWord.length >= 2) matches = searchFoods(lastWord, 1);
  }
  const food = matches[0];
  if (!food) return null;

  const baseServing =
    food.commonServings.find((s) => /standard/i.test(s.label)) ??
    food.commonServings[0];
  const baseAmount = baseServing?.amount ?? 100;
  const amount = Math.round(baseAmount * quantity);

  return {
    food,
    quantity,
    amount,
    servingLabel: baseServing?.label ?? `${baseAmount} ${food.servingUnit}`,
    macros: macrosForPortion(food, amount),
  };
}

function inferMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

/**
 * Parse a log message into an actionable intent, or null when nothing
 * resolvable was found (the page then falls back to routing copy).
 */
export function parseLogIntent(message: string): LogIntent | null {
  const lower = message.toLowerCase().trim();
  if (!isLogMessage(lower) && !looksLikeWorkout(lower)) return null;

  if (looksLikeWorkout(lower)) {
    return {
      kind: "workout",
      label: workoutLabel(lower),
      minutes: parseMinutes(lower),
    };
  }

  if (!isLogMessage(lower)) return null;

  const foods = splitPhrases(lower)
    .map(resolveFood)
    .filter((f): f is ParsedFood => f !== null);

  if (foods.length === 0) return null;

  const name =
    foods.length === 1
      ? foods[0].food.name
      : foods.map((f) => f.food.name).join(" + ");

  return { kind: "meal", mealType: inferMealType(), name, foods };
}
