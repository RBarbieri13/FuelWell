"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Plus,
  ShoppingBasket,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

type MealSlot = "Breakfast" | "Lunch" | "Dinner" | "Snack";

type PlannedMeal = {
  slot: MealSlot;
  title: string;
  calories: number;
  protein: number;
  prep: string;
  status: "planned" | "logged" | "open";
};

type PlanDay = {
  id: string;
  label: string;
  date: string;
  focus: string;
  meals: PlannedMeal[];
};

const days: PlanDay[] = [
  {
    id: "mon",
    label: "Mon",
    date: "Jun 8",
    focus: "Training day",
    meals: [
      { slot: "Breakfast", title: "Egg White Feta Wrap", calories: 360, protein: 31, prep: "12 min", status: "logged" },
      { slot: "Lunch", title: "Turkey Quinoa Power Bowl", calories: 520, protein: 43, prep: "22 min", status: "planned" },
      { slot: "Dinner", title: "Salmon, Sweet Potato, Greens", calories: 610, protein: 46, prep: "28 min", status: "planned" },
      { slot: "Snack", title: "Greek Yogurt Berry Crunch", calories: 240, protein: 24, prep: "5 min", status: "planned" },
    ],
  },
  {
    id: "tue",
    label: "Tue",
    date: "Jun 9",
    focus: "Light carbs",
    meals: [
      { slot: "Breakfast", title: "Protein Overnight Oats", calories: 410, protein: 34, prep: "Prep tonight", status: "planned" },
      { slot: "Lunch", title: "Chicken Cobb Salad", calories: 485, protein: 42, prep: "15 min", status: "planned" },
      { slot: "Dinner", title: "Turkey Lettuce Cups", calories: 450, protein: 39, prep: "20 min", status: "open" },
      { slot: "Snack", title: "Cottage Cheese and Peaches", calories: 210, protein: 23, prep: "3 min", status: "planned" },
    ],
  },
  {
    id: "wed",
    label: "Wed",
    date: "Jun 10",
    focus: "Busy day",
    meals: [
      { slot: "Breakfast", title: "Spinach Egg Bites", calories: 310, protein: 26, prep: "Batch ready", status: "planned" },
      { slot: "Lunch", title: "Chicken Pesto Protein Pasta", calories: 690, protein: 51, prep: "24 min", status: "planned" },
      { slot: "Dinner", title: "Shrimp Stir Fry Rice Bowl", calories: 560, protein: 44, prep: "18 min", status: "planned" },
      { slot: "Snack", title: "Apple with Peanut Butter", calories: 220, protein: 8, prep: "2 min", status: "open" },
    ],
  },
  {
    id: "thu",
    label: "Thu",
    date: "Jun 11",
    focus: "Recovery",
    meals: [
      { slot: "Breakfast", title: "Greek Yogurt Berry Crunch", calories: 240, protein: 24, prep: "5 min", status: "planned" },
      { slot: "Lunch", title: "Black Bean Avocado Tacos", calories: 480, protein: 22, prep: "18 min", status: "open" },
      { slot: "Dinner", title: "Sheet Pan Chicken Fajitas", calories: 590, protein: 49, prep: "30 min", status: "planned" },
      { slot: "Snack", title: "Protein Shake", calories: 190, protein: 30, prep: "2 min", status: "planned" },
    ],
  },
];

const mealIdeas = [
  "Turkey Quinoa Power Bowl",
  "Salmon, Sweet Potato, Greens",
  "Chicken Cobb Salad",
  "Protein Overnight Oats",
];

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

