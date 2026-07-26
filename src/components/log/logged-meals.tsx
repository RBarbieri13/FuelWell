"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ClipboardList, Pencil, Trash2, UtensilsCrossed, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import { formatMealType, type MealItem, type MealRecord } from "@/lib/fuelwell-data";

type ItemPatch = Partial<Omit<MealItem, "id">>;

type FieldKey = "calories" | "protein" | "carbs" | "fat";

const MACRO_FIELDS: { key: FieldKey; label: string }[] = [
  { key: "calories", label: "kcal" },
  { key: "protein", label: "Pro" },
  { key: "carbs", label: "Carb" },
  { key: "fat", label: "Fat" },
];

function parseNonNegative(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/**
 * Today's logged meals with inline editing. Each item can be edited
 * (name + macros via updateMealItem) or its whole meal removed (removeMeal).
 * Totals upstream recompute live because both mutate the shared day-log store.
 */
export function LoggedMeals({
  meals,
  onUpdateItem,
  onRemoveMeal,
}: {
  meals: MealRecord[];
  onUpdateItem: (mealId: string, itemId: string, patch: ItemPatch) => void;
  onRemoveMeal: (mealId: string) => void;
}) {
  if (meals.length === 0) {
    return (
      <Card className="space-y-3">
        <SectionHeader as="h2" icon={ClipboardList} title="Logged today" />
        <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60">
          <EmptyState
            size="inline"
            icon={UtensilsCrossed}
            title="Nothing logged yet."
            description="Add a food from search or your own meal. It will appear here, and totals update as you go."
          />
        </div>
      </Card>
    );
  }

  const mealCount = meals.length;
  const itemCount = meals.reduce((sum, meal) => sum + meal.items.length, 0);

  return (
    <Card className="space-y-4">
      <SectionHeader
        as="h2"
        icon={ClipboardList}
        title="Logged today"
        description={`${mealCount} ${mealCount === 1 ? "meal" : "meals"} · ${itemCount} ${
          itemCount === 1 ? "item" : "items"
        }`}
        action={
          <Link
            href="/app/nutrition"
            className="fw-press inline-flex min-h-11 items-center gap-1 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-black text-primary-700 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9"
          >
            Nutrition detail
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        }
      />
      <div className="space-y-3">
        {meals.map((meal) => {
          const mealCalories = meal.items.reduce(
            (sum, item) => sum + item.calories,
            0
          );
          return (
            // Nested one level inside the card — inset ring, no second shadow.
            <div
              key={meal.id}
              className="rounded-[1.35rem] bg-surface-subtle p-3 ring-1 ring-inset ring-hairline"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-700">
                      {formatMealType(meal.mealType)}
                    </p>
                    <Badge variant="neutral" size="sm">
                      <span className="tabular-nums">
                        {Math.round(mealCalories).toLocaleString()}
                      </span>{" "}
                      kcal
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-black text-ink">
                    {meal.name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => onRemoveMeal(meal.id)}
                  aria-label={`Remove ${meal.name}`}
                  className="shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                  Remove
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {meal.items.map((item) => (
                  <LoggedItem
                    key={item.id}
                    item={item}
                    onSave={(patch) => onUpdateItem(meal.id, item.id, patch)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function LoggedItem({
  item,
  onSave,
}: {
  item: MealItem;
  onSave: (patch: ItemPatch) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [values, setValues] = useState<Record<FieldKey, string>>({
    calories: String(item.calories),
    protein: String(item.protein),
    carbs: String(item.carbs),
    fat: String(item.fat),
  });

  const parsed: Record<FieldKey, number | null> = {
    calories: parseNonNegative(values.calories),
    protein: parseNonNegative(values.protein),
    carbs: parseNonNegative(values.carbs),
    fat: parseNonNegative(values.fat),
  };
  const nameValid = name.trim().length > 0;
  const numbersValid = MACRO_FIELDS.every((f) => parsed[f.key] !== null);
  const canSave = nameValid && numbersValid;

  function startEdit() {
    setName(item.name);
    setValues({
      calories: String(item.calories),
      protein: String(item.protein),
      carbs: String(item.carbs),
      fat: String(item.fat),
    });
    setEditing(true);
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      calories: parsed.calories as number,
      protein: parsed.protein as number,
      carbs: parsed.carbs as number,
      fat: parsed.fat as number,
    });
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-[1.15rem] bg-surface px-3 py-2.5 ring-1 ring-inset ring-hairline">
        <div className="min-w-0">
          <p className="truncate font-black text-ink">{item.name}</p>
          <p className="mt-0.5 text-xs font-bold text-ink-muted">
            <span className="tabular-nums">{item.calories}</span> kcal &middot;{" "}
            <span className="tabular-nums">{item.protein}</span>p &middot;{" "}
            <span className="tabular-nums">{item.carbs}</span>c &middot;{" "}
            <span className="tabular-nums">{item.fat}</span>f
          </p>
        </div>
        <button
          type="button"
          onClick={startEdit}
          aria-label={`Edit ${item.name}`}
          className="fw-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] text-ink-subtle ring-1 ring-inset ring-transparent hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:h-9 md:w-9"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 rounded-[1.15rem] bg-primary-50/60 p-3 ring-2 ring-inset ring-primary-300">
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-label="Item name"
        aria-invalid={!nameValid ? "true" : undefined}
        className={cn(
          "w-full rounded-[0.9rem] bg-surface px-3 py-2.5 text-sm font-bold text-ink ring-1 ring-inset transition focus:outline-none focus:ring-[3px] focus:ring-primary-500",
          !nameValid ? "ring-red-400" : "ring-hairline-strong"
        )}
      />
      <div className="grid grid-cols-4 gap-2">
        {MACRO_FIELDS.map((field) => (
          <div key={field.key} className="min-w-0">
            <label className="mb-1 block text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
              {field.label}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              aria-label={`${field.label} amount`}
              aria-invalid={parsed[field.key] === null ? "true" : undefined}
              value={values[field.key]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              className={cn(
                "w-full min-w-0 rounded-[0.9rem] bg-surface px-2 py-2.5 text-sm font-semibold tabular-nums text-ink ring-1 ring-inset transition focus:outline-none focus:ring-[3px] focus:ring-primary-500",
                parsed[field.key] === null ? "ring-red-400" : "ring-hairline-strong"
              )}
            />
          </div>
        ))}
      </div>
      {!canSave && (
        <p className="text-xs font-bold text-red-600" role="alert">
          {!nameValid
            ? "Add an item name."
            : "Enter a number of 0 or more in every macro field."}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          disabled={!canSave}
          onClick={handleSave}
        >
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setEditing(false)}
        >
          <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
