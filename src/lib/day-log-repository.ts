import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatMealType,
  sumMeals,
  type MealItem,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";

type DatabaseMealItem = {
  id: string;
  custom_name: string | null;
  servings: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

type DatabaseMeal = {
  id: string;
  meal_type: MealType;
  name: string | null;
  logged_at: string;
  meal_items?: DatabaseMealItem[] | null;
};

const MEAL_SELECT =
  "id, meal_type, name, logged_at, meal_items(id, custom_name, servings, calories, protein, carbs, fat)";

function assertDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Day log date must use YYYY-MM-DD format.");
  }
}

function dayBounds(date: string) {
  assertDate(date);
  const start = `${date}T00:00:00.000Z`;
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return { start, end: next.toISOString() };
}

function mapItem(item: DatabaseMealItem): MealItem {
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

function mapMeal(meal: DatabaseMeal): MealRecord {
  return {
    id: meal.id,
    mealType: meal.meal_type,
    name: meal.name || formatMealType(meal.meal_type),
    loggedAt: meal.logged_at,
    items: (meal.meal_items ?? []).map(mapItem),
  };
}

function errorMessage(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

export async function loadDayMeals(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<MealRecord[]> {
  const { start, end } = dayBounds(date);
  const { data, error } = await supabase
    .from("meals")
    .select(MEAL_SELECT)
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lt("logged_at", end)
    .order("logged_at", { ascending: true });

  if (error) throw new Error(errorMessage(error, "Unable to load meals."));
  return ((data ?? []) as DatabaseMeal[]).map(mapMeal);
}

async function ensureDailyLog(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<string> {
  assertDate(date);
  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      { user_id: userId, log_date: date },
      { onConflict: "user_id,log_date" },
    )
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(errorMessage(error, "Unable to create today's day log."));
  }
  return data.id as string;
}

async function refreshDailyTotals(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<MealRecord[]> {
  const meals = await loadDayMeals(supabase, userId, date);
  const totals = sumMeals(meals);
  const dailyLogId = await ensureDailyLog(supabase, userId, date);
  const { error } = await supabase
    .from("daily_logs")
    .update({
      calories_consumed: Math.round(totals.calories),
      protein_consumed: totals.protein,
      carbs_consumed: totals.carbs,
      fat_consumed: totals.fat,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dailyLogId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(errorMessage(error, "Meal saved, but daily totals did not update."));
  }
  return meals;
}

export async function saveMeal(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  meal: MealRecord,
): Promise<MealRecord[]> {
  const bounds = dayBounds(date);
  if (meal.loggedAt < bounds.start || meal.loggedAt >= bounds.end) {
    throw new Error("Meal timestamp does not belong to the requested day log.");
  }
  const dailyLogId = await ensureDailyLog(supabase, userId, date);
  const existing = await supabase
    .from("meals")
    .select("id")
    .eq("id", meal.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing.error) {
    throw new Error(errorMessage(existing.error, "Unable to verify meal ownership."));
  }

  const { error: mealError } = await supabase.from("meals").upsert(
    {
      id: meal.id,
      user_id: userId,
      daily_log_id: dailyLogId,
      meal_type: meal.mealType,
      name: meal.name,
      logged_at: meal.loggedAt,
    },
    { onConflict: "id" },
  );
  if (mealError) throw new Error(errorMessage(mealError, "Unable to save meal."));

  try {
    const currentItems = await supabase
      .from("meal_items")
      .select("id")
      .eq("meal_id", meal.id);
    if (currentItems.error) {
      throw new Error(errorMessage(currentItems.error, "Unable to inspect meal items."));
    }

    const incomingIds = new Set(meal.items.map((item) => item.id));
    const staleIds = (currentItems.data ?? [])
      .map((item) => item.id as string)
      .filter((id) => !incomingIds.has(id));
    if (staleIds.length > 0) {
      const { error } = await supabase
        .from("meal_items")
        .delete()
        .eq("meal_id", meal.id)
        .in("id", staleIds);
      if (error) throw new Error(errorMessage(error, "Unable to remove stale meal items."));
    }

    if (meal.items.length > 0) {
      const { error } = await supabase.from("meal_items").upsert(
        meal.items.map((item) => ({
          id: item.id,
          meal_id: meal.id,
          custom_name: item.name,
          servings: item.servings,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        })),
        { onConflict: "id" },
      );
      if (error) throw new Error(errorMessage(error, "Unable to save meal items."));
    }
  } catch (error) {
    if (!existing.data) {
      await supabase.from("meals").delete().eq("id", meal.id).eq("user_id", userId);
    }
    throw error;
  }

  return refreshDailyTotals(supabase, userId, date);
}

export async function updateDayMealItem(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  mealId: string,
  itemId: string,
  patch: Partial<Omit<MealItem, "id">>,
): Promise<MealRecord[]> {
  const { start, end } = dayBounds(date);
  const owner = await supabase
    .from("meals")
    .select("id")
    .eq("id", mealId)
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lt("logged_at", end)
    .maybeSingle();
  if (owner.error || !owner.data) {
    throw new Error(errorMessage(owner.error, "Meal was not found."));
  }

  const row = {
    ...(patch.name === undefined ? {} : { custom_name: patch.name }),
    ...(patch.servings === undefined ? {} : { servings: patch.servings }),
    ...(patch.calories === undefined ? {} : { calories: patch.calories }),
    ...(patch.protein === undefined ? {} : { protein: patch.protein }),
    ...(patch.carbs === undefined ? {} : { carbs: patch.carbs }),
    ...(patch.fat === undefined ? {} : { fat: patch.fat }),
  };
  const { data, error } = await supabase
    .from("meal_items")
    .update(row)
    .eq("id", itemId)
    .eq("meal_id", mealId)
    .select("id")
    .maybeSingle();
  if (error || !data) throw new Error(errorMessage(error, "Meal item was not found."));

  return refreshDailyTotals(supabase, userId, date);
}

export async function deleteDayMeal(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  mealId: string,
): Promise<MealRecord[]> {
  const { start, end } = dayBounds(date);
  const { data, error } = await supabase
    .from("meals")
    .delete()
    .eq("id", mealId)
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lt("logged_at", end)
    .select("id")
    .maybeSingle();
  if (error || !data) throw new Error(errorMessage(error, "Meal was not found."));

  return refreshDailyTotals(supabase, userId, date);
}
