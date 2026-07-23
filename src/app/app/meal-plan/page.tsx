"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { cn } from "@/lib/utils/cn";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Plus,
  RefreshCcw,
  ShoppingBasket,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { RECIPES, type Recipe } from "@/lib/recipes-data";
import { todayIsoDate, type MealType } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";
import {
  plannedMealFromRecipe,
  suggestRecipeForSlot,
  useMealPlan,
  type PlanDay,
  type PlanSlot,
  type PlannedMeal,
} from "@/lib/use-meal-plan";

const slotTone: Record<PlanSlot, { bg: string; text: string; label: string }> = {
  Breakfast: { bg: "bg-lemon-100", text: "text-lemon-700", label: "Morning" },
  Lunch: { bg: "bg-primary-100", text: "text-primary-700", label: "Midday" },
  Dinner: { bg: "bg-accent-100", text: "text-accent-700", label: "Evening" },
  Snack: { bg: "bg-sky-100", text: "text-sky-700", label: "Anytime" },
};

function dayTotals(day: PlanDay) {
  return day.meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      planned: totals.planned + (meal.status === "open" ? 0 : 1),
    }),
    { calories: 0, protein: 0, planned: 0 }
  );
}

function recipeForMeal(meal: PlannedMeal): Recipe | undefined {
  return meal.recipeId ? RECIPES.find((recipe) => recipe.id === meal.recipeId) : undefined;
}

