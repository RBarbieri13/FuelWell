import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { MealItem, MealRecord, MealType } from "@/lib/fuelwell-data";
import { DEFAULT_TARGETS, sumMeals, todayIsoDate } from "@/lib/fuelwell-data";
import { headers } from "next/headers";
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

function mapMealItem(item: SupabaseMealItem): MealItem {
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
    name: meal.name || "Meal",
    loggedAt: meal.logged_at,
    items: (meal.meal_items || []).map(mapMealItem),
  };
}

export default async function DashboardPage() {
  const host = (await headers()).get("host");
  const isPreview = isPreviewHost(host);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isPreview) {
    const sample = getSampleDay();
    return (
      <DashboardClient
        displayName={sample.user.displayName}
        targets={sample.targets}
        fallbackTotals={sample.totals}
        meals={sample.meals}
        onboardingComplete
        goal={sample.user.goal}
        dietaryPreference={sample.user.dietaryPreference}
        allergies={sample.user.allergies}
      />
    );
  }

  const today = todayIsoDate();
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  const [profileResult, logResult, mealsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name, calorie_target, protein_target, carbs_target, fat_target, onboarding_complete, goal, dietary_preference, allergies"
      )
      .eq("id", user!.id)
      .single(),
    supabase
      .from("daily_logs")
      .select("calories_consumed, protein_consumed, carbs_consumed, fat_consumed")
      .eq("user_id", user!.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("meals")
      .select("id, meal_type, name, logged_at, meal_items(id, custom_name, servings, calories, protein, carbs, fat)")
      .eq("user_id", user!.id)
      .gte("logged_at", start)
      .lte("logged_at", end)
      .order("logged_at", { ascending: true }),
  ]);

  const profile = profileResult.data;
  const log = logResult.data;
  const meals = ((mealsResult.data || []) as SupabaseMeal[]).map(mapMeal);
  const profileTargets = {
    calories: profile?.calorie_target ?? DEFAULT_TARGETS.calories,
    protein: profile?.protein_target ?? DEFAULT_TARGETS.protein,
    carbs: profile?.carbs_target ?? DEFAULT_TARGETS.carbs,
    fat: profile?.fat_target ?? DEFAULT_TARGETS.fat,
  };
  const fallbackTotals = {
    calories: Number(log?.calories_consumed ?? 0),
    protein: Number(log?.protein_consumed ?? 0),
    carbs: Number(log?.carbs_consumed ?? 0),
    fat: Number(log?.fat_consumed ?? 0),
  };
  const mealTotals = sumMeals(meals);
  const goalContext = await loadServerDailyGoalContext(supabase, {
    userId: user!.id,
    date: today,
    meals,
    totals: mealTotals.calories > 0 ? mealTotals : fallbackTotals,
    targets: profileTargets,
    profile: { goal: profile?.goal },
  });

  return (
    <DashboardClient
      displayName={profile?.display_name || user?.email?.split("@")[0] || "there"}
      targets={goalContext.targets}
      fallbackTotals={fallbackTotals}
      meals={meals}
      onboardingComplete={profile?.onboarding_complete ?? false}
      goal={profile?.goal || "lose"}
      dietaryPreference={profile?.dietary_preference || "none"}
      allergies={profile?.allergies || []}
    />
  );
}
