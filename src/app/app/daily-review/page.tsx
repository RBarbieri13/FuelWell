import { headers } from "next/headers";
import { DailyReviewSurface } from "@/components/daily-detail/detail-surfaces";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_TARGETS,
  formatMealType,
  sumMeals,
  todayIsoDate,
  type MealItem,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";
import { loadServerDailyGoalContext } from "@/lib/server-goal-context";

type SupabaseMealItem = {
  id: string;
  custom_name: string | null;
  servings: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

type SupabaseMeal = {
  id: string;
  meal_type: MealType;
  name: string | null;
  logged_at: string;
  meal_items?: SupabaseMealItem[] | null;
};

function mapItem(item: SupabaseMealItem): MealItem {
  return {
    id: item.id,
    name: item.custom_name || "Logged food",
    servings: Number(item.servings ?? 1),
    calories: Number(item.calories ?? 0),
    protein: Number(item.protein ?? 0),
    carbs: Number(item.carbs ?? 0),
    fat: Number(item.fat ?? 0),
  };
}

function mapMeal(meal: SupabaseMeal): MealRecord {
  return {
    id: meal.id,
    mealType: meal.meal_type,
    name: meal.name || formatMealType(meal.meal_type),
    loggedAt: meal.logged_at,
    items: (meal.meal_items || []).map(mapItem),
  };
}

export default async function DailyReviewPage() {
  const host = (await headers()).get("host");
  const isPreview = isPreviewHost(host);
  if (isPreview) {
    const sample = getSampleDay();
    return <DailyReviewSurface meals={sample.meals} targets={sample.targets} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = todayIsoDate();
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  const [profileResult, mealsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("calorie_target, protein_target, carbs_target, fat_target, goal")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("meals")
      .select("id, meal_type, name, logged_at, meal_items(id, custom_name, servings, calories, protein, carbs, fat)")
      .eq("user_id", user!.id)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: true }),
  ]);

  const targets = {
    calories: profileResult.data?.calorie_target ?? DEFAULT_TARGETS.calories,
    protein: profileResult.data?.protein_target ?? DEFAULT_TARGETS.protein,
    carbs: profileResult.data?.carbs_target ?? DEFAULT_TARGETS.carbs,
    fat: profileResult.data?.fat_target ?? DEFAULT_TARGETS.fat,
  };
  const meals = ((mealsResult.data || []) as SupabaseMeal[]).map(mapMeal);
  const goalContext = await loadServerDailyGoalContext(supabase, {
    userId: user!.id,
    date: today,
    meals,
    totals: sumMeals(meals),
    targets,
    profile: { goal: profileResult.data?.goal },
  });

  return <DailyReviewSurface meals={meals} targets={goalContext.targets} />;
}
