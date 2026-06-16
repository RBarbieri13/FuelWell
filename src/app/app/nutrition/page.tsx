import Link from "next/link";
import { ArrowRight, Beef, Flame, Plus, Salad, Sun, UtensilsCrossed, Wheat } from "lucide-react";
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

  return <NutritionDetail meals={meals} targets={goalContext.targets} />;
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
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-7">
          <h1 className="fw-heading text-3xl md:text-4xl">Nutrition detail</h1>
          <p className="fw-muted mt-1 text-base">Today&apos;s plate · what&apos;s counting toward your score</p>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
      <Card variant="elevated" className="bg-white px-8 py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-primary-700">
              <Salad className="h-4 w-4" />
              Today&apos;s plate
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-neutral-900 md:text-4xl">
              What makes up today&apos;s score
            </h2>
            <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-neutral-500">
              If a meal isn&apos;t logged here, it isn&apos;t counted on the dashboard. Keep it honest and the daily decision stays accurate.
            </p>
          </div>
          <Link href="/app/log">
            <Button size="lg" className="rounded-full">
              <Plus className="h-4 w-4" />
              Add food
            </Button>
          </Link>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <TargetTile label="Calories" current={totals.calories} target={targets.calories} unit="kcal" tone="primary" icon="calories" />
        <TargetTile label="Protein" current={totals.protein} target={targets.protein} unit="g" tone="sky" icon="protein" />
        <TargetTile label="Carbs" current={totals.carbs} target={targets.carbs} unit="g" tone="lemon" icon="carbs" />
        <TargetTile label="Fat" current={totals.fat} target={targets.fat} unit="g" tone="accent" icon="fat" />
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
              <Card key={meal.id} className="space-y-5 px-7 py-7">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <MealIcon mealType={meal.mealType} />
                    <div>
                      <h2 className="text-2xl font-black text-neutral-900">
                        {formatMealType(meal.mealType)}
                      </h2>
                      <p className="text-base font-semibold text-neutral-400">
                        {meal.name} · {meal.items.length} item{meal.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[1.2rem] bg-neutral-50 px-5 py-3 text-right">
                    <p className="text-2xl font-black tabular-nums text-neutral-900">
                      {mealTotals.calories} cal
                    </p>
                    <p className="text-sm font-bold text-primary-600">
                      {mealTotals.protein}g protein
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {meal.items.map((item) => (
                    <div key={item.id} className="grid gap-4 border-t border-neutral-100 py-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="text-lg font-black text-neutral-900">{item.name}</p>
                        <p className="text-base font-semibold text-neutral-400">
                          {item.servings} serving{item.servings === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <SmallMacro label="Cal" value={item.calories} tone="primary" />
                        <SmallMacro label="Pro" value={item.protein} tone="sky" />
                        <SmallMacro label="Carb" value={item.carbs} tone="lemon" />
                        <SmallMacro label="Fat" value={item.fat} tone="accent" />
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
    </div>
  );
}

function TargetTile({
  label,
  current,
  target,
  unit,
  tone,
  icon,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  tone: "primary" | "sky" | "lemon" | "accent";
  icon: "calories" | "protein" | "carbs" | "fat";
}) {
  const Icon = icon === "calories" ? Flame : icon === "protein" ? Beef : icon === "carbs" ? Wheat : Salad;
  const styles = {
    primary: {
      chip: "bg-primary-100 text-primary-600",
      pill: "bg-primary-100 text-primary-700",
      bar: "bg-primary-500",
    },
    sky: {
      chip: "bg-sky-100 text-sky-600",
      pill: "bg-sky-100 text-sky-700",
      bar: "bg-sky-500",
    },
    lemon: {
      chip: "bg-lemon-50 text-lemon-600",
      pill: "bg-lemon-100 text-lemon-700",
      bar: "bg-lemon-500",
    },
    accent: {
      chip: "bg-accent-100 text-accent-600",
      pill: "bg-accent-100 text-accent-700",
      bar: "bg-accent-400",
    },
  }[tone];

  return (
    <Card className="space-y-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-[1rem] ${styles.chip}`}>
            <Icon className="h-5 w-5" />
          </span>
          <p className="text-base font-black text-neutral-600">{label}</p>
        </div>
        <p className={`rounded-full px-3 py-1 text-sm font-black ${styles.pill}`}>
          {percentOf(current, target)}%
        </p>
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
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${Math.min(percentOf(current, target), 100)}%` }}
        />
      </div>
    </Card>
  );
}

function MealIcon({ mealType }: { mealType: MealType }) {
  const styles =
    mealType === "breakfast"
      ? "bg-lemon-50 text-lemon-600"
      : mealType === "lunch"
        ? "bg-accent-100 text-accent-600"
        : mealType === "dinner"
          ? "bg-neutral-100 text-neutral-500"
          : "bg-sky-100 text-sky-600";

  return (
    <span className={`flex h-14 w-14 items-center justify-center rounded-[1.15rem] ${styles}`}>
      <Sun className="h-6 w-6" />
    </span>
  );
}

function SmallMacro({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "sky" | "lemon" | "accent";
}) {
  const styles = {
    primary: "bg-primary-100 text-primary-700",
    sky: "bg-sky-100 text-sky-700",
    lemon: "bg-lemon-100 text-lemon-700",
    accent: "bg-accent-100 text-accent-700",
  }[tone];

  return (
    <div className={`rounded-[0.9rem] px-3 py-2 ${styles}`}>
      <p className="text-base font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase opacity-70">{label}</p>
    </div>
  );
}
