import Link from "next/link";
import { ArrowRight, Plus, UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_TARGETS,
  formatMealType,
  percentOf,
  remaining,
  sumMealItems,
  sumMeals,
  todayIsoDate,
  type MealItem,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";

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

export default async function NutritionPage() {
  const host = (await headers()).get("host");
  const isPreview = isPreviewHost(host);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isPreview) {
    const sample = getSampleDay();
    return <NutritionDetail meals={sample.meals} targets={sample.targets} />;
  }

  const today = todayIsoDate();
  const start = `${today}T00:00:00.000Z`;
  const end = `${today}T23:59:59.999Z`;

  const [profileResult, mealsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("calorie_target, protein_target, carbs_target, fat_target")
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

  return <NutritionDetail meals={meals} targets={targets} />;
}

function NutritionDetail({
  meals,
  targets,
}: {
  meals: MealRecord[];
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}) {
  const totals = sumMeals(meals);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <Card variant="elevated" className="bg-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-primary-700">Today&apos;s Plate</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-900">
              Nutrition detail
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-neutral-500">
              This page shows what makes up the nutrition score today. If a meal is not logged here, it is not counted on the dashboard.
            </p>
          </div>
          <Link href="/app/log">
            <Button>
              <Plus className="h-4 w-4" />
              Add food
            </Button>
          </Link>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-4">
        <TargetTile label="Calories" current={totals.calories} target={targets.calories} unit="kcal" />
        <TargetTile label="Protein" current={totals.protein} target={targets.protein} unit="g" />
        <TargetTile label="Carbs" current={totals.carbs} target={targets.carbs} unit="g" />
        <TargetTile label="Fat" current={totals.fat} target={targets.fat} unit="g" />
      </section>

      {meals.length === 0 ? (
        <Card className="border-dashed border-neutral-300 bg-white/75 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-neutral-900">
            No nutrition inputs yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-neutral-500">
            The dashboard score is blank because there are no meals to inspect. Log one meal and this page becomes the source of truth.
          </p>
          <Link href="/app/log" className="mt-6 inline-flex">
            <Button size="lg">
              Log first meal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <section className="space-y-4">
          {meals.map((meal) => {
            const mealTotals = sumMealItems(meal.items);
            return (
              <Card key={meal.id} className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-neutral-900">
                      {formatMealType(meal.mealType)}
                    </h2>
                    <p className="text-sm font-medium text-neutral-500">
                      {meal.name} - {meal.items.length} item{meal.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-neutral-100 px-4 py-2 text-right">
                    <p className="text-lg font-black tabular-nums text-neutral-900">
                      {mealTotals.calories} cal
                    </p>
                    <p className="text-xs font-bold text-neutral-400">
                      {mealTotals.protein}g protein
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-3 md:grid-cols-[1fr_0.6fr]"
                    >
                      <div>
                        <p className="font-bold text-neutral-900">{item.name}</p>
                        <p className="text-sm font-medium text-neutral-500">
                          {item.servings} serving{item.servings === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <SmallMacro label="Cal" value={item.calories} />
                        <SmallMacro label="Pro" value={item.protein} />
                        <SmallMacro label="Carb" value={item.carbs} />
                        <SmallMacro label="Fat" value={item.fat} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

function TargetTile({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-neutral-500">{label}</p>
        <p className="text-xs font-bold text-neutral-400">{percentOf(current, target)}%</p>
      </div>
      <p className="text-3xl font-black tabular-nums text-neutral-900">
        {current}
        <span className="ml-1 text-sm font-bold text-neutral-400">{unit}</span>
      </p>
      <p className="text-xs font-bold text-neutral-500">
        {remaining(current, target)} {unit} left of {target}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${Math.min(percentOf(current, target), 100)}%` }}
        />
      </div>
    </Card>
  );
}

function SmallMacro({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white px-2 py-2">
      <p className="text-sm font-black tabular-nums text-neutral-900">{value}</p>
      <p className="text-[10px] font-bold uppercase text-neutral-400">{label}</p>
    </div>
  );
}
