"use client";

import { useState } from "react";
import { Check, Plus, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { macrosForPortion, type FoodItem } from "@/lib/food-database";
import type { MacroTotals } from "@/lib/fuelwell-data";

/** macrosForPortion returns kcal; map kcal -> calories for the meal log. */
function portionTotals(food: FoodItem, amount: number): MacroTotals {
  const m = macrosForPortion(food, amount);
  return { calories: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat };
}

/** Shared macro colour roles so a dot means the same thing here as in totals. */
const MACRO_DOTS: { key: keyof MacroTotals; short: string; color: string }[] = [
  { key: "protein", short: "protein", color: "var(--color-macro-protein)" },
  { key: "carbs", short: "carbs", color: "var(--color-macro-carbs)" },
  { key: "fat", short: "fat", color: "var(--color-macro-fat)" },
];

/**
 * One-tap portion buttons from the food's commonServings, plus a custom
 * gram/ml amount. Calling onAdd hands back the chosen amount, its label, and
 * the calorie/macro totals (kcal already mapped to calories).
 */
export function PortionPicker({
  food,
  onAdd,
}: {
  food: FoodItem;
  onAdd: (input: {
    amount: number;
    label: string;
    totals: MacroTotals;
  }) => void;
}) {
  const [customAmount, setCustomAmount] = useState("");
  const unit = food.servingUnit;
  const parsedCustom = Number(customAmount);
  const MAX_AMOUNT = 5000;
  const customTooBig =
    customAmount.trim() !== "" && Number.isFinite(parsedCustom) && parsedCustom > MAX_AMOUNT;
  const customValid =
    customAmount.trim() !== "" && parsedCustom > 0 && parsedCustom <= MAX_AMOUNT;
  const largestPortionCalories = food.commonServings.reduce(
    (max, serving) => Math.max(max, portionTotals(food, serving.amount).calories),
    0
  );

  return (
    <div className="space-y-4">
      {/* Sits inside the elevated "Add to plate" card, so it is a sunken well
          rather than a second raised surface. */}
      <div className="rounded-[1.25rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Scale className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-black text-ink">{food.name}</p>
            <p className="mt-0.5 text-sm font-semibold text-ink-muted">
              {food.categoryLabel} &middot; per 100{unit}:{" "}
              <span className="tabular-nums">{food.per100.kcal}</span> kcal,{" "}
              <span className="tabular-nums">{food.per100.protein}</span>g protein
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-ink-subtle">
          One-tap portions — tapping logs instantly
        </p>
        <div className="grid gap-2">
          {food.commonServings.map((serving) => {
            const totals = portionTotals(food, serving.amount);
            // Relative bar across the offered portions only. It is a comparison
            // of these three real values against each other — not a percentage
            // of any target — so the axis note below says exactly that.
            const share =
              largestPortionCalories > 0
                ? Math.max(6, (totals.calories / largestPortionCalories) * 100)
                : 0;
            return (
              <button
                key={serving.label}
                type="button"
                onClick={() =>
                  onAdd({
                    amount: serving.amount,
                    label: serving.label,
                    totals,
                  })
                }
                aria-label={`Log ${serving.label}: ${totals.calories.toLocaleString()} kcal, ${totals.protein}g protein, ${totals.carbs}g carbs, ${totals.fat}g fat`}
                className="fw-press min-h-[3.75rem] rounded-[1.15rem] bg-surface p-4 text-left ring-1 ring-inset ring-hairline hover:-translate-y-0.5 hover:bg-primary-50/60 hover:shadow-e2 hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                  <span className="min-w-0">
                    <span className="block font-black text-ink">{serving.label}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-ink-muted">
                      {MACRO_DOTS.map((macro) => (
                        <span
                          key={macro.key}
                          className="inline-flex items-center gap-1.5"
                        >
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: macro.color }}
                          />
                          <span className="tabular-nums">{totals[macro.key]}</span>g{" "}
                          {macro.short}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    <span className="text-right font-black tabular-nums text-ink">
                      {totals.calories.toLocaleString()}
                      <span className="ml-1 text-xs font-bold text-ink-muted">
                        kcal
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </span>
                </span>
                {/* Size-comparison rail. Three portion buttons with only numbers
                    make the reader do the arithmetic; the bar does it for them. */}
                <span
                  aria-hidden="true"
                  className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                >
                  <span
                    className="block h-full rounded-full transition-[width] duration-500 ease-out-soft"
                    style={{
                      width: `${share}%`,
                      backgroundColor: "var(--color-macro-calories)",
                      opacity: 0.85,
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 px-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
          Bars compare these portions to each other, not to your daily target
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-ink-subtle">
          Custom amount ({unit})
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={MAX_AMOUNT}
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder={`Amount in ${unit}`}
            aria-label={`Custom amount in ${unit}`}
            aria-invalid={customAmount.trim() !== "" && !customValid ? "true" : undefined}
            className={cn(
              "min-h-12 w-full min-w-0 rounded-[1.15rem] bg-surface px-4 py-3 text-base font-semibold tabular-nums text-ink ring-1 ring-inset transition placeholder:text-ink-faint placeholder:font-semibold focus:outline-none focus:ring-[3px] focus:ring-primary-500",
              customAmount.trim() !== "" && !customValid
                ? "ring-red-400"
                : "ring-hairline-strong"
            )}
          />
          <Button
            type="button"
            size="md"
            className="shrink-0 sm:w-auto"
            disabled={!customValid}
            onClick={() => {
              if (!customValid) return;
              const totals = portionTotals(food, parsedCustom);
              onAdd({
                amount: parsedCustom,
                label: `${parsedCustom} ${unit}`,
                totals,
              });
            }}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Log custom amount
          </Button>
        </div>
        {customAmount.trim() !== "" && !customValid && (
          <p className="mt-1.5 text-xs font-bold leading-5 text-red-600" role="alert">
            {customTooBig
              ? `Amounts above ${MAX_AMOUNT.toLocaleString()} ${unit} usually mean a typo — double-check the number.`
              : "Enter an amount greater than 0."}
          </p>
        )}
      </div>
    </div>
  );
}
