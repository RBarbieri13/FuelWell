"use client";

import { useState } from "react";
import {
  Beef,
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplet,
  Flame,
  Leaf,
  ListOrdered,
  ListPlus,
  Soup,
  Users,
  UtensilsCrossed,
  Wheat,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
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

/** Shared styling for the day / slot / meal choice pills in the two pickers. */
const pickerPill =
  "fw-press min-h-11 rounded-full px-3.5 py-1.5 text-xs font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 sm:min-h-9";
const pickerPillOn = "bg-primary-600 text-white ring-primary-700";
const pickerPillOff =
  "bg-surface text-primary-800 ring-primary-100 hover:bg-primary-100";

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
  const nutrition: { label: string; value: string; tone: string; glyph: string; icon: typeof Flame }[] = [
    { label: "Calories", value: `${recipe.perServing.calories}`, tone: "bg-primary-50 ring-primary-100", glyph: "text-primary-600", icon: Flame },
    { label: "Protein", value: `${recipe.perServing.protein}g`, tone: "bg-sky-50 ring-sky-100", glyph: "text-sky-600", icon: Beef },
    { label: "Carbs", value: `${recipe.perServing.carbs}g`, tone: "bg-lemon-50 ring-lemon-100", glyph: "text-lemon-600", icon: Wheat },
    { label: "Fat", value: `${recipe.perServing.fat}g`, tone: "bg-accent-50 ring-accent-100", glyph: "text-accent-600", icon: Droplet },
    { label: "Fiber", value: `${recipe.perServing.fiber}g`, tone: "bg-primary-50 ring-primary-100", glyph: "text-primary-600", icon: Leaf },
  ];

  // Energy split of the three macros, derived from the same per-serving grams
  // already shown above (4/4/9 kcal per gram). Rendered only when there is a
  // real series — an empty axis is worse than no chart.
  const energy = (() => {
    const protein = Math.max(recipe.perServing.protein, 0) * 4;
    const carbs = Math.max(recipe.perServing.carbs, 0) * 4;
    const fat = Math.max(recipe.perServing.fat, 0) * 9;
    const total = protein + carbs + fat;
    if (total <= 0) return null;
    return {
      total,
      parts: [
        { key: "Protein", share: (protein / total) * 100, pct: Math.round((protein / total) * 100), fill: "var(--color-macro-protein)" },
        { key: "Carbs", share: (carbs / total) * 100, pct: Math.round((carbs / total) * 100), fill: "var(--color-macro-carbs)" },
        { key: "Fat", share: (fat / total) * 100, pct: Math.round((fat / total) * 100), fill: "var(--color-macro-fat)" },
      ],
    };
  })();

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
        className="top-auto bottom-0 block max-h-[92vh] w-full max-w-full -translate-x-1/2 translate-y-0 overflow-y-auto rounded-none rounded-t-[2rem] bg-surface p-0 shadow-e4 ring-0 sm:top-1/2 sm:bottom-auto sm:max-w-2xl sm:-translate-y-1/2 sm:rounded-[2rem]"
      >
        <div className="sticky top-0 z-10 border-b border-hairline bg-gradient-to-b from-primary-50/90 to-surface/95 px-5 py-4 backdrop-blur">
          {/* Drag affordance for the sheet presentation on phones. */}
          <span
            aria-hidden="true"
            className="mx-auto mb-3 block h-1 w-10 rounded-full bg-hairline-strong sm:hidden"
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
                <span className="rounded-full bg-primary-100 px-2.5 py-1 text-primary-800 ring-1 ring-inset ring-primary-200/70">
                  {recipe.meal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-muted ring-1 ring-inset ring-hairline">
                  <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                  <span className="tabular-nums">{recipe.minutes}</span> min
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-muted ring-1 ring-inset ring-hairline">
                  <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                  <span className="tabular-nums">{recipe.servings}</span>{" "}
                  {recipe.servings === 1 ? "serving" : "servings"}
                </span>
              </div>
              <h2 className="mt-2 break-words font-heading text-xl font-black leading-snug tracking-tight text-ink">
                {recipe.title}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <PreferenceToggle id={recipe.id} size="sm" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close recipe"
                className="fw-press flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-7 px-4 py-5 sm:px-5">
          <section className="min-w-0 space-y-2">
            <div className="grid min-w-0 gap-2 sm:grid-cols-3">
              <Button
                type="button"
                onClick={() => setOpenPicker(openPicker === "log" ? null : "log")}
                disabled={pendingAction !== null}
                loading={pendingAction === "meal"}
                aria-expanded={openPicker === "log"}
                className="w-full min-w-0"
              >
                {pendingAction !== "meal" && <UtensilsCrossed className="h-4 w-4" strokeWidth={2.25} />}
                {pendingAction === "meal" ? "Saving meal..." : "Log to today"}
              </Button>
              <Button
                type="button"
                variant="tonal"
                onClick={() => setOpenPicker(openPicker === "plan" ? null : "plan")}
                aria-expanded={openPicker === "plan"}
                className="w-full min-w-0"
              >
                <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
                Add to plan
              </Button>
              <Button
                type="button"
                variant="tonal"
                onClick={addIngredients}
                disabled={pendingAction !== null}
                loading={pendingAction === "groceries"}
                className="w-full min-w-0"
              >
                {pendingAction !== "groceries" && <ListPlus className="h-4 w-4" strokeWidth={2.25} />}
                {pendingAction === "groceries" ? "Saving groceries..." : "Add ingredients"}
              </Button>
            </div>

            {openPicker === "log" && (
              <div className="min-w-0 space-y-3 rounded-[1.15rem] bg-surface-muted p-3.5 ring-1 ring-inset ring-hairline-strong">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-ink-subtle">
                  Log to which meal today?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {MEAL_TYPES.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setLogSlot(slot)}
                      aria-pressed={logSlot === slot}
                      className={cn(pickerPill, logSlot === slot ? pickerPillOn : pickerPillOff)}
                    >
                      {formatMealType(slot)}
                    </button>
                  ))}
                </div>
                <Button type="button" size="sm" onClick={logToToday} disabled={pendingAction !== null}>
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                  Add to {formatMealType(logSlot).toLowerCase()}
                </Button>
              </div>
            )}

            {openPicker === "plan" && (
              <div className="min-w-0 space-y-3 rounded-[1.15rem] bg-surface-muted p-3.5 ring-1 ring-inset ring-hairline-strong">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-ink-subtle">
                  Plan for which day and slot?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setPlanDayId(day.id)}
                      aria-pressed={planDayId === day.id}
                      className={cn(pickerPill, planDayId === day.id ? pickerPillOn : pickerPillOff)}
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
                      className={cn(pickerPill, planSlot === slot ? pickerPillOn : pickerPillOff)}
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
                    <p className="text-xs font-semibold text-ink-muted">
                      Replaces {occupant.title} in that slot.
                    </p>
                  ) : null;
                })()}
                <Button type="button" size="sm" onClick={addToPlan}>
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                  Plan this slot
                </Button>
              </div>
            )}

            {confirmation && (
              <p role="status" className="flex min-w-0 items-start gap-2 rounded-[1rem] bg-primary-50 px-3 py-2.5 text-sm font-bold leading-5 text-primary-800 ring-1 ring-inset ring-primary-100">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span className="min-w-0 break-words">{confirmation}</span>
              </p>
            )}
          </section>

          <section>
            <SectionHeader
              as="h3"
              icon={Flame}
              title="Per serving"
              action={
                <Badge variant="neutral" size="sm">
                  {recipe.servings} {recipe.servings === 1 ? "serving" : "servings"} total
                </Badge>
              }
            />
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {nutrition.map((item) => {
                const Icon = item.icon;
                return (
                <div
                  key={item.label}
                  className={`min-w-0 rounded-[1rem] px-2 py-3 text-center ring-1 ring-inset ${item.tone}`}
                >
                  <Icon className={`mx-auto h-4 w-4 ${item.glyph}`} strokeWidth={2.25} />
                  <p className="mt-1 text-base font-black tabular-nums text-ink">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-black uppercase tracking-[0.06em] text-ink-muted">
                    {item.label}
                  </p>
                </div>
                );
              })}
            </div>

            {energy && (
              <div className="mt-3 rounded-[1.15rem] bg-surface-muted p-3.5 ring-1 ring-inset ring-hairline">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">
                    Energy split
                  </p>
                  <p className="text-[11px] font-bold text-ink-faint">
                    est. from 4/4/9 kcal per gram
                  </p>
                </div>
                <div
                  role="img"
                  aria-label={`Energy split per serving: protein ${energy.parts[0].pct} percent, carbs ${energy.parts[1].pct} percent, fat ${energy.parts[2].pct} percent`}
                  className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-hairline"
                >
                  {/* Exact shares (not the rounded label values) so the three
                      segments always tile to precisely 100% of the track. */}
                  {energy.parts.map((part) => (
                    <span
                      key={part.key}
                      className="h-full"
                      style={{ width: `${part.share}%`, backgroundColor: part.fill }}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {energy.parts.map((part) => (
                    <span
                      key={part.key}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted"
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: part.fill }}
                      />
                      {part.key}
                      <span className="font-black tabular-nums text-ink">{part.pct}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <SectionHeader
              as="h3"
              icon={Soup}
              title="Ingredients"
              action={
                <Badge variant="neutral" size="sm">
                  {recipe.ingredients.length} items
                </Badge>
              }
            />
            <ul className="mt-3 overflow-hidden rounded-[1.15rem] ring-1 ring-inset ring-hairline">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={`${ing.item}-${i}`}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline bg-surface-subtle px-3.5 py-2.5 text-sm last:border-b-0 odd:bg-surface"
                >
                  <span className="min-w-0 break-words font-semibold text-ink-muted">{ing.item}</span>
                  <span className="shrink-0 font-black tabular-nums text-ink">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionHeader
              as="h3"
              icon={ListOrdered}
              title="Steps"
              action={
                <Badge variant="neutral" size="sm">
                  {recipe.steps.length} steps
                </Badge>
              }
            />
            <ol className="mt-3 space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-black tabular-nums text-white shadow-e1">
                    {i + 1}
                  </span>
                  <span className="min-w-0 break-words pt-0.5 font-semibold text-ink-muted">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-hairline pt-5">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="max-w-full break-words rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-ink-muted ring-1 ring-inset ring-hairline"
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
