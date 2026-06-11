"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { MacroTotals } from "@/lib/fuelwell-data";

export type CustomMealDraft = {
  name: string;
  portionLabel: string;
  totals: MacroTotals;
};

type FieldKey = "calories" | "protein" | "carbs" | "fat";

const MACRO_FIELDS: { key: FieldKey; label: string }[] = [
  { key: "calories", label: "Calories" },
  { key: "protein", label: "Protein (g)" },
  { key: "carbs", label: "Carbs (g)" },
  { key: "fat", label: "Fat (g)" },
];

/** Returns a non-negative number, or null when the string is not valid. */
function parseNonNegative(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/**
 * "Add your own meal" form. Captures name, portion label, and four macros,
 * validates the numbers, and hands a clean draft to onSubmit. Collapsed behind
 * a button until the user opts in so the search flow stays primary.
 */
export function CustomMealForm({
  mealTypeLabel,
  onSubmit,
}: {
  mealTypeLabel: string;
  onSubmit: (draft: CustomMealDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [portionLabel, setPortionLabel] = useState("");
  const [values, setValues] = useState<Record<FieldKey, string>>({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [touched, setTouched] = useState(false);

  const parsed: Record<FieldKey, number | null> = {
    calories: parseNonNegative(values.calories),
    protein: parseNonNegative(values.protein),
    carbs: parseNonNegative(values.carbs),
    fat: parseNonNegative(values.fat),
  };

  const nameValid = name.trim().length > 0;
  const numbersValid = MACRO_FIELDS.every((f) => parsed[f.key] !== null);
  const canSubmit = nameValid && numbersValid;

  function reset() {
    setName("");
    setPortionLabel("");
    setValues({ calories: "", protein: "", carbs: "", fat: "" });
    setTouched(false);
  }

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      portionLabel: portionLabel.trim() || "1 serving",
      totals: {
        calories: parsed.calories as number,
        protein: parsed.protein as number,
        carbs: parsed.carbs as number,
        fat: parsed.fat as number,
      },
    });
    reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add your own meal
      </Button>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-neutral-900">
          Add your own meal
        </h2>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-sm font-bold text-neutral-500 hover:text-neutral-900"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Meal name (e.g. Homemade chili)"
          className={cn(
            "w-full rounded-2xl border bg-white px-4 py-3 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500",
            touched && !nameValid ? "border-red-300" : "border-neutral-200"
          )}
        />
        {touched && !nameValid && (
          <p className="text-xs font-bold text-red-600">Add a meal name.</p>
        )}
        <input
          type="text"
          value={portionLabel}
          onChange={(event) => setPortionLabel(event.target.value)}
          placeholder="Portion label (e.g. 1 bowl) — optional"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MACRO_FIELDS.map((field) => {
          const invalid = touched && parsed[field.key] === null;
          return (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-bold uppercase text-neutral-400">
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
                placeholder="0"
                className={cn(
                  "w-full rounded-2xl border bg-white px-4 py-3 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500",
                  invalid ? "border-red-300" : "border-neutral-200"
                )}
              />
            </div>
          );
        })}
      </div>
      {touched && !numbersValid && (
        <p className="text-xs font-bold text-red-600">
          Enter a number of 0 or more in every macro field.
        </p>
      )}

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={touched && !canSubmit}
        onClick={handleSubmit}
      >
        <Check className="h-4 w-4" />
        Add to {mealTypeLabel}
      </Button>
    </Card>
  );
}
