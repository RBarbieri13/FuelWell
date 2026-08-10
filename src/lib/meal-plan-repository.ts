import type { SupabaseClient } from "@supabase/supabase-js";
import { planDaysSchema, weekStartSchema, type PlanDay } from "@/lib/meal-plan-types";

type MealPlanRow = {
  plan_days: unknown;
};

function errorMessage(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

function validateInput(userId: string, weekStart: string, days?: PlanDay[]) {
  if (!userId) throw new Error("Meal plan user is required.");
  weekStartSchema.parse(weekStart);
  if (days) planDaysSchema.parse(days);
}

function parseDays(value: unknown): PlanDay[] {
  const parsed = planDaysSchema.safeParse(value);
  if (!parsed.success) throw new Error("Stored meal plan data is invalid.");
  return parsed.data;
}

export async function loadWeeklyMealPlan(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
): Promise<PlanDay[]> {
  validateInput(userId, weekStart);
  const { data, error } = await supabase
    .from("user_weekly_meal_plans")
    .select("plan_days")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) throw new Error(errorMessage(error, "Unable to load the meal plan."));
  if (!data) return [];
  return parseDays((data as MealPlanRow).plan_days);
}

export async function replaceWeeklyMealPlan(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  days: PlanDay[],
): Promise<PlanDay[]> {
  validateInput(userId, weekStart, days);
  const { data, error } = await supabase
    .from("user_weekly_meal_plans")
    .upsert(
      {
        user_id: userId,
        week_start: weekStart,
        plan_days: days,
      },
      { onConflict: "user_id,week_start" },
    )
    .select("plan_days")
    .single();

  if (error || !data) {
    throw new Error(errorMessage(error, "Unable to save the meal plan."));
  }
  return parseDays((data as MealPlanRow).plan_days);
}
