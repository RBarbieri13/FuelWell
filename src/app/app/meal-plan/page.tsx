"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { cn } from "@/lib/utils/cn";
import {
  ArrowRight,
  Beef,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  Flame,
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

/**
 * One segment per slot, in slot order. Filled = planned, hollow = open. The
 * week view adds the slot initial underneath so the strip is readable as data
 * rather than as four anonymous ticks.
 */
function SlotStrip({
  meals,
  showLabels = false,
}: {
  meals: PlannedMeal[];
  showLabels?: boolean;
}) {
  return (
    <>
      {meals.map((meal) => {
        const planned = meal.status !== "open";
        return (
          <span key={meal.slot} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                "h-1.5 w-full rounded-full transition-colors duration-200 ease-out-soft",
                planned
                  ? "bg-primary-600"
                  : "bg-surface-sunken ring-1 ring-inset ring-hairline-strong"
              )}
            />
            {showLabels && (
              <span
                className={cn(
                  "text-[10px] font-black uppercase leading-none tracking-[0.06em]",
                  planned ? "text-primary-700" : "text-ink-muted"
                )}
              >
                {meal.slot.slice(0, 1)}
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

export default function MealPlanPage() {
  const { days, persistence, setPlanMeal, createStarterMealPlan } = useMealPlan();
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
  const selectedTotals = selectedDay
    ? dayTotals(selectedDay)
    : { calories: 0, protein: 0, planned: 0 };
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
  const weekPlannedPercent = slotCount > 0
    ? Math.round((weekTotals.planned / slotCount) * 100)
    : 0;
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

  if (!selectedDay) {
    return (
      <div className="fw-app-surface">
        <header className="fw-page-header">
          <div className="fw-page-inner py-5 md:py-7">
            <h1 className="fw-heading text-2xl md:text-4xl">Meal plan</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">
              Plan the next few days around protein, prep time, and grocery needs.
            </p>
          </div>
        </header>
        <main className="fw-page-inner py-6 md:py-8">
          <Card className="mx-auto max-w-2xl p-6 text-center md:p-10">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
              <CalendarDays className="size-6" aria-hidden="true" />
            </span>
            <h2 className="fw-heading mt-4 text-xl md:text-2xl">Plan this week</h2>
            <p className="fw-muted mx-auto mt-2 max-w-md text-sm md:text-base">
              {persistence.mode === "authenticated"
                ? "Your account does not have a meal plan for this week yet. Start one without importing another account or preview plan."
                : "Start a weekly plan, then adjust each meal around your schedule."}
            </p>
            {actionNote && (
              <p className="mt-3 text-sm font-bold text-primary-800" role="status">
                {actionNote}
              </p>
            )}
            <Button
              type="button"
              className="mt-5 min-h-11"
              disabled={persistence.status === "saving"}
              onClick={async () => {
                const result = await createStarterMealPlan();
                if (result.ok) {
                  setSelectedDayId(result.value[0]?.id ?? "");
                  setActionNote("This week's starter plan is saved.");
                } else {
                  setActionNote(`Meal plan was not saved: ${result.error}`);
                }
              }}
            >
              <Plus className="size-4" aria-hidden="true" />
              Start this week
            </Button>
          </Card>
        </main>
      </div>
    );
  }

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
          <div className="flex self-start rounded-full bg-surface/92 p-1 shadow-e2 ring-1 ring-inset ring-hairline-strong">
            {(["day", "week"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                aria-pressed={view === mode}
                className={cn(
                  "fw-press min-h-11 rounded-full px-6 py-2 text-sm font-black capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                  view === mode
                    ? "bg-primary-600 text-white shadow-e2"
                    : "text-ink-muted hover:bg-primary-50 hover:text-primary-800"
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
            <div className="mt-5 max-w-2xl">
              <ProgressMeter
                value={weekTotals.planned}
                target={slotCount}
                color="var(--color-primary-400)"
                size="lg"
                label={`${weekTotals.planned} of ${slotCount} meal slots planned`}
                className="bg-white/15"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.12em] text-white/60">
                <span>0 slots</span>
                <span className="tabular-nums text-white/85">{weekPlannedPercent}% planned</span>
                <span className="tabular-nums">{slotCount} slots</span>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/74">
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
                <div key={label} className="min-w-0 rounded-[1.15rem] bg-white/10 px-3 py-3 ring-1 ring-inset ring-white/15 backdrop-blur sm:rounded-[1.25rem] sm:px-5 sm:py-4">
                  <p className="font-heading text-2xl font-black tabular-nums leading-none text-white">{value}</p>
                  <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-white/70 sm:tracking-[0.12em]">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="elevated" className="h-fit space-y-5">
            <SectionHeader
              icon={ShoppingBasket}
              title="Grocery readiness"
              description="Planned meals are grouped into the grocery list as soon as the open slots are filled."
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="min-w-0 rounded-[1.25rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
                <p className="font-heading text-2xl font-black tabular-nums leading-none text-ink md:text-3xl">
                  {uniqueIngredientCount.toLocaleString()}
                </p>
                <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">unique ingredients</p>
              </div>
              <div className="min-w-0 rounded-[1.25rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
                <p className="font-heading text-2xl font-black tabular-nums leading-none text-ink md:text-3xl">
                  {openSlotCount.toLocaleString()}
                </p>
                <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">slots to fill</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/app/grocery-list"
                className="fw-press inline-flex min-h-11 w-full select-none items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-b from-primary-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 active:from-primary-700 active:to-primary-800 active:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                Build grocery list
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              </Link>
              <Link
                href="/app/recipes"
                className="fw-press flex min-h-11 items-center justify-between gap-2 rounded-[1.1rem] bg-surface-muted px-4 py-3 text-sm font-black text-primary-800 ring-1 ring-inset ring-hairline transition hover:bg-primary-50 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <BookOpen className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  Browse the recipe library
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              </Link>
            </div>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <Card className="h-fit px-5 py-5">
            <SectionHeader as="h3" icon={CalendarDays} title="This week" />
            <div className="mt-4 space-y-2">
              {days.map((day) => {
                const totals = dayTotals(day);
                const isSelected = day.id === selectedDay.id;
                const isToday = day.iso === today;

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    className={cn(
                      "fw-press relative w-full overflow-hidden rounded-[1.25rem] px-4 py-4 pl-5 text-left ring-1 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                      isSelected
                        ? "bg-primary-50 ring-primary-300"
                        : "bg-surface-subtle ring-hairline hover:-translate-y-0.5 hover:bg-surface hover:ring-primary-200"
                    )}
                  >
                    {/* Today rail — the marker has to survive whichever day is
                        currently selected, so it is a separate channel. */}
                    {isToday && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary-400 to-primary-600"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-black text-ink">
                          <span className="tabular-nums">{day.label}, {day.date}</span>
                          {isToday && (
                            <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-white">
                              Today
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 break-words text-xs font-semibold text-ink-muted">{day.focus}</p>
                      </div>
                      <ChevronRight
                        className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-600" : "text-ink-faint")}
                        strokeWidth={2.25}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                      <span className="shrink-0 font-black tabular-nums text-ink-muted">
                        {totals.protein}g protein
                      </span>
                      <span
                        className="flex flex-1 items-center gap-1"
                        role="img"
                        aria-label={`${totals.planned} of ${day.meals.length} meals planned`}
                      >
                        <SlotStrip meals={day.meals} />
                      </span>
                      <span className="shrink-0 font-black tabular-nums text-ink-subtle">
                        {totals.planned}/{day.meals.length}
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
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-700">
                    {selectedDay.focus}
                  </p>
                  <h2 className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-heading text-2xl font-black tracking-tight text-ink md:text-3xl">
                    <span className="tabular-nums">{selectedDay.label}, {selectedDay.date}</span>
                    {selectedDay.iso === today && (
                      <Badge variant="success" size="sm" dot>
                        Today
                      </Badge>
                    )}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:min-w-56">
                  <div className="min-w-0 rounded-[1rem] bg-primary-50 px-4 py-3 ring-1 ring-inset ring-primary-100">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-primary-700">Calories</p>
                    <p className="mt-0.5 text-xl font-black tabular-nums leading-none text-ink">
                      {selectedTotals.calories.toLocaleString()}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-[1rem] bg-sky-50 px-4 py-3 ring-1 ring-inset ring-sky-100">
                    <p className="text-[11px] font-black uppercase tracking-[0.1em] text-sky-700">Protein</p>
                    <p className="mt-0.5 text-xl font-black tabular-nums leading-none text-ink">
                      {selectedTotals.protein}g
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-[1.15rem] bg-primary-50/70 p-4 ring-1 ring-inset ring-primary-100">
                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-primary-800">
                  <span>Week planned</span>
                  <span className="tabular-nums">
                    {weekTotals.planned}/{slotCount} · {weekPlannedPercent}%
                  </span>
                </div>
                <ProgressMeter
                  value={weekTotals.planned}
                  target={slotCount}
                  color="var(--color-primary-500)"
                  label={`${weekTotals.planned} of ${slotCount} meal slots planned this week`}
                  className="bg-surface"
                />
              </div>

              {actionNote && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-[1.15rem] bg-primary-50 px-4 py-3 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-100 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
                  <span className="min-w-0 break-words">{actionNote}</span>
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
                      // Open slots read as a hatched well: a hairline dashed
                      // outline plus a faint diagonal fill, so "nothing here
                      // yet" is unmistakable without a heavy 2px frame.
                      style={
                        isOpen
                          ? {
                              backgroundImage:
                                "repeating-linear-gradient(135deg, rgba(22,48,42,0.035) 0 6px, transparent 6px 14px)",
                            }
                          : undefined
                      }
                      className={cn(
                        "rounded-[1.45rem] p-5 transition-colors duration-200 ease-out-soft",
                        isOpen
                          ? "border border-dashed border-hairline-strong bg-surface-muted/70"
                          : "bg-surface-subtle ring-1 ring-inset ring-hairline"
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] ring-1 ring-inset",
                              meal.status === "logged"
                                ? "bg-primary-50 text-primary-600 ring-primary-100"
                                : isOpen
                                  ? "bg-surface text-ink-faint ring-hairline-strong"
                                  : `${tone.bg} ${tone.text} ring-ink/5`
                            )}
                          >
                            {meal.status === "logged" ? (
                              <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                            ) : isOpen ? (
                              <CircleDashed className="h-4 w-4" strokeWidth={2.25} />
                            ) : (
                              <UtensilsCrossed className="h-4 w-4" strokeWidth={2.25} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-ink-subtle">
                              {meal.slot} · {tone.label}
                              {isOpen ? " · Suggested" : ""}
                            </p>
                            {isOpen && (
                              <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-ink-muted">
                                Open slot — nothing planned yet
                              </p>
                            )}
                            <h3
                              className={cn(
                                "mt-1 break-words text-lg font-black leading-snug",
                                isOpen ? "text-ink-muted" : "text-ink"
                              )}
                            >
                              {meal.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-muted ring-1 ring-inset ring-hairline">
                                <Flame className="h-3.5 w-3.5 shrink-0 text-primary-600" strokeWidth={2.25} />
                                <span className="font-black tabular-nums text-ink">
                                  {meal.calories.toLocaleString()}
                                </span>
                                kcal
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-muted ring-1 ring-inset ring-hairline">
                                <Beef className="h-3.5 w-3.5 shrink-0 text-sky-600" strokeWidth={2.25} />
                                <span className="font-black tabular-nums text-ink">{meal.protein}g</span>
                                protein
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-muted ring-1 ring-inset ring-hairline">
                                <Clock className="h-3.5 w-3.5 shrink-0 text-ink-subtle" strokeWidth={2.25} />
                                {meal.prep}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isOpen ? (
                          <Button
                            type="button"
                            variant="tonal"
                            size="sm"
                            className="shrink-0"
                            onClick={() => fillOpenSlot(selectedDay, meal)}
                          >
                            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                            Fill slot
                          </Button>
                        ) : (
                          <Badge
                            variant={meal.status === "logged" ? "success" : "default"}
                            dot={meal.status === "logged"}
                          >
                            {meal.status === "logged" ? "Logged" : meal.status === "added" ? "Added" : "Planned"}
                          </Badge>
                        )}
                      </div>
                      {!isOpen && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
                          {recipe && (
                            <button
                              type="button"
                              onClick={() => setOpenRecipe(recipe)}
                              className="fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-black text-primary-700 ring-1 ring-inset ring-hairline transition hover:bg-primary-50 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 md:min-h-9"
                            >
                              <BookOpen className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                              Open recipe
                            </button>
                          )}
                          {meal.status !== "logged" && (
                            <>
                              <button
                                type="button"
                                onClick={() => void logMealToToday(selectedDay, meal)}
                                className="fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-black text-primary-700 ring-1 ring-inset ring-hairline transition hover:bg-primary-50 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 md:min-h-9"
                              >
                                <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                                Log to today
                              </button>
                              <button
                                type="button"
                                onClick={() => swapMeal(selectedDay, meal)}
                                className="fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-black text-primary-700 ring-1 ring-inset ring-hairline transition hover:bg-primary-50 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 md:min-h-9"
                              >
                                <RefreshCcw className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
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
              <SectionHeader
                title="Week at a glance"
                description="Each strip is one day's meal slots — filled means planned, hollow means open."
                action={
                  <Badge variant={openSlotCount === 0 ? "success" : "warning"} dot>
                    {openSlotCount === 0 ? "Week complete" : `${openSlotCount} open`}
                  </Badge>
                }
              />
              {/* Legend for the strips below — a chart with no key is decoration. */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[1.15rem] bg-surface-muted px-3.5 py-2.5 ring-1 ring-inset ring-hairline">
                <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-ink-muted">
                  <span aria-hidden="true" className="h-1.5 w-6 rounded-full bg-primary-600" />
                  Planned
                </span>
                <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-ink-muted">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-6 rounded-full bg-surface-sunken ring-1 ring-inset ring-hairline-strong"
                  />
                  Open
                </span>
                <span className="text-[11px] font-bold text-ink-muted">
                  B / L / D / S = breakfast, lunch, dinner, snack
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {days.map((day) => {
                  const totals = dayTotals(day);
                  const isToday = day.iso === today;
                  const openSlots = day.meals
                    .filter((meal) => meal.status === "open")
                    .map((meal) => meal.slot);

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        setSelectedDayId(day.id);
                        setView("day");
                      }}
                      aria-current={isToday ? "date" : undefined}
                      className={cn(
                        "fw-press relative overflow-hidden rounded-[1.35rem] p-5 pl-6 text-left ring-1 ring-inset hover:-translate-y-0.5 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
                        isToday
                          ? "bg-primary-50/70 ring-primary-200"
                          : "bg-surface-subtle ring-hairline hover:ring-primary-200"
                      )}
                    >
                      {isToday && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary-400 to-primary-600"
                        />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-black text-ink">
                            <span className="tabular-nums">{day.label}, {day.date}</span>
                            {isToday && (
                              <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-white">
                                Today
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 break-words text-xs font-semibold text-ink-muted">{day.focus}</p>
                        </div>
                        <Badge
                          variant={totals.planned === day.meals.length ? "success" : "warning"}
                          className="shrink-0 tabular-nums"
                        >
                          {totals.planned}/{day.meals.length}
                        </Badge>
                      </div>
                      <div
                        className="mt-3 flex items-start gap-1"
                        role="img"
                        aria-label={`${totals.planned} of ${day.meals.length} meals planned on ${day.label}: ${
                          openSlots.length > 0
                            ? `${openSlots.join(", ")} still open`
                            : "every slot filled"
                        }`}
                      >
                        <SlotStrip meals={day.meals} showLabels />
                      </div>
                      <p
                        className={cn(
                          "mt-2 break-words text-[11px] font-black uppercase tracking-[0.1em]",
                          openSlots.length > 0 ? "text-ink-subtle" : "text-primary-700"
                        )}
                      >
                        {openSlots.length > 0
                          ? `Open: ${openSlots.join(", ")}`
                          : "Every slot filled"}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="min-w-0 rounded-[1rem] bg-surface px-4 py-3 ring-1 ring-inset ring-hairline">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">Calories</p>
                          <p className="mt-0.5 text-xl font-black tabular-nums leading-none text-ink">
                            {totals.calories.toLocaleString()}
                          </p>
                        </div>
                        <div className="min-w-0 rounded-[1rem] bg-surface px-4 py-3 ring-1 ring-inset ring-hairline">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">Protein</p>
                          <p className="mt-0.5 text-xl font-black tabular-nums leading-none text-ink">
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
