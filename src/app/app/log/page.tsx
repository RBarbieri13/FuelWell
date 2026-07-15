"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Barcode,
  Camera,
  CheckCircle2,
  CircleDot,
  MapPinned,
  Search,
  Sparkles,
  UtensilsCrossed,
  X,
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
type SessionIngredient = {
  id: string;
  foodId?: string;
  name: string;
  servings: number;
  totals: MacroTotals;
};

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const MODE_HELP: Record<LogMode, { title: string; detail: string }> = {
  search: {
    title: "Best for known foods",
    detail: "Search the database, then choose a reviewed portion before saving.",
  },
  restaurant: {
    title: "Best for eating out",
    detail: "Search nearby restaurants or chains and log a menu item against today's macro gap.",
  },
  photo: {
    title: "Best for uncertain plates",
    detail: "Create an estimate draft first. Nothing saves until you review it.",
  },
  scan: {
    title: "Best for packaged foods",
    detail: "Scan or type a barcode, then confirm the serving size.",
  },
};

// Default the selector to the meal people are most likely logging right now;
// it stays a starting point the user can switch freely.
function defaultMealTypeForNow(now = new Date()): MealType {
  const hour = now.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 17) return "snack";
  return "dinner";
}

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as LogMode) || "search";
  const { meals, totals, targets, addMeal, updateMealItem, removeMeal } =
    useDayLog();
  const { goalPlan, integrationSummary } = useGoalContextStore();

  const [mode, setMode] = useState<LogMode>(initialMode);
  const [mealType, setMealType] = useState<MealType>(() => defaultMealTypeForNow());
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [goalImpact, setGoalImpact] = useState<MealGoalImpact | null>(null);
  const [sessionIngredients, setSessionIngredients] = useState<SessionIngredient[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recentlyAddedFoodId, setRecentlyAddedFoodId] = useState<string | null>(null);

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
    },
    foodId?: string
  ) {
    addMeal({
      mealType,
      name,
      items: [{ name, servings, ...totalsToAdd }],
    });
    setSessionIngredients((current) => [
      {
        id: `ingredient-${Date.now().toString(36)}-${current.length}`,
        foodId,
        name,
        servings,
        totals: totalsToAdd,
      },
      ...current,
    ]);
    setDrawerOpen(true);
    setRecentlyAddedFoodId(foodId ?? null);
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
    }, selectedFood.id);
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
  const modeHelp = MODE_HELP[mode];

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-5 p-4 pb-28 md:p-8">
      <Card variant="elevated" className="fw-dark-panel min-w-0 overflow-hidden text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary-100">
              <Sparkles className="h-4 w-4" />
              Fast logging
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal md:text-4xl">Log a meal</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Search updates as you type. Adding food updates Today&apos;s Plate,
              dashboard macros, and coach context.
            </p>
          </div>
          <Button
            variant="secondary"
            className="border-white/15 bg-white/10 text-white shadow-none hover:bg-white/15"
            onClick={() => router.push("/app/nutrition")}
          >
            View today&apos;s plate
          </Button>
        </div>
      </Card>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
        <div className="min-w-0 space-y-5">
          <div className="grid min-w-0 grid-cols-2 gap-2 rounded-[1.5rem] border border-primary-100/80 bg-white/86 p-2 shadow-[0_18px_48px_rgba(22,48,42,0.07)] sm:grid-cols-4">
            {modes.map((modeOption) => (
              <button
                key={modeOption.key}
                onClick={() => setMode(modeOption.key)}
                aria-pressed={mode === modeOption.key}
                className={cn(
                  "flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-[1.15rem] px-2 py-3 text-sm font-black transition-all duration-150 sm:gap-2 sm:px-3",
                  mode === modeOption.key
                    ? "bg-primary-600 text-white shadow-[0_14px_32px_rgba(21,145,108,0.22)]"
                    : "text-[#60776f] hover:bg-primary-50 hover:text-primary-800"
                )}
              >
                <modeOption.icon className="h-4 w-4" />
                {modeOption.label}
              </button>
            ))}
          </div>

          <Card className="flex min-w-0 flex-col gap-3 rounded-[1.35rem] border-primary-100 bg-primary-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <p className="text-sm font-black text-primary-900">{modeHelp.title}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-primary-900/65">
                {modeHelp.detail}
              </p>
            </div>
            <span className="inline-flex self-start rounded-full bg-white px-3 py-1 text-xs font-black text-primary-700 sm:self-center">
              {mealTypeLabel}
            </span>
          </Card>

          <div className="lg:hidden">
            <MealTypeSelector mealType={mealType} onSelect={setMealType} />
          </div>

          {mode === "search" && (
            <FoodSearch
              selectedId={selectedFood?.id ?? null}
              recentFoodIds={sessionIngredients.map((ingredient) => ingredient.foodId).filter(Boolean) as string[]}
              recentlyAddedId={recentlyAddedFoodId}
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

        <div className="min-w-0 space-y-5">
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
              <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/70 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-sm">
                  <CircleDot className="h-5 w-5" />
                </div>
                <p className="font-black text-[#16302a]">No food selected.</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                  Choose a result from Search. Its one-tap portions appear here.
                </p>
              </div>
            )}

            {confirmation && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-[1.25rem] border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-black text-primary-800"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{confirmation}</span>
              </div>
            )}

            {goalImpact && <GoalImpactCard impact={goalImpact} />}
          </Card>

          <TotalsSummary totals={totals} targets={goalContext.targets} meals={meals} />
        </div>
      </div>

      <SessionIngredientDrawer
        open={drawerOpen}
        ingredients={sessionIngredients}
        onClose={() => setDrawerOpen(false)}
      />
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
        <h2 className="text-lg font-black text-[#16302a]">Recent meals</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
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
              className="min-h-16 rounded-[1.2rem] border border-primary-100/80 bg-[#f7faf8] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-md hover:shadow-primary-900/10"
            >
              <p className="truncate text-sm font-black text-[#16302a]">{meal.name}</p>
              <p className="mt-0.5 text-xs font-bold text-muted-foreground">
                {mealTotals.calories} kcal · {mealTotals.protein}g protein
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function SessionIngredientDrawer({
  open,
  ingredients,
  onClose,
}: {
  open: boolean;
  ingredients: SessionIngredient[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const totals = ingredients.reduce(
    (sum, ingredient) => ({
      calories: sum.calories + ingredient.totals.calories,
      protein: sum.protein + ingredient.totals.protein,
      carbs: sum.carbs + ingredient.totals.carbs,
      fat: sum.fat + ingredient.totals.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <aside
      className={cn(
        "fixed bottom-0 right-0 top-0 z-40 w-full max-w-md transform border-l border-primary-100 bg-white shadow-[0_24px_80px_rgba(22,48,42,0.22)] transition-transform duration-300 md:top-0",
        open ? "translate-x-0" : "hidden translate-x-full"
      )}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-primary-100 bg-primary-50/80 px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-700">
              Current meal
            </p>
            <h2 className="mt-1 font-heading text-2xl font-black text-[#16302a]">
              Ingredient drawer
            </h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Same-session ingredients and macro totals.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white p-3 text-muted-foreground shadow-sm transition hover:bg-primary-50 hover:text-primary-700"
            aria-label="Close ingredient drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 px-5 py-4">
          {[
            ["kcal", totals.calories],
            ["Pro", `${totals.protein}g`],
            ["Carb", `${totals.carbs}g`],
            ["Fat", `${totals.fat}g`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1rem] bg-[#f4f8f6] px-3 py-3 text-center">
              <p className="text-lg font-black text-[#16302a]">{value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {ingredients.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-primary-200 bg-primary-50/70 p-5 text-sm font-semibold text-primary-900/70">
              Add foods and they will appear here for this meal-building session.
            </div>
          ) : (
            <div className="divide-y divide-primary-100/70 rounded-[1.25rem] border border-primary-100 bg-white">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="px-4 py-3">
                  <p className="text-sm font-black text-[#16302a]">{ingredient.name}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {ingredient.totals.calories} kcal · {ingredient.totals.protein}g protein · {ingredient.totals.carbs}g carbs · {ingredient.totals.fat}g fat
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
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
      <h2 className="text-lg font-black text-[#16302a]">Logging for</h2>
      <div className="grid grid-cols-2 gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            aria-pressed={mealType === type}
            className={cn(
              "rounded-[1.15rem] border px-4 py-3 text-sm font-black transition",
              mealType === type
                ? "border-primary-300 bg-primary-50 text-primary-800 shadow-sm"
                : "border-primary-100 bg-white text-[#60776f] hover:border-primary-200 hover:bg-primary-50/60"
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
