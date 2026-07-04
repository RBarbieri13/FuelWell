"use client";

import { useRef, useState } from "react";
import { Check, Plus, SquarePen } from "lucide-react";
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

const MACRO_FIELDS: { key: FieldKey; label: string; max: number }[] = [
  { key: "calories", label: "Calories", max: 10000 },
  { key: "protein", label: "Protein (g)", max: 1000 },
  { key: "carbs", label: "Carbs (g)", max: 1000 },
  { key: "fat", label: "Fat (g)", max: 1000 },
];

/** Returns a number within [0, max], or null when the string is not valid. */
function parseMacro(value: string, max: number): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
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
  const nameRef = useRef<HTMLInputElement>(null);
  const firstMacroRef = useRef<HTMLInputElement>(null);

  const parsed: Record<FieldKey, number | null> = {
    calories: parseMacro(values.calories, 10000),
    protein: parseMacro(values.protein, 1000),
    carbs: parseMacro(values.carbs, 1000),
    fat: parseMacro(values.fat, 1000),
  };

  const nameValid = name.trim().length > 0;
  const numbersValid = MACRO_FIELDS.every((f) => parsed[f.key] !== null);
  const overMax = MACRO_FIELDS.some(
    (f) => values[f.key].trim() !== "" && Number(values[f.key]) > f.max
  );
  const canSubmit = nameValid && numbersValid;

  function reset() {
    setName("");
    setPortionLabel("");
    setValues({ calories: "", protein: "", carbs: "", fat: "" });
    setTouched(false);
  }

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit) {
      (!nameValid ? nameRef : firstMacroRef).current?.focus();
      return;
    }
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
        className="min-h-12 w-full rounded-[1.2rem]"
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
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
            <SquarePen className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black text-[#16302a]">
              Add your own meal
            </h2>
            <p className="text-sm font-semibold text-[#78928a]">Manual macros for anything not in search.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="rounded-full px-3 py-2 text-sm font-bold text-[#78928a] hover:bg-primary-50 hover:text-primary-800"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-2">
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Meal name (e.g. Homemade chili)"
          aria-label="Meal name"
          aria-invalid={touched && !nameValid ? "true" : undefined}
          maxLength={120}
          className={cn(
            "w-full rounded-[1.15rem] border bg-white px-4 py-3 text-base font-semibold text-[#16302a] placeholder:text-[#91a7a0] focus:outline-none focus:ring-2 focus:ring-primary-500",
            touched && !nameValid ? "border-red-300" : "border-primary-100"
          )}
        />
        {touched && !nameValid && (
          <p className="text-xs font-bold text-red-600" role="alert">
            Add a meal name.
          </p>
        )}
        <input
          type="text"
          value={portionLabel}
          onChange={(event) => setPortionLabel(event.target.value)}
          placeholder="Portion label (e.g. 1 bowl) — optional"
          aria-label="Portion label (optional)"
          maxLength={60}
          className="w-full rounded-[1.15rem] border border-primary-100 bg-white px-4 py-3 text-base font-semibold text-[#16302a] placeholder:text-[#91a7a0] focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MACRO_FIELDS.map((field) => {
          const invalid = touched && parsed[field.key] === null;
          return (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-[#91a7a0]">
                {field.label}
              </label>
              <input
                ref={field.key === "calories" ? firstMacroRef : undefined}
                type="number"
                inputMode="decimal"
                min={0}
                max={field.max}
                aria-invalid={invalid ? "true" : undefined}
                value={values[field.key]}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                placeholder="0"
                className={cn(
                  "w-full rounded-[1.15rem] border bg-white px-4 py-3 text-base font-semibold text-[#16302a] placeholder:text-[#91a7a0] focus:outline-none focus:ring-2 focus:ring-primary-500",
                  invalid ? "border-red-300" : "border-primary-100"
                )}
              />
            </div>
          );
        })}
      </div>
      {touched && !numbersValid && (
        <p className="text-xs font-bold text-red-600" role="alert">
          {overMax
            ? "Values above 10,000 calories or 1,000 g per macro usually mean a typo — double-check the numbers."
            : "Enter a number of 0 or more in every macro field."}
        </p>
      )}

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
      >
        <Check className="h-4 w-4" />
        Add to {mealTypeLabel}
      </Button>
    </Card>
  );
}