export default function MealPlanPage() {
  const { days, setPlanMeal } = useMealPlan();
  const { addMeal } = useDayLog();
  const today = todayIsoDate();
  const [selectedDayId, setSelectedDayId] = useState(
    () => days.find((day) => day.iso === today)?.id ?? days[0].id
  );
  const [view, setView] = useState<"day" | "week">("day");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [swapCount, setSwapCount] = useState(0);
  const [actionNote, setActionNote] = useState("");

  const selectedDay = days.find((day) => day.id === selectedDayId) ?? days[0];
  const selectedTotals = dayTotals(selectedDay);
  const weekTotals = days.reduce(
    (totals, day) => {
      const current = dayTotals(day);
      return {
        calories: totals.calories + current.calories,
        protein: totals.protein + current.protein,
        planned: totals.planned + current.planned,
      };
    },
    { calories: 0, protein: 0, planned: 0 }
  );
  const slotCount = days.reduce((count, day) => count + day.meals.length, 0);
  const weekPlannedPercent = Math.round((weekTotals.planned / slotCount) * 100);
  const openSlotCount = slotCount - weekTotals.planned;
  const firstOpenSlot = days
    .flatMap((day) => day.meals.map((meal) => ({ day, meal })))
    .find(({ meal }) => meal.status === "open");
  // Grocery-readiness derives from what is actually planned, not a constant.
  const uniqueIngredientCount = useMemo(() => {
    const names = new Set<string>();
    for (const day of days) {
      for (const meal of day.meals) {
        if (meal.status === "open") continue;
        const recipe = recipeForMeal(meal);
        recipe?.ingredients.forEach((ingredient) => names.add(ingredient.item.toLowerCase()));
      }
    }
    return names.size;
  }, [days]);

  function fillOpenSlot(day: PlanDay, meal: PlannedMeal) {
    const sameDayTitles = day.meals
      .filter((candidate) => candidate.slot !== meal.slot && candidate.status !== "open")
      .map((candidate) => candidate.title);
    const duplicate = sameDayTitles.some(
      (title) => title.toLowerCase() === meal.title.toLowerCase()
    );
    if (!duplicate) {
      setPlanMeal(day.id, meal.slot, { ...meal, status: "added" });
      setActionNote(`${meal.title} planned for ${day.label} ${meal.slot.toLowerCase()}.`);
      return;
    }
    const replacement = suggestRecipeForSlot(meal.slot, [...sameDayTitles, meal.title], swapCount);
    if (!replacement) return;
    setSwapCount((count) => count + 1);
    setPlanMeal(day.id, meal.slot, plannedMealFromRecipe(meal.slot, replacement, "added"));
    setActionNote(`${replacement.title} planned for ${day.label} ${meal.slot.toLowerCase()}.`);
  }

  function swapMeal(day: PlanDay, meal: PlannedMeal) {
    const excluded = day.meals.map((candidate) => candidate.title);
    const replacement = suggestRecipeForSlot(meal.slot, excluded, swapCount);
    if (!replacement) return;
    setSwapCount((count) => count + 1);
    setPlanMeal(day.id, meal.slot, plannedMealFromRecipe(meal.slot, replacement, "added"));
    setActionNote(`Swapped ${day.label} ${meal.slot.toLowerCase()} to ${replacement.title}.`);
  }

  async function logMealToToday(day: PlanDay, meal: PlannedMeal) {
    const recipe = recipeForMeal(meal);
    const result = await addMeal({
      mealType: meal.slot.toLowerCase() as MealType,
      name: meal.title,
      items: [
        {
          name: meal.title,
          servings: 1,
          calories: recipe?.perServing.calories ?? meal.calories,
          protein: recipe?.perServing.protein ?? meal.protein,
          carbs: recipe?.perServing.carbs ?? 0,
          fat: recipe?.perServing.fat ?? 0,
        },
      ],
    });
    if (result.ok) {
      setPlanMeal(day.id, meal.slot, { ...meal, status: "logged" });
      setActionNote(`${meal.title} logged to today's ${meal.slot.toLowerCase()}.`);
    } else {
      setActionNote(`Meal was not logged: ${result.error}`);
    }
  }

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-2xl md:text-4xl">Meal plan</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">
              Plan the next few days around protein, prep time, and grocery needs.
            </p>
          </div>
          <div className="flex rounded-full border border-primary-100/80 bg-white/92 p-1 shadow-[0_18px_42px_rgba(22,48,42,0.10)]">
            {(["day", "week"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-full px-6 py-3 text-sm font-black capitalize transition-all",
                  view === mode ? "bg-primary-600 text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)]" : "text-muted-foreground hover:text-primary-800"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        <section className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="fw-dark-panel px-5 py-5 md:px-7 md:py-7">
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-200">
              <Sparkles className="h-4 w-4" />
              Plan quality
            </p>
            <h2 className="mt-4 max-w-3xl font-heading text-2xl font-black leading-tight tracking-tight text-white md:text-4xl">
              {weekTotals.planned} of {slotCount} meals are planned.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/74">
              {firstOpenSlot
                ? `Next best move: fill ${firstOpenSlot.day.label} ${firstOpenSlot.meal.slot.toLowerCase()} with a lean protein recipe so the week stays above 135g protein per day.`
                : "Every slot is planned — build the grocery list to lock in the week."}
            </p>
            {firstOpenSlot && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4 border-white/15 bg-white/10 text-white shadow-none hover:bg-white/15"
                onClick={() => {
                  setSelectedDayId(firstOpenSlot.day.id);
                  setView("day");
                }}
              >
                Go to {firstOpenSlot.day.label} {firstOpenSlot.meal.slot.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                ["Avg kcal", Math.round(weekTotals.calories / days.length).toLocaleString()],
                ["Avg protein", `${Math.round(weekTotals.protein / days.length)}g`],
                ["Open slots", `${openSlotCount}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.15rem] border border-white/12 bg-white/10 px-3 py-3 backdrop-blur sm:rounded-[1.25rem] sm:px-5 sm:py-4">
                  <p className="font-heading text-2xl font-black tabular-nums text-white">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-white/58 sm:tracking-[0.12em]">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="elevated" className="h-fit space-y-4">
            <div className="flex items-start gap-4">
              <span className="fw-icon-chip">
                <ShoppingBasket className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-[#16302a]">Grocery readiness</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                  Planned meals are grouped into the grocery list as soon as the open slots are filled.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="fw-soft-row p-4">
                <p className="text-2xl font-black text-[#16302a] md:text-3xl">{uniqueIngredientCount}</p>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">unique ingredients</p>
              </div>
              <div className="fw-soft-row p-4">
                <p className="text-2xl font-black text-[#16302a] md:text-3xl">{openSlotCount}</p>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">slots to fill</p>
              </div>
            </div>
            <Link href="/app/grocery-list" className="block">
              <Button type="button" className="w-full">
                Build grocery list
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/app/recipes"
              className="flex min-h-11 items-center justify-between rounded-[1.1rem] bg-[#f7faf8] px-4 py-3 text-sm font-black text-primary-800 transition hover:bg-primary-50"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse the recipe library
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <Card className="h-fit px-5 py-5">
            <h2 className="flex items-center gap-2 text-lg font-black text-[#16302a]">
              <CalendarDays className="w-5 h-5 text-primary-600" />
              This week
            </h2>
            <div className="mt-3 space-y-2">
              {days.map((day) => {
                const totals = dayTotals(day);
                const isSelected = day.id === selectedDay.id;

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={cn(
                      "w-full rounded-[1.25rem] border px-4 py-4 text-left transition-all",
                      isSelected
                        ? "border-primary-300 bg-primary-50 shadow-[0_16px_34px_rgba(21,145,108,0.12)]"
                        : "border-primary-100 bg-[#f7faf8] hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-md hover:shadow-primary-900/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-black text-[#16302a]">
                          {day.label}, {day.date}
                          {day.iso === today && (
                            <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-white">
                              Today
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{day.focus}</p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4", isSelected ? "text-primary-600" : "text-[#b8cac4]")} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <span className="font-black tabular-nums text-muted-foreground">
                        {totals.protein}g protein
                      </span>
                      <span
                        className="flex flex-1 items-center gap-1"
                        role="img"
                        aria-label={`${totals.planned} of ${day.meals.length} meals planned`}
                      >
                        {day.meals.map((meal) => (
                          <span
                            key={meal.slot}
                            className={cn(
                              "h-1.5 flex-1 rounded-full",
                              meal.status === "open" ? "bg-primary-100" : "bg-primary-500"
                            )}
                          />
                        ))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

        <div className="space-y-4">
          {view === "day" ? (
            <Card variant="elevated">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-700">
                    {selectedDay.focus}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#16302a] md:text-3xl">
                    {selectedDay.label}, {selectedDay.date}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:min-w-56">
                  <div className="rounded-[1rem] bg-primary-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-primary-700">Calories</p>
                    <p className="text-xl font-black tabular-nums text-[#16302a]">
                      {selectedTotals.calories.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-[1rem] bg-sky-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-sky-700">Protein</p>
                    <p className="text-xl font-black tabular-nums text-[#16302a]">
                      {selectedTotals.protein}g
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-[1.15rem] border border-primary-100 bg-primary-50/70 p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-primary-800">
                  <span>Week planned</span>
                  <span>{weekPlannedPercent}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${weekPlannedPercent}%` }} />
                </div>
              </div>

              {actionNote && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-[1.15rem] border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-black text-primary-800"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{actionNote}</span>
                </div>
              )}

              <div className="mt-5 space-y-3">
                {selectedDay.meals.map((meal) => {
                  const isOpen = meal.status === "open";
                  const tone = slotTone[meal.slot];
                  const recipe = recipeForMeal(meal);

                  return (
                    <div
                      key={meal.slot}
                      className={cn(
                        "rounded-[1.45rem] border p-5 transition-colors",
                        isOpen ? "border-dashed border-accent-200 bg-accent-50/50" : "border-primary-100 bg-[#f7faf8]"
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 rounded-[1rem] p-3",
                              meal.status === "logged"
                                ? "bg-primary-50 text-primary-600"
                                : isOpen
                                  ? "bg-accent-100 text-accent-700"
                                  : `${tone.bg} ${tone.text}`
                            )}
                          >
                            {meal.status === "logged" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <UtensilsCrossed className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                              {meal.slot} · {tone.label}
                              {isOpen ? " · Suggested" : ""}
                            </p>
                            <h3 className="mt-1 text-lg font-black text-[#16302a]">
                              {meal.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                              <span className="tabular-nums">{meal.calories.toLocaleString()} kcal</span>
                              <span className="tabular-nums">{meal.protein}g protein</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {meal.prep}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isOpen ? (
                          <Button type="button" variant="secondary" size="sm" onClick={() => fillOpenSlot(selectedDay, meal)}>
                            <Plus className="w-4 h-4" />
                            Fill slot
                          </Button>
                        ) : (
                          <Badge variant={meal.status === "logged" ? "success" : "default"}>
                            {meal.status === "logged" ? "Logged" : meal.status === "added" ? "Added" : "Planned"}
                          </Badge>
                        )}
                      </div>
                      {!isOpen && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-primary-100/70 pt-3">
                          {recipe && (
                            <button
                              type="button"
                              onClick={() => setOpenRecipe(recipe)}
                              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-50 md:min-h-0"
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              Open recipe
                            </button>
                          )}
                          {meal.status !== "logged" && (
                            <>
                              <button
                                type="button"
                                onClick={() => void logMealToToday(selectedDay, meal)}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-50 md:min-h-0"
                              >
                                <UtensilsCrossed className="h-3.5 w-3.5" />
                                Log to today
                              </button>
                              <button
                                type="button"
                                onClick={() => swapMeal(selectedDay, meal)}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-50 md:min-h-0"
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Swap
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card variant="elevated">
              <h2 className="text-2xl font-black text-[#16302a]">Week at a glance</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {days.map((day) => {
                  const totals = dayTotals(day);

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        setSelectedDayId(day.id);
                        setView("day");
                      }}
                      className="rounded-[1.35rem] border border-primary-100 bg-[#f7faf8] p-5 text-left transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-md hover:shadow-primary-900/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-[#16302a]">
                            {day.label}, {day.date}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground">{day.focus}</p>
                        </div>
                        <Badge variant={totals.planned === day.meals.length ? "success" : "warning"}>
                          {totals.planned}/{day.meals.length}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-[1rem] bg-white px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Calories</p>
                          <p className="text-xl font-black tabular-nums text-[#16302a]">
                            {totals.calories.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-[1rem] bg-white px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Protein</p>
                          <p className="text-xl font-black tabular-nums text-[#16302a]">
                            {totals.protein}g
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>

      {openRecipe && (
        <RecipeDetail
          recipe={openRecipe}
          onClose={() => setOpenRecipe(null)}
        />
      )}
    </div>
  );
}
