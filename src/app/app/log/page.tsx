"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Barcode,
  Camera,
  Check,
  CheckCircle2,
  History,
  MapPinned,
  Moon,
  Salad,
  Search,
  Sparkles,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import LogLoading from "./loading";
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

// Meal-slot glyphs match the nutrition route's meal icons for cross-surface scanning.
const MEAL_ICONS: Record<MealType, typeof Sun> = {
  breakfast: Sun,
  lunch: Salad,
  dinner: Moon,
  snack: UtensilsCrossed,
};

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

/** Macro roles carry the same colour here as in the totals panel. */
const DRAWER_MACROS: {
  key: "protein" | "carbs" | "fat";
  label: string;
  color: string;
}[] = [
  { key: "protein", label: "protein", color: "var(--color-macro-protein)" },
  { key: "carbs", label: "carbs", color: "var(--color-macro-carbs)" },
  { key: "fat", label: "fat", color: "var(--color-macro-fat)" },
];

/** Shared pill chrome for the meal-slot selectors, so both copies match. */
const SLOT_PILL_BASE =
  "fw-press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9";

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
  const [lastLogged, setLastLogged] = useState<{ mealId: string; label: string } | null>(null);
  const addToPlateRef = useRef<HTMLDivElement | null>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Selecting a food from a long results list must reveal the portion picker;
  // on phones the card can otherwise land outside the visible viewport.
  useEffect(() => {
    if (!selectedFood) return;
    addToPlateRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedFood]);

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
    void addMeal({
      mealType,
      name,
      items: [{ name, servings, ...totalsToAdd }],
    }).then((result) => {
      // Keep a handle on the saved meal so the confirmation can offer Undo.
      if (result.ok) setLastLogged({ mealId: result.value.id, label: name });
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

  async function undoLastLog() {
    if (!lastLogged) return;
    const target = lastLogged;
    setLastLogged(null);
    const result = await removeMeal(target.mealId);
    if (!result.ok) {
      setConfirmation(`Could not undo: ${result.error}`);
      return;
    }
    setSessionIngredients((current) => current.slice(1));
    setConfirmation(`Removed ${target.label}.`);
    setGoalImpact(null);
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
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-4 p-4 pb-28 md:space-y-5 md:p-8">
      <Card variant="elevated" className="fw-dark-panel min-w-0 overflow-hidden text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary-100">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              Fast logging
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-normal md:text-3xl">Log a meal</h1>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 border-white/15 bg-white/10 text-white shadow-none ring-1 ring-inset ring-white/15 hover:border-white/25 hover:bg-white/15 focus-visible:ring-white"
            onClick={() => router.push("/app/nutrition")}
          >
            View today&apos;s plate
          </Button>
        </div>
      </Card>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
        <div className="min-w-0 space-y-5">
          <div
            role="group"
            aria-label="Logging method"
            className="grid min-w-0 grid-cols-2 gap-2 rounded-[1.5rem] bg-surface/86 p-2 shadow-e2 ring-1 ring-inset ring-hairline sm:grid-cols-4"
          >
            {modes.map((modeOption) => {
              const isOn = mode === modeOption.key;
              return (
                <button
                  key={modeOption.key}
                  onClick={() => setMode(modeOption.key)}
                  aria-pressed={isOn}
                  className={cn(
                    "fw-press flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-[1.15rem] px-2 py-3 text-sm font-black focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:gap-2 sm:px-3",
                    isOn
                      ? "bg-primary-700 text-white shadow-glow ring-1 ring-inset ring-primary-800"
                      : "text-ink-muted hover:bg-primary-50 hover:text-primary-800 active:bg-primary-100"
                  )}
                >
                  <modeOption.icon
                    className="h-4 w-4 shrink-0"
                    strokeWidth={isOn ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{modeOption.label}</span>
                </button>
              );
            })}
          </div>

          <p className="rounded-[1.15rem] bg-surface/70 px-4 py-3 text-sm font-semibold leading-6 text-ink-muted ring-1 ring-inset ring-hairline">
            <span className="font-black text-ink">{modeHelp.title}.</span>{" "}
            {modeHelp.detail}
          </p>

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

          {(selectedFood || confirmation || goalImpact) && (
            <div ref={addToPlateRef}>
            <Card variant="elevated" className="space-y-5">
              <SectionHeader
                icon={UtensilsCrossed}
                title="Add to Today's Plate"
                description={
                  selectedFood
                    ? "Tap a portion or enter a custom amount."
                    : "Saved. Keep logging or review the day."
                }
              />

              {/* The active meal slot repeats here so a save never lands in an
                  unseen slot picked far away in the right rail (audit L7). */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
                  Adding to
                </span>
                {MEAL_TYPES.map((type) => {
                  const isOn = mealType === type;
                  const SlotIcon = MEAL_ICONS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      aria-pressed={isOn}
                      className={cn(
                        SLOT_PILL_BASE,
                        isOn
                          ? "bg-primary-700 text-white shadow-e1 ring-primary-800"
                          : "bg-surface-muted text-ink-muted ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-100"
                      )}
                    >
                      {/* Same glyph as the rail selector, so the two copies of
                          this control are recognisably the same control. */}
                      <SlotIcon
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={isOn ? 2.5 : 2}
                      />
                      {formatMealType(type)}
                      {isOn && (
                        <Check aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedFood && (
                <PortionPicker
                  food={selectedFood}
                  onAdd={handleAddPortion}
                />
              )}

              {confirmation && (
                <div
                  role="status"
                  className="flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-primary-50 px-4 py-3 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-200"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-primary-600"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">{confirmation}</span>
                  {lastLogged && (
                    <button
                      type="button"
                      onClick={() => void undoLastLog()}
                      className={cn(
                        SLOT_PILL_BASE,
                        "bg-surface text-primary-700 shadow-e1 ring-primary-100 hover:bg-primary-100 hover:ring-primary-200"
                      )}
                    >
                      Undo
                    </button>
                  )}
                  {sessionIngredients.length > 0 && (
                    <button
                      ref={drawerTriggerRef}
                      type="button"
                      onClick={() => setDrawerOpen(true)}
                      aria-haspopup="dialog"
                      aria-expanded={drawerOpen}
                      className={cn(
                        SLOT_PILL_BASE,
                        "bg-surface text-primary-700 shadow-e1 ring-primary-100 hover:bg-primary-100 hover:ring-primary-200"
                      )}
                    >
                      Current meal ({sessionIngredients.length})
                    </button>
                  )}
                </div>
              )}

              {goalImpact && <GoalImpactCard impact={goalImpact} />}
            </Card>
            </div>
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

          <TotalsSummary totals={totals} targets={goalContext.targets} meals={meals} />
        </div>
      </div>

      <SessionIngredientDrawer
        open={drawerOpen}
        ingredients={sessionIngredients}
        triggerRef={drawerTriggerRef}
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
  // Dedupe by meal name (most-recent-first) so re-logging a meal does not
  // render it twice in the row (audit L4).
  const recent: typeof meals = [];
  const seen = new Set<string>();
  for (const meal of [...meals].reverse()) {
    const key = meal.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    recent.push(meal);
    if (recent.length === 3) break;
  }
  if (recent.length === 0) return null;
  return (
    <Card className="space-y-3">
      <SectionHeader
        icon={History}
        title="Recent meals"
        description="One tap repeats a meal and updates today's goal math."
      />
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
          const MealIcon = MEAL_ICONS[meal.mealType];
          return (
            <button
              key={meal.id}
              type="button"
              onClick={() => onLog(meal.name, mealTotals)}
              aria-label={`Log ${meal.name} again to ${formatMealType(
                meal.mealType
              ).toLowerCase()}: ${mealTotals.calories.toLocaleString()} kcal, ${
                mealTotals.protein
              }g protein`}
              className="fw-press flex min-h-20 flex-col justify-between gap-2 rounded-[1.2rem] bg-surface-muted px-4 py-3 text-left ring-1 ring-inset ring-hairline hover:-translate-y-0.5 hover:bg-surface hover:shadow-e2 hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <span className="flex min-w-0 items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.7rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
                >
                  <MealIcon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="line-clamp-2 min-w-0 text-sm font-black text-ink">
                  {meal.name}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="block text-xs font-bold text-ink-muted"
              >
                <span className="tabular-nums">{mealTotals.calories.toLocaleString()}</span>{" "}
                kcal · <span className="tabular-nums">{mealTotals.protein}</span>g protein
              </span>
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
  triggerRef,
  onClose,
}: {
  open: boolean;
  ingredients: SessionIngredient[];
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (!open && wasOpenRef.current) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = open;
  }, [open, triggerRef]);

  const totals = ingredients.reduce(
    (sum, ingredient) => ({
      calories: sum.calories + ingredient.totals.calories,
      protein: sum.protein + ingredient.totals.protein,
      carbs: sum.carbs + ingredient.totals.carbs,
      fat: sum.fat + ingredient.totals.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const tiles: { label: string; value: string }[] = [
    { label: "kcal", value: totals.calories.toLocaleString() },
    { label: "Pro", value: `${totals.protein}g` },
    { label: "Carb", value: `${totals.carbs}g` },
    { label: "Fat", value: `${totals.fat}g` },
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-30 bg-ink/25 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none data-closed:opacity-0 data-open:opacity-100"
        />
        <DialogPrimitive.Popup
          initialFocus={closeRef}
          aria-modal="true"
          className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-md outline-none transition-transform duration-300 ease-out-soft motion-reduce:transition-none data-closed:translate-x-full data-open:translate-x-0"
        >
          <aside className="flex h-full w-full flex-col bg-surface shadow-e4 ring-1 ring-inset ring-hairline">
            <div className="flex items-start justify-between gap-4 border-b border-hairline bg-primary-50/80 px-5 py-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-700">
                  Current meal
                </p>
                <DialogPrimitive.Title className="mt-1 font-heading text-2xl font-black text-ink">
                  Ingredient drawer
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm font-semibold text-ink-muted">
                  Same-session ingredients and macro totals.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close
                render={
                  <button
                    ref={closeRef}
                    className="fw-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink-subtle shadow-e1 ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                    aria-label="Close ingredient drawer"
                  />
                }
              >
                <X className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>

            {/* 2×2 below 400px: four columns clip a four-digit calorie figure on a
                320px screen, and a clipped metric is worse than a taller panel. */}
            <div className="grid grid-cols-2 gap-2 px-5 py-4 min-[400px]:grid-cols-4">
              {tiles.map((tile) => (
                <div
                  key={tile.label}
                  className="min-w-0 rounded-[1rem] bg-surface-muted px-2 py-3 text-center ring-1 ring-inset ring-hairline"
                >
                  <p className="truncate text-lg font-black tabular-nums text-ink">
                    {tile.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-ink-subtle">
                    {tile.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
              {ingredients.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-primary-200 bg-primary-50/70 p-5 text-sm font-semibold leading-6 text-primary-900/70">
                  Add foods and they will appear here for this meal-building session.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="rounded-[1rem] bg-surface-muted px-4 py-3 ring-1 ring-inset ring-hairline"
                    >
                      <p className="text-sm font-black text-ink">{ingredient.name}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs font-semibold leading-5 text-ink-muted">
                        <span className="whitespace-nowrap font-black text-ink">
                          <span className="tabular-nums">
                            {ingredient.totals.calories.toLocaleString()}
                          </span>{" "}
                          kcal
                        </span>
                        {DRAWER_MACROS.map((macro) => (
                          <span
                            key={macro.key}
                            className="inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: macro.color }}
                            />
                            <span className="tabular-nums">
                              {ingredient.totals[macro.key]}
                            </span>
                            g {macro.label}
                          </span>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
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
    <Card className="space-y-3 md:space-y-4">
      <SectionHeader
        as="h3"
        title="Logging for"
        action={
          <Badge variant="default" size="sm">
            {formatMealType(mealType)}
          </Badge>
        }
      />
      <div className="grid grid-cols-2 gap-2">
        {MEAL_TYPES.map((type) => {
          const Icon = MEAL_ICONS[type];
          const isOn = mealType === type;
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              aria-pressed={isOn}
              className={cn(
                "fw-press flex min-h-12 items-center justify-center gap-2 rounded-[1.15rem] px-3 py-3 text-sm font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                isOn
                  ? "bg-primary-50 text-primary-800 shadow-e1 ring-2 ring-primary-400"
                  : "bg-surface text-ink-muted ring-hairline hover:bg-primary-50/60 hover:ring-primary-200"
              )}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                strokeWidth={isOn ? 2.5 : 2}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate">{formatMealType(type)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function LogPage() {
  // Reuse the route-level skeleton rather than keeping a second, coarser copy
  // here — two different pending states for one screen guarantees one of them
  // reflows into the real layout.
  return (
    <Suspense fallback={<LogLoading />}>
      <LogContent />
    </Suspense>
  );
}
