"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { macrosForPortion, type FoodItem } from "@/lib/food-database";
import type { MacroTotals } from "@/lib/fuelwell-data";

/** macrosForPortion returns kcal; map kcal -> calories for the meal log. */
function portionTotals(food: FoodItem, amount: number): MacroTotals {
  const m = macrosForPortion(food, amount);
  return { calories: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat };
}

/**
 * One-tap portion buttons from the food's commonServings, plus a custom
 * gram/ml amount. Calling onAdd hands back the chosen amount, its label, and
 * the calorie/macro totals (kcal already mapped to calories).
 */
export function PortionPicker({
  food,
  mealTypeLabel,
  onAdd,
}: {
  food: FoodItem;
  mealTypeLabel: string;
  onAdd: (input: {
    amount: number;
    label: string;
    totals: MacroTotals;
  }) => void;
}) {
  const [customAmount, setCustomAmount] = useState("");
  const unit = food.servingUnit;
  const parsedCustom = Number(customAmount);
  const customValid = customAmount.trim() !== "" && parsedCustom > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-neutral-50 p-4">
        <p className="font-black text-neutral-900">{food.name}</p>
        <p className="text-sm font-medium text-neutral-500">
          {food.categoryLabel} &middot; per 100{unit}: {food.per100.kcal} cal,{" "}
          {food.per100.protein}g protein
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-neutral-400">
          One-tap portions
        </p>
        <div className="grid gap-2">
          {food.commonServings.map((serving) => {
            const totals = portionTotals(food, serving.amount);
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
                className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 text-left transition hover:border-primary-300 hover:bg-primary-50/50"
              >
                <div>
                  <p className="font-black text-neutral-900">
                    {serving.label}
                  </p>
                  <p className="text-xs font-bold text-neutral-400">
                    {totals.protein}g protein &middot; {totals.carbs}g carbs
                    &middot; {totals.fat}g fat
                  </p>
                </div>
                <p className="font-black tabular-nums text-neutral-900">
                  {totals.calories} cal
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-neutral-400">
          Custom amount ({unit})
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder={`Amount in ${unit}`}
            className={cn(
              "w-full rounded-2xl border bg-white px-4 py-3 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500",
              customAmount.trim() !== "" && !customValid
                ? "border-red-300"
                : "border-neutral-200"
            )}
          />
          <Button
            type="button"
            size="md"
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
            <Check className="h-4 w-4" />
            Add to {mealTypeLabel}
          </Button>
        </div>
        {customAmount.trim() !== "" && !customValid && (
          <p className="mt-1 text-xs font-bold text-red-600">
            Enter an amount greater than 0.
          </p>
        )}
      </div>
    </div>
  );
}