export default function MealPlanPage() {
  const [selectedDayId, setSelectedDayId] = useState(days[0].id);
  const [view, setView] = useState<"day" | "week">("day");
  const [addedMeals, setAddedMeals] = useState<Record<string, string>>({});

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

  function fillOpenSlot(slot: MealSlot) {
    const nextIdea = mealIdeas[(Object.keys(addedMeals).length + slot.length) % mealIdeas.length];
    setAddedMeals((current) => ({
      ...current,
      [`${selectedDay.id}-${slot}`]: nextIdea,
    }));
  }

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-3xl md:text-4xl">Meal plan</h1>
            <p className="fw-muted mt-1 text-base">
              Plan the next few days around protein, prep time, and grocery needs.
            </p>
          </div>
          <div className="flex rounded-full bg-white p-1 shadow-[0_18px_42px_rgba(22,48,42,0.10)]">
            {(["day", "week"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "rounded-full px-6 py-3 text-sm font-black capitalize transition-all",
                  view === mode ? "bg-primary-600 text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)]" : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="fw-dark-panel px-8 py-8">
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-200">
              <Sparkles className="h-4 w-4" />
              Plan quality
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl">
              {weekTotals.planned} of {days.length * 4} meals are planned.
            </h2>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/74">
              Your next step is to fill the open dinner and lunch slots, then send the week to groceries.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ["Avg cals", Math.round(weekTotals.calories / days.length).toString()],
                ["Avg protein", `${Math.round(weekTotals.protein / days.length)}g`],
                ["Open slots", `${days.length * 4 - weekTotals.planned}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-5 py-4 backdrop-blur">
                  <p className="text-3xl font-black tabular-nums text-white">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/58">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="elevated" className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="fw-icon-chip">
                <ShoppingBasket className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Grocery readiness</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">
                  Planned meals are grouped into the grocery list as soon as the open slots are filled.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="fw-soft-row p-4">
                <p className="text-3xl font-black text-neutral-900">18</p>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">unique ingredients</p>
              </div>
              <div className="fw-soft-row p-4">
                <p className="text-3xl font-black text-neutral-900">2</p>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">slots to fill</p>
              </div>
            </div>
            <Button type="button" className="w-full">
              Build grocery list
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <Card className="h-fit px-5 py-5">
            <h2 className="flex items-center gap-2 text-lg font-black text-neutral-900">
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
                      "w-full rounded-[1.2rem] border px-4 py-4 text-left transition-all",
                      isSelected
                        ? "border-primary-200 bg-primary-50 shadow-sm shadow-primary-900/5"
                        : "border-primary-100 bg-white hover:border-primary-200 hover:bg-primary-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-base font-black text-neutral-900">
                          {day.label}, {day.date}
                        </p>
                        <p className="text-xs font-semibold text-neutral-500 mt-0.5">{day.focus}</p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4", isSelected ? "text-primary-600" : "text-neutral-300")} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-neutral-500">
                      <span className="font-black tabular-nums text-neutral-700">
                        {totals.protein}g protein
                      </span>
                      <span>{totals.planned}/4 meals</span>
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
                  <h2 className="mt-1 text-3xl font-black text-neutral-900">
                    {selectedDay.label}, {selectedDay.date}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:min-w-56">
                  <div className="rounded-[1rem] bg-primary-50 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-primary-700">Calories</p>
                    <p className="text-xl font-black tabular-nums text-neutral-900">
                      {selectedTotals.calories}
                    </p>
                  </div>
                  <div className="rounded-[1rem] bg-sky-50 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-700">Protein</p>
                    <p className="text-xl font-black tabular-nums text-neutral-900">
                      {selectedTotals.protein}g
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {selectedDay.meals.map((meal) => {
                  const addedTitle = addedMeals[`${selectedDay.id}-${meal.slot}`];
                  const isOpen = meal.status === "open" && !addedTitle;

                  return (
                    <div
                      key={meal.slot}
                      className={cn(
                        "rounded-[1.35rem] border p-5 transition-colors",
                        isOpen ? "border-dashed border-accent-200 bg-accent-50/50" : "border-primary-100 bg-white"
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
                                  : "bg-neutral-100 text-neutral-500"
                            )}
                          >
                            {meal.status === "logged" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <UtensilsCrossed className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
                              {meal.slot}
                            </p>
                            <h3 className="mt-1 text-lg font-black text-neutral-900">
                              {addedTitle ?? meal.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-500">
                              <span className="tabular-nums">{meal.calories} cal</span>
                              <span className="tabular-nums">{meal.protein}g protein</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {meal.prep}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isOpen ? (
                          <Button type="button" variant="secondary" size="sm" onClick={() => fillOpenSlot(meal.slot)}>
                            <Plus className="w-4 h-4" />
                            Fill slot
                          </Button>
                        ) : (
                          <Badge variant={meal.status === "logged" ? "success" : "default"}>
                            {meal.status === "logged" ? "Logged" : addedTitle ? "Added" : "Planned"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card variant="elevated">
              <h2 className="text-2xl font-black text-neutral-900">Week at a glance</h2>
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
                      className="rounded-[1.35rem] border border-primary-100 bg-neutral-50/80 p-5 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-black text-neutral-900">
                            {day.label}, {day.date}
                          </p>
                          <p className="text-xs font-semibold text-neutral-500">{day.focus}</p>
                        </div>
                        <Badge variant={totals.planned === 4 ? "success" : "warning"}>
                          {totals.planned}/4
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-[1rem] bg-white px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Calories</p>
                          <p className="text-xl font-black tabular-nums text-neutral-900">
                            {totals.calories}
                          </p>
                        </div>
                        <div className="rounded-[1rem] bg-white px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-400">Protein</p>
                          <p className="text-xl font-black tabular-nums text-neutral-900">
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

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="bg-primary-50/80 border-primary-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-white text-primary-700">
                <Dumbbell className="w-5 h-5" />
              </span>
              <h2 className="mt-4 text-xl font-black text-neutral-900">Next best move</h2>
              <p className="mt-2 text-base font-semibold leading-7 text-neutral-600">
                Fill Tuesday dinner with a lean protein recipe so the week stays
                above 135g protein per day.
              </p>
            </Card>
            <Card>
              <span className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-accent-100 text-accent-700">
                <ShoppingBasket className="w-5 h-5" />
              </span>
              <h2 className="mt-4 text-xl font-black text-neutral-900">Ready for groceries</h2>
              <p className="mt-2 text-base font-semibold leading-7 text-neutral-600">
                Your planned meals need 18 unique ingredients. Review grouped
                items before shopping.
              </p>
              <Button type="button" size="sm" className="mt-4">
                Build grocery list
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
