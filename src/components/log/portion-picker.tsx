"use client";

import { useState } from "react";
import { Check, Scale } from "lucide-react";
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
  const MAX_AMOUNT = 5000;
  const customTooBig =
    customAmount.trim() !== "" && Number.isFinite(parsedCustom) && parsedCustom > MAX_AMOUNT;
  const customValid =
    customAmount.trim() !== "" && parsedCustom > 0 && parsedCustom <= MAX_AMOUNT;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.25rem] border border-primary-100/70 bg-primary-50/65 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-sm">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <p className="font-black text-[#16302a]">{food.name}</p>
            <p className="text-sm font-semibold text-[#78928a]">
          {food.categoryLabel} &middot; per 100{unit}: {food.per100.kcal} cal,{" "}
          {food.per100.protein}g protein
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#91a7a0]">
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
                className="flex items-center justify-between rounded-[1.15rem] border border-primary-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md hover:shadow-primary-900/10"
              >
                <div>
                  <p className="font-black text-[#16302a]">
                    {serving.label}
                  </p>
                  <p className="text-xs font-bold text-[#78928a]">
                    {totals.protein}g protein &middot; {totals.carbs}g carbs
                    &middot; {totals.fat}g fat
                  </p>
                </div>
                <p className="font-black tabular-nums text-[#16302a]">
                  {totals.calories} cal
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-[#91a7a0]">
          Custom amount ({unit})
        </p>
        <div className="flex items-center gap-2">
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
              "w-full rounded-[1.15rem] border bg-white px-4 py-3 text-base font-semibold text-[#16302a] placeholder:text-[#91a7a0] focus:outline-none focus:ring-2 focus:ring-primary-500",
              customAmount.trim() !== "" && !customValid
                ? "border-red-300"
                : "border-primary-100"
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
          <p className="mt-1 text-xs font-bold text-red-600" role="alert">
            {customTooBig
              ? `Amounts above ${MAX_AMOUNT.toLocaleString()} ${unit} usually mean a typo — double-check the number.`
              : "Enter an amount greater than 0."}
          </p>
        )}
      </div>
    </div>
  );
}
