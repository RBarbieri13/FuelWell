"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Barcode,
  Camera,
  MapPinned,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatMealType, type MacroTotals, type MealType } from "@/lib/fuelwell-data";
import {
  buildDailyGoalContext,
  buildMealGoalImpact,
  type DataSource,
  type MealConfidence,
  type MealGoalImpact,
} from "@/lib/goal-context";
import { useDayLog } from "@/lib/use-day-log";
import { useGoalContextStore } from "@/lib/use-goal-context";
import type { FoodItem } from "@/lib/food-database";
import { FoodSearch } from "@/components/log/food-search";
import { PortionPicker } from "@/components/log/portion-picker";
import { CustomMealForm, type CustomMealDraft } from "@/components/log/custom-meal-form";
import { LoggedMeals } from "@/components/log/logged-meals";
import { TotalsSummary } from "@/components/log/totals-summary";
import { GoalImpactCard } from "@/components/log/goal-impact-card";
import { BarcodeLookup } from "@/components/log/barcode-lookup";
import { PhotoEstimateReview } from "@/components/log/photo-estimate-review";
import { RestaurantFinder } from "@/components/log/restaurant-finder";

type LogMode = "search" | "restaurant" | "photo" | "scan";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as LogMode) || "search";
  const { meals, totals, targets, addMeal, updateMealItem, removeMeal } =
    useDayLog();
  const { goalPlan, integrationSummary } = useGoalContextStore();

  const [mode, setMode] = useState<LogMode>(initialMode);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [goalImpact, setGoalImpact] = useState<MealGoalImpact | null>(null);

  const mealTypeLabel = formatMealType(mealType);
  const goalContext = buildDailyGoalContext({
    date: new Date().toISOString().slice(0, 10),
    meals,
    totals,
    targets,
    goalPlan,
    integration: integrationSummary,
  });

  function logItem(
    name: string,
    servings: number,
    totalsToAdd: MacroTotals,
    source: { confidence: MealConfidence; dataSource: DataSource } = {
      confidence: "manual",
      dataSource: "user_entered",
    }
  ) {
    addMeal({
      mealType,
      name,
      items: [{ name, servings, ...totalsToAdd }],
    });
    setConfirmation(`${name} added to ${mealTypeLabel.toLowerCase()}.`);
    setGoalImpact(
      buildMealGoalImpact({
        totalsAfter: {
          calories: totals.calories + totalsToAdd.calories,
          protein: totals.protein + totalsToAdd.protein,
          carbs: totals.carbs + totalsToAdd.carbs,
          fat: totals.fat + totalsToAdd.fat,
        },
        targets: goalContext.targets,
        confidence: source.confidence,
        source: source.dataSource,
        integration: integrationSummary,
      })
    );
  }

  function handleAddPortion(input: {
    amount: number;
    label: string;
    totals: MacroTotals;
  }) {
    if (!selectedFood) return;
    logItem(`${selectedFood.name} (${input.label})`, input.amount, input.totals, {
      confidence: "database",
      dataSource: "database",
    });
    setSelectedFood(null);
  }

  function handleCustomMeal(draft: CustomMealDraft) {
    logItem(`${draft.name} (${draft.portionLabel})`, 1, draft.totals);
  }

  function logRecentMeal(mealName: string, mealTotals: MacroTotals) {
    logItem(mealName, 1, mealTotals);
  }

  function logPhotoDraft(name: string, mealTotals: MacroTotals, portionLabel: string) {
    logItem(`${name} (${portionLabel})`, 1, mealTotals, {
      confidence: "estimate",
      dataSource: "estimate",
    });
  }

  function logRestaurantItem(input: {
    restaurantName: string;
    itemName: string;
    serving: string;
    totals: MacroTotals;
  }) {
    logItem(`${input.restaurantName} · ${input.itemName} (${input.serving})`, 1, input.totals, {
      confidence: "database",
      dataSource: "database",
    });
  }

  const modes: { key: LogMode; label: string; icon: typeof Search }[] = [
    { key: "search", label: "Search", icon: Search },
    { key: "restaurant", label: "Restaurants", icon: MapPinned },
    { key: "photo", label: "Photo", icon: Camera },
    { key: "scan", label: "Scan", icon: Barcode },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <Card variant="elevated" className="bg-neutral-950 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-primary-200">Fast logging</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Log a meal</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-neutral-300">
              Search updates as you type. Adding food updates Today&apos;s Plate,
              dashboard macros, and coach context.
            </p>
          </div>
          <Button
            variant="secondary"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
            onClick={() => router.push("/app/nutrition")}
          >
            View today&apos;s plate
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <div className="space-y-5">
          <div className="flex gap-1 rounded-2xl bg-white/70 p-1 shadow-sm shadow-neutral-200/70">
            {modes.map((modeOption) => (
              <button
                key={modeOption.key}
                onClick={() => setMode(modeOption.key)}
                aria-pressed={mode === modeOption.key}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-150",
                  mode === modeOption.key
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-300/60"
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900"
                )}
              >
                <modeOption.icon className="h-4 w-4" />
                {modeOption.label}
              </button>
            ))}
          </div>

          <div className="lg:hidden">
            <MealTypeSelector mealType={mealType} onSelect={setMealType} />
          </div>

          {mode === "search" && (
            <FoodSearch
              selectedId={selectedFood?.id ?? null}
              onSelect={(food) => {
                setSelectedFood(food);
                setConfirmation("");
              }}
            />
          )}

          {mode === "photo" && (
            <PhotoEstimateReview onLogCandidate={logPhotoDraft} />
          )}

          {mode === "restaurant" && (
            <RestaurantFinder
              totals={totals}
              targets={goalContext.targets}
              onLogItem={logRestaurantItem}
            />
          )}

          {mode === "scan" && (
            <BarcodeLookup
              onSelect={(food) => {
                setSelectedFood(food);
                setConfirmation("Barcode match selected. Review the portion before saving.");
              }}
            />
          )}

          <RecentMeals meals={meals} onLog={logRecentMeal} />

          <CustomMealForm
            mealTypeLabel={mealTypeLabel}
            onSubmit={handleCustomMeal}
          />

          <LoggedMeals
            meals={meals}
            onUpdateItem={updateMealItem}
            onRemoveMeal={removeMeal}
          />
        </div>

        <div className="space-y-5">
          <div className="hidden lg:block">
            <MealTypeSelector mealType={mealType} onSelect={setMealType} />
          </div>

          <Card variant="elevated" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-neutral-900">
                  Add to Today&apos;s Plate
                </h2>
                <p className="text-sm font-medium text-neutral-500">
                  {selectedFood
                    ? "Tap a portion or enter a custom amount."
                    : "Pick a food from search to choose a portion."}
                </p>
              </div>
            </div>

            {selectedFood ? (
              <PortionPicker
                food={selectedFood}
                mealTypeLabel={mealTypeLabel}
                onAdd={handleAddPortion}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
                <p className="font-bold text-neutral-900">No food selected.</p>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  Choose a result from Search. Its one-tap portions appear here.
                </p>
              </div>
            )}

            {confirmation && (
              <div
                role="status"
                className="rounded-2xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-800"
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                {confirmation}
              </div>
            )}

            {goalImpact && <GoalImpactCard impact={goalImpact} />}
          </Card>

          <TotalsSummary totals={totals} targets={goalContext.targets} />
        </div>
      </div>
    </div>
  );
}

