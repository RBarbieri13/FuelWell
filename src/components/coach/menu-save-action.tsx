"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMealType, type MealType } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const fieldClass =
  "mt-1 min-h-11 w-full rounded-[0.9rem] bg-surface px-3 py-2 text-sm font-black tabular-nums text-ink ring-1 ring-inset ring-primary-100 transition-shadow duration-200 ease-out-soft hover:ring-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500";

const labelClass =
  "text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-800/70";

export type MenuSaveOption = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: string;
  sourceNote: string;
};

export function MenuSaveAction({ option }: { option: MenuSaveOption }) {
  const { addMeal } = useDayLog();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [calories, setCalories] = useState(option.calories);
  const [protein, setProtein] = useState(option.protein);
  const [carbs, setCarbs] = useState(option.carbs);
  const [fat, setFat] = useState(option.fat);

  if (saved) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-[1rem] bg-primary-50 px-3 py-3 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-200">
        <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
        Saved to today&apos;s {formatMealType(mealType).toLowerCase()}.
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="tonal"
        className="mt-4 w-full rounded-full"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Review and save
      </Button>
    );
  }

  return (
    // Inset editor: the parent card already owns the elevation, so this panel
    // stays a tinted well with a hairline ring instead of a second shadow.
    <div className="mt-4 rounded-[1.15rem] bg-primary-50/65 p-3 ring-1 ring-inset ring-primary-100">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Meal</span>
          <select
            value={mealType}
            onChange={(event) => setMealType(event.target.value as MealType)}
            className={fieldClass}
          >
            {mealTypes.map((type) => (
              <option key={type} value={type}>
                {formatMealType(type)}
              </option>
            ))}
          </select>
        </label>
        <NumberField label="Cal" value={calories} onChange={setCalories} />
        <NumberField label="Pro" value={protein} onChange={setProtein} />
        <NumberField label="Carb" value={carbs} onChange={setCarbs} />
        <NumberField label="Fat" value={fat} onChange={setFat} />
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-primary-900/70">
        {option.confidence} · {option.sourceNote}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          onClick={() => {
            addMeal({
              mealType,
              name: option.name,
              items: [
                {
                  name: option.name,
                  servings: 1,
                  calories: Math.max(0, calories),
                  protein: Math.max(0, protein),
                  carbs: Math.max(0, carbs),
                  fat: Math.max(0, fat),
                },
              ],
            });
            setSaved(true);
          }}
        >
          <Save className="h-4 w-4" strokeWidth={2} />
          Save meal
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={fieldClass}
      />
    </label>
  );
}
