export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MacroTargets = MacroTotals;

export type FoodItem = MacroTotals & {
  id: string;
  name: string;
  brand?: string;
  serving: string;
  tags: string[];
};

export type MealItem = MacroTotals & {
  id: string;
  name: string;
  servings: number;
};

export type MealRecord = {
  id: string;
  mealType: MealType;
  name: string;
  loggedAt: string;
  items: MealItem[];
};

export type ScoreContributor = {
  key: "nutrition" | "activity" | "recovery";
  label: string;
  score: number | null;
  href: string;
  status: string;
  detail: string;
  nextAction: string;
};

export const EMPTY_TOTALS: MacroTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

export const DEFAULT_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

export const SAMPLE_TARGETS: MacroTargets = {
  calories: 2250,
  protein: 175,
  carbs: 240,
  fat: 75,
};

export const SAMPLE_MEALS: MealRecord[] = [
  {
    id: "sample-breakfast",
    mealType: "breakfast",
    name: "Greek yogurt power bowl",
    loggedAt: new Date().toISOString(),
    items: [
      {
        id: "sample-yogurt",
        name: "Greek yogurt with berries",
        servings: 1,
        calories: 190,
        protein: 23,
        carbs: 22,
        fat: 2,
      },
      {
        id: "sample-granola",
        name: "Protein granola",
        servings: 0.5,
        calories: 140,
        protein: 8,
        carbs: 18,
        fat: 5,
      },
    ],
  },
  {
    id: "sample-lunch",
    mealType: "lunch",
    name: "Chicken quinoa bowl",
    loggedAt: new Date().toISOString(),
    items: [
      {
        id: "sample-chicken-bowl",
        name: "Chicken quinoa bowl",
        servings: 1,
        calories: 520,
        protein: 42,
        carbs: 48,
        fat: 18,
      },
    ],
  },
];

export const DEMO_FOODS: FoodItem[] = [
  {
    id: "chicken-bowl",
    name: "Chicken quinoa bowl",
    serving: "1 bowl",
    calories: 520,
    protein: 42,
    carbs: 48,
    fat: 18,
    tags: ["lunch", "high protein", "balanced"],
  },
  {
    id: "greek-yogurt",
    name: "Greek yogurt with berries",
    serving: "170g yogurt + berries",
    calories: 190,
    protein: 23,
    carbs: 22,
    fat: 2,
    tags: ["breakfast", "snack", "high protein"],
  },
  {
    id: "salmon-rice",
    name: "Salmon rice plate",
    serving: "1 plate",
    calories: 610,
    protein: 39,
    carbs: 58,
    fat: 24,
    tags: ["dinner", "omega 3", "recovery"],
  },
  {
    id: "eggs-toast",
    name: "Eggs and sourdough toast",
    serving: "2 eggs + 1 slice",
    calories: 310,
    protein: 20,
    carbs: 24,
    fat: 14,
    tags: ["breakfast", "quick"],
  },
  {
    id: "protein-shake",
    name: "Whey protein shake",
    serving: "1 scoop",
    calories: 130,
    protein: 25,
    carbs: 4,
    fat: 2,
    tags: ["snack", "high protein", "post workout"],
  },
  {
    id: "turkey-wrap",
    name: "Turkey avocado wrap",
    serving: "1 wrap",
    calories: 430,
    protein: 31,
    carbs: 38,
    fat: 17,
    tags: ["lunch", "portable"],
  },
];

export function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

export function roundTotals(totals: MacroTotals): MacroTotals {
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  };
}

export function multiplyFood(food: FoodItem, servings: number): MacroTotals {
  return roundTotals({
    calories: food.calories * servings,
    protein: food.protein * servings,
    carbs: food.carbs * servings,
    fat: food.fat * servings,
  });
}

export function sumMealItems(items: MealItem[]): MacroTotals {
  return roundTotals(
    items.reduce(
      (total, item) => ({
        calories: total.calories + item.calories,
        protein: total.protein + item.protein,
        carbs: total.carbs + item.carbs,
        fat: total.fat + item.fat,
      }),
      EMPTY_TOTALS
    )
  );
}

export function sumMeals(meals: MealRecord[], fallback?: MacroTotals): MacroTotals {
  const fromMeals = meals.reduce(
    (total, meal) => {
      const mealTotals = sumMealItems(meal.items);
      return {
        calories: total.calories + mealTotals.calories,
        protein: total.protein + mealTotals.protein,
        carbs: total.carbs + mealTotals.carbs,
        fat: total.fat + mealTotals.fat,
      };
    },
    EMPTY_TOTALS
  );

  if (fromMeals.calories > 0) {
    return roundTotals(fromMeals);
  }

  return fallback ? roundTotals(fallback) : EMPTY_TOTALS;
}

