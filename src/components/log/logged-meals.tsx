"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatMealType, type MealItem, type MealRecord } from "@/lib/fuelwell-data";

type ItemPatch = Partial<Omit<MealItem, "id">>;

type FieldKey = "calories" | "protein" | "carbs" | "fat";

const MACRO_FIELDS: { key: FieldKey; label: string }[] = [
  { key: "calories", label: "Cal" },
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
      <Card className="space-y-2">
        <h2 className="text-lg font-black text-neutral-900">Logged today</h2>
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
          <p className="font-bold text-neutral-900">Nothing logged yet.</p>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            Add a food from search or your own meal. It will appear here, and
            totals update as you go.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-black text-neutral-900">Logged today</h2>
      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
                {formatMealType(meal.mealType)} &middot; {meal.name}
              </p>
              <button
                type="button"
                onClick={() => onRemoveMeal(meal.id)}
                aria-label={`Remove ${meal.name}`}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
            <div className="space-y-2">
              {meal.items.map((item) => (
                <LoggedItem
                  key={item.id}
                  item={item}
                  onSave={(patch) => onUpdateItem(meal.id, item.id, patch)}
                />
              ))}
            </div>
          </div>
        ))}
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
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3">
        <div className="min-w-0">
          <p className="truncate font-black text-neutral-900">{item.name}</p>
          <p className="text-xs font-bold text-neutral-400">
            {item.calories} cal &middot; {item.protein}p &middot; {item.carbs}c
            &middot; {item.fat}f
          </p>
        </div>
        <button
          type="button"
          onClick={startEdit}
          aria-label={`Edit ${item.name}`}
          className="rounded-lg p-2 text-neutral-400 transition hover:bg-white hover:text-primary-600"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-primary-200 bg-primary-50/40 p-3">
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className={cn(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500",
          !nameValid ? "border-red-300" : "border-neutral-200"
        )}
      />
      <div className="grid grid-cols-4 gap-2">
        {MACRO_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-[10px] font-bold uppercase text-neutral-400">
              {field.label}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={values[field.key]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              className={cn(
                "w-full rounded-xl border bg-white px-2 py-2 text-sm font-medium tabular-nums text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500",
                parsed[field.key] === null
                  ? "border-red-300"
                  : "border-neutral-200"
              )}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          disabled={!canSave}
          onClick={handleSave}
        >
          <Check className="h-4 w-4" />
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setEditing(false)}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
