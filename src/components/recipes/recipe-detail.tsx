"use client";

import { useState } from "react";
import { Beef, CalendarDays, CheckCircle2, Clock, Flame, Leaf, ListPlus, Users, Wheat, Droplet, UtensilsCrossed, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PreferenceToggle } from "@/components/food/preference-toggle";
import { cn } from "@/lib/utils/cn";
import type { Recipe } from "@/lib/recipes-data";
import { useDayLog } from "@/lib/use-day-log";
import {
  inferGroceryCategory,
  inferGroceryDetails,
  setGroceryItems,
  useGroceryList,
} from "@/lib/use-grocery-list";
import {
  PLAN_SLOTS,
  plannedMealFromRecipe,
  useMealPlan,
  type PlanSlot,
} from "@/lib/use-meal-plan";
import { formatMealType, type MealType } from "@/lib/fuelwell-data";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

/**
 * Recipe detail modal: full ingredient list with measurements, the steps, and
 * complete per-serving nutrition plus serving count. Closes on backdrop click
 * or Escape.
 */
export function RecipeDetail({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const { addMeal } = useDayLog();
  const { items } = useGroceryList();
  const { days, setPlanMeal } = useMealPlan();
  const [confirmation, setConfirmation] = useState("");
  const [pendingAction, setPendingAction] = useState<"meal" | "groceries" | null>(null);
  const [openPicker, setOpenPicker] = useState<"log" | "plan" | null>(null);
  const mealType = recipe.meal.toLowerCase() as MealType;
  const [logSlot, setLogSlot] = useState<MealType>(mealType);
  const [planSlot, setPlanSlot] = useState<PlanSlot>(recipe.meal);
  const [planDayId, setPlanDayId] = useState(
    () =>
      days.find((day) =>
        day.meals.some((meal) => meal.slot === recipe.meal && meal.status === "open")
      )?.id ?? days[0]?.id
  );
  const nutrition: { label: string; value: string; tone: string; icon: typeof Flame }[] = [
    { label: "Calories", value: `${recipe.perServing.calories}`, tone: "bg-primary-50 text-primary-700 border-primary-100", icon: Flame },
    { label: "Protein", value: `${recipe.perServing.protein}g`, tone: "bg-sky-50 text-sky-700 border-sky-100", icon: Beef },
    { label: "Carbs", value: `${recipe.perServing.carbs}g`, tone: "bg-lemon-50 text-lemon-700 border-lemon-100", icon: Wheat },
    { label: "Fat", value: `${recipe.perServing.fat}g`, tone: "bg-accent-50 text-accent-700 border-accent-100", icon: Droplet },
    { label: "Fiber", value: `${recipe.perServing.fiber}g`, tone: "bg-primary-50 text-primary-700 border-primary-100", icon: Leaf },
  ];

  async function logToToday() {
    setConfirmation("");
    setPendingAction("meal");
    const result = await addMeal({
      mealType: logSlot,
      name: recipe.title,
      items: [{
        name: recipe.title,
        servings: 1,
        calories: recipe.perServing.calories,
        protein: recipe.perServing.protein,
        carbs: recipe.perServing.carbs,
        fat: recipe.perServing.fat,
      }],
    });
    setConfirmation(
      result.ok
        ? `${recipe.title} added to today's ${logSlot}.`
        : `Meal was not saved: ${result.error}`,
    );
    setPendingAction(null);
    setOpenPicker(null);
  }

  function addToPlan() {
    const day = days.find((candidate) => candidate.id === planDayId) ?? days[0];
    if (!day) return;
    setConfirmation("");
    setPlanMeal(day.id, planSlot, plannedMealFromRecipe(planSlot, recipe, "added"));
    setConfirmation(`${recipe.title} planned for ${day.label} ${planSlot.toLowerCase()}.`);
    setOpenPicker(null);
  }

  async function addIngredients() {
    setConfirmation("");
    const existing = new Set(items.map((item) => item.name.toLowerCase()));
    const additions = recipe.ingredients
      .filter((ingredient) => !existing.has(ingredient.item.toLowerCase()))
      .map((ingredient, index) => {
        const category = inferGroceryCategory(ingredient.item);
        return {
          id: `recipe-${recipe.id}-${index}`,
          name: ingredient.item,
          amount: ingredient.amount,
          category,
          source: recipe.title,
          checked: false,
          ...inferGroceryDetails(ingredient.item, ingredient.amount, category),
        };
      });
    setPendingAction("groceries");
    const result = await setGroceryItems([...additions, ...items]);
    setConfirmation(
      !result.ok
        ? `Groceries were not saved: ${result.error}`
        : additions.length > 0
        ? `${additions.length} ingredients added to Groceries.`
        : "These ingredients are already in Groceries."
    );
    setPendingAction(null);
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-label={recipe.title}
        showCloseButton={false}
        className="top-auto bottom-0 block max-h-[92vh] w-full max-w-full -translate-x-1/2 translate-y-0 overflow-y-auto rounded-none rounded-t-[2rem] bg-white p-0 shadow-[0_30px_90px_rgba(22,48,42,0.22)] ring-0 sm:top-1/2 sm:bottom-auto sm:max-w-2xl sm:-translate-y-1/2 sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-primary-100/80 bg-white/94 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black text-muted-foreground">
              <span className="rounded-full bg-primary-100 px-2.5 py-1 text-primary-800">
                {recipe.meal}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f7f5] px-2.5 py-1">
                <Clock className="h-3.5 w-3.5" />
                {recipe.minutes} min
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f7f5] px-2.5 py-1">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings}{" "}
                {recipe.servings === 1 ? "serving" : "servings"}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black leading-snug text-[#16302a]">
              {recipe.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <PreferenceToggle id={recipe.id} size="sm" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close recipe"
              className="rounded-full p-2 text-muted-foreground transition hover:bg-primary-50 hover:text-primary-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-4 py-5 sm:px-5">
          <section className="min-w-0 space-y-2">
            <div className="grid min-w-0 gap-2 sm:grid-cols-3">
              <Button
                type="button"
                onClick={() => setOpenPicker(openPicker === "log" ? null : "log")}
                disabled={pendingAction !== null}
                aria-expanded={openPicker === "log"}
                className="w-full min-w-0"
              >
                <UtensilsCrossed className="h-4 w-4" />
                {pendingAction === "meal" ? "Saving meal..." : "Log to today"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpenPicker(openPicker === "plan" ? null : "plan")}
                aria-expanded={openPicker === "plan"}
                className="w-full min-w-0"
              >
                <CalendarDays className="h-4 w-4" />
                Add to plan
              </Button>
              <Button type="button" variant="secondary" onClick={addIngredients} disabled={pendingAction !== null} className="w-full min-w-0">
                <ListPlus className="h-4 w-4" />
                {pendingAction === "groceries" ? "Saving groceries..." : "Add ingredients"}
              </Button>
            </div>

            {openPicker === "log" && (
              <div className="min-w-0 space-y-3 rounded-[1.15rem] border border-primary-100 bg-primary-50/60 p-3.5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Log to which meal today?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MEAL_TYPES.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setLogSlot(slot)}
                      aria-pressed={logSlot === slot}
                      className={cn(
                        "min-h-11 rounded-full px-3.5 py-1.5 text-xs font-black transition sm:min-h-0",
                        logSlot === slot
                          ? "bg-primary-600 text-white"
                          : "bg-white text-primary-800 hover:bg-primary-100"
                      )}
                    >
                      {formatMealType(slot)}
                    </button>
                  ))}
                </div>
                <Button type="button" size="sm" onClick={logToToday} disabled={pendingAction !== null}>
                  <CheckCircle2 className="h-4 w-4" />
                  Add to {formatMealType(logSlot).toLowerCase()}
                </Button>
              </div>
            )}

            {openPicker === "plan" && (
              <div className="min-w-0 space-y-3 rounded-[1.15rem] border border-primary-100 bg-primary-50/60 p-3.5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Plan for which day and slot?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setPlanDayId(day.id)}
                      aria-pressed={planDayId === day.id}
                      className={cn(
                        "min-h-11 rounded-full px-3.5 py-1.5 text-xs font-black transition sm:min-h-0",
                        planDayId === day.id
                          ? "bg-primary-600 text-white"
                          : "bg-white text-primary-800 hover:bg-primary-100"
                      )}
                    >
                      {day.label}, {day.date}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PLAN_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPlanSlot(slot)}
                      aria-pressed={planSlot === slot}
                      className={cn(
                        "min-h-11 rounded-full px-3.5 py-1.5 text-xs font-black transition sm:min-h-0",
                        planSlot === slot
                          ? "bg-primary-600 text-white"
                          : "bg-white text-primary-800 hover:bg-primary-100"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {(() => {
                  const day = days.find((candidate) => candidate.id === planDayId);
                  const occupant = day?.meals.find(
                    (meal) => meal.slot === planSlot && meal.status !== "open"
                  );
                  return occupant && occupant.title !== recipe.title ? (
                    <p className="text-xs font-semibold text-muted-foreground">
                      Replaces {occupant.title} in that slot.
                    </p>
                  ) : null;
                })()}
                <Button type="button" size="sm" onClick={addToPlan}>
                  <CheckCircle2 className="h-4 w-4" />
                  Plan this slot
                </Button>
              </div>
            )}

            {confirmation && (
              <p role="status" className="flex min-w-0 items-start gap-2 rounded-[1rem] border border-primary-100 bg-primary-50 px-3 py-2.5 text-sm font-bold leading-5 text-primary-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">{confirmation}</span>
              </p>
            )}
          </section>
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              Per serving
            </h3>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {nutrition.map((item) => {
                const Icon = item.icon;
                return (
                <div
                  key={item.label}
                  className={`rounded-[1rem] border px-3 py-3 text-center ${item.tone}`}
                >
                  <Icon className="mx-auto h-4 w-4" />
                  <p className="mt-1 text-base font-black tabular-nums text-[#16302a]">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.08em]">
                    {item.label}
                  </p>
                </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              Ingredients
            </h3>
            <ul className="mt-2 space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={`${ing.item}-${i}`}
                  className="flex items-baseline justify-between gap-4 rounded-[1rem] bg-[#f7faf8] px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-muted-foreground">{ing.item}</span>
                  <span className="shrink-0 font-black tabular-nums text-[#16302a]">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              Steps
            </h3>
            <ol className="mt-2 space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-black text-white">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f2f7f5] px-2.5 py-1 text-xs font-bold text-[#60776f]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