export function percentOf(current: number, target: number) {
  if (!target) return 0;
  return Math.round((current / target) * 100);
}

export function remaining(current: number, target: number) {
  return Math.max(0, Math.round(target - current));
}

export function scoreMacro(current: number, target: number) {
  if (!target || current <= 0) return 0;
  const ratio = current / target;
  if (ratio <= 1) return Math.round(ratio * 100);
  return Math.max(35, Math.round(100 - (ratio - 1) * 120));
}

export function calculateNutritionScore(totals: MacroTotals, targets: MacroTargets) {
  if (totals.calories <= 0) return null;
  const calorieScore = scoreMacro(totals.calories, targets.calories);
  const proteinScore = scoreMacro(totals.protein, targets.protein);
  const carbScore = scoreMacro(totals.carbs, targets.carbs);
  const fatScore = scoreMacro(totals.fat, targets.fat);

  return Math.round(
    calorieScore * 0.35 + proteinScore * 0.35 + carbScore * 0.15 + fatScore * 0.15
  );
}

export function buildScoreContributors(
  totals: MacroTotals,
  targets: MacroTargets,
  mealCount: number
): ScoreContributor[] {
  const nutritionScore = calculateNutritionScore(totals, targets);
  const hasNutrition = nutritionScore !== null;

  return [
    {
      key: "nutrition",
      label: "Nutrition",
      score: nutritionScore,
      href: "/app/nutrition",
      status: hasNutrition ? `${mealCount} meal${mealCount === 1 ? "" : "s"} logged` : "Needs first meal",
      detail: hasNutrition
        ? `${totals.calories} of ${targets.calories} calories, ${totals.protein}g protein logged.`
        : "No meals have been logged today, so FuelWell will not invent a nutrition score.",
      nextAction: hasNutrition
        ? "Open today's plate to see meal and macro detail."
        : "Log breakfast, lunch, dinner, or a snack to unlock today's nutrition score.",
    },
    {
      key: "activity",
      label: "Activity",
      score: null,
      href: "/app/fitness",
      status: "No wearable connected",
      detail: "Activity is waiting for a workout, step entry, or wearable connection.",
      nextAction: "Open Activity detail to review movement or choose a workout.",
    },
    {
      key: "recovery",
      label: "Recovery",
      score: null,
      href: "/app/recovery",
      status: "Checklist incomplete",
      detail: "Recovery needs sleep, soreness, energy, or readiness inputs before it can score the day.",
      nextAction: "Open Recovery to complete a fast readiness check.",
    },
  ];
}

export function calculateHealthScore(contributors: ScoreContributor[]) {
  const scored = contributors.filter(
    (contributor): contributor is ScoreContributor & { score: number } =>
      contributor.score !== null
  );

  if (scored.length === 0) return null;
  return Math.round(
    scored.reduce((sum, contributor) => sum + contributor.score, 0) / scored.length
  );
}

export function buildCoachVerdict(totals: MacroTotals, targets: MacroTargets, mealCount: number) {
  if (mealCount === 0 || totals.calories === 0) {
    return {
      title: "Start with one logged meal.",
      body: "FuelWell has no real inputs for today yet. Log the next meal so the coach can make a useful decision.",
      href: "/app/log",
      action: "Log first meal",
    };
  }

  if (totals.protein < targets.protein * 0.45 && totals.calories > targets.calories * 0.45) {
    return {
      title: "Prioritize protein next.",
      body: `You have ${remaining(totals.protein, targets.protein)}g protein left. Choose lean protein before adding more carbs or fat.`,
      href: "/app/coach",
      action: "Ask for protein ideas",
    };
  }

  if (totals.calories > targets.calories) {
    return {
      title: "Keep the rest of today light.",
      body: `You are ${totals.calories - targets.calories} calories over target. If you are hungry, keep it protein-forward and low-fat.`,
      href: "/app/coach",
      action: "Ask what still fits",
    };
  }

  return {
    title: "You have room to make a clean next choice.",
    body: `${remaining(totals.calories, targets.calories).toLocaleString()} calories and ${remaining(totals.protein, targets.protein)}g protein remain. Plan the next meal around that gap.`,
    href: "/app/recipes",
    action: "Find meals that fit",
  };
}

export function formatMealType(type: MealType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
