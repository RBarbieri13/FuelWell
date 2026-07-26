"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Info, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatMealType, type MealType } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const fieldClass =
  "mt-1 min-h-11 w-full rounded-[0.9rem] bg-surface px-3 py-2 text-sm font-black tabular-nums text-ink ring-1 ring-inset ring-primary-100 transition-shadow duration-200 ease-out-soft hover:ring-primary-200 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600";

const labelClass =
  "text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-800";

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
      <div
        role="status"
        className="mt-4 flex items-center gap-2 rounded-[1rem] bg-primary-50 px-3 py-3 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-200 duration-300 ease-out-soft animate-in fade-in zoom-in-95"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" strokeWidth={2} />
        <span className="min-w-0">
          Saved to today&apos;s {formatMealType(mealType).toLowerCase()}.
        </span>
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
    <div className="mt-4 rounded-[1.15rem] bg-primary-50/65 p-3 ring-1 ring-inset ring-primary-100 duration-300 ease-out-soft animate-in fade-in slide-in-from-top-1">
      {/* Two columns from the smallest width up: four single-token numeric
          fields stacked in one column made the editor twice as tall as the
          card it sits in, and each cell still clears 44px at 320px. */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block col-span-2">
          <span className={labelClass}>Meal</span>
          {/* Native select chrome differs per platform and broke the field
              rhythm; the control is flattened and given the app's own chevron. */}
          <span className="relative block">
            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
              className={cn(fieldClass, "appearance-none pr-10")}
            >
              {mealTypes.map((type) => (
                <option key={type} value={type}>
                  {formatMealType(type)}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
              strokeWidth={2}
            />
          </span>
        </label>
        <NumberField label="Cal" unit="kcal" value={calories} onChange={setCalories} />
        <NumberField label="Pro" unit="g" value={protein} onChange={setProtein} />
        <NumberField label="Carb" unit="g" value={carbs} onChange={setCarbs} />
        <NumberField label="Fat" unit="g" value={fat} onChange={setFat} />
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-primary-900">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" strokeWidth={2} />
        <span className="min-w-0">
          {option.confidence} · {option.sourceNote}
        </span>
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
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          // Spinner arrows sit on top of the unit and are useless for a
          // three-digit macro edit, so the field keeps the text-input shape.
          className={cn(
            fieldClass,
            "pr-11 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          )}
        />
        {/* The unit is stated once, next to the figure, instead of being
            implied by an abbreviated label. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.6875rem] font-bold text-ink-subtle"
        >
          {unit}
        </span>
      </span>
    </label>
  );
}