function RecentMeals({
  meals,
  onLog,
}: {
  meals: ReturnType<typeof useDayLog>["meals"];
  onLog: (name: string, totals: MacroTotals) => void;
}) {
  const recent = meals.slice(-3).reverse();
  if (recent.length === 0) return null;
  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-black text-neutral-900">Recent meals</h2>
        <p className="mt-1 text-sm font-medium text-neutral-500">
          One tap repeats a meal and updates today&apos;s goal math.
        </p>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {recent.map((meal) => {
          const mealTotals = meal.items.reduce(
            (sum, item) => ({
              calories: sum.calories + item.calories,
              protein: sum.protein + item.protein,
              carbs: sum.carbs + item.carbs,
              fat: sum.fat + item.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );
          return (
            <button
              key={meal.id}
              type="button"
              onClick={() => onLog(meal.name, mealTotals)}
              className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-left transition hover:border-primary-300 hover:bg-primary-50/60"
            >
              <p className="truncate text-sm font-black text-neutral-900">{meal.name}</p>
              <p className="mt-0.5 text-xs font-medium text-neutral-500">
                {mealTotals.calories} kcal · {mealTotals.protein}g protein
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function MealTypeSelector({
  mealType,
  onSelect,
}: {
  mealType: MealType;
  onSelect: (type: MealType) => void;
}) {
  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-black text-neutral-900">Logging for</h2>
      <div className="grid grid-cols-2 gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            aria-pressed={mealType === type}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-black transition",
              mealType === type
                ? "border-primary-300 bg-primary-50 text-primary-800"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}
          >
            {formatMealType(type)}
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function LogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 md:p-8">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      }
    >
      <LogContent />
    </Suspense>
  );
}
