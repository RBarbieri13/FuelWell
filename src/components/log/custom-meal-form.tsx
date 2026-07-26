"use client";

import { useRef, useState } from "react";
import { Check, Plus, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import type { MacroTotals } from "@/lib/fuelwell-data";

export type CustomMealDraft = {
  name: string;
  portionLabel: string;
  totals: MacroTotals;
};

type FieldKey = "calories" | "protein" | "carbs" | "fat";

const MACRO_FIELDS: { key: FieldKey; label: string; max: number; accent: string }[] = [
  { key: "calories", label: "Calories", max: 10000, accent: "var(--color-macro-calories)" },
  { key: "protein", label: "Protein (g)", max: 1000, accent: "var(--color-macro-protein)" },
  { key: "carbs", label: "Carbs (g)", max: 1000, accent: "var(--color-macro-carbs)" },
  { key: "fat", label: "Fat (g)", max: 1000, accent: "var(--color-macro-fat)" },
];

/** Shared input chrome so every field in the form has the same focus ring. */
const FIELD_BASE =
  "w-full min-w-0 rounded-[1.15rem] bg-surface px-4 py-3 text-base font-semibold text-ink ring-1 ring-inset transition duration-200 ease-out-soft placeholder:font-semibold placeholder:text-ink-faint focus:outline-none focus:ring-[3px] focus:ring-primary-500";

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
        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Add your own meal
      </Button>
    );
  }

  return (
    <Card className="space-y-4">
      <SectionHeader
        as="h2"
        icon={SquarePen}
        title="Add your own meal"
        description="Manual macros for anything not in search."
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
        }
      />

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
          autoFocus
          className={cn(
            FIELD_BASE,
            touched && !nameValid ? "ring-red-400" : "ring-hairline-strong"
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
          className={cn(FIELD_BASE, "ring-hairline-strong")}
        />
      </div>

      {/* Macros live in their own sunken well so the form reads as two steps —
          what the meal is, then what is in it — rather than six equal fields. */}
      <div className="rounded-[1.35rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline">
        <p className="mb-2 px-1 text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
          Macros — all four required
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MACRO_FIELDS.map((field) => {
            const invalid = touched && parsed[field.key] === null;
            return (
              <div key={field.key} className="min-w-0">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: field.accent }}
                  />
                  <span className="min-w-0 truncate">{field.label}</span>
                </label>
                <input
                  ref={field.key === "calories" ? firstMacroRef : undefined}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={field.max}
                  aria-label={field.label}
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
                    FIELD_BASE,
                    "tabular-nums",
                    invalid ? "ring-red-400" : "ring-hairline-strong"
                  )}
                />
              </div>
            );
          })}
        </div>
        {touched && !numbersValid && (
          <p className="mt-2 px-1 text-xs font-bold leading-5 text-red-600" role="alert">
            {overMax
              ? "Values above 10,000 calories or 1,000 g per macro usually mean a typo — double-check the numbers."
              : "Enter a number of 0 or more in every macro field."}
          </p>
        )}
      </div>

      <Button type="button" size="lg" className="w-full" onClick={handleSubmit}>
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Add to {mealTypeLabel}
      </Button>
    </Card>
  );
}
