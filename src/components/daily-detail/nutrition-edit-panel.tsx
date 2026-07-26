"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Pencil, Plus, Save, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import { formatMealType, type MealType } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

/** One field recipe for every control in this panel — sunken well, hairline
 *  ring, one focus treatment. They used to drift on background and focus. */
const FIELD_CLASS =
  "w-full min-w-0 rounded-2xl bg-surface-muted px-4 py-3 text-sm font-bold text-ink ring-1 ring-inset ring-hairline-strong outline-none transition-shadow duration-200 ease-out-soft placeholder:font-semibold placeholder:text-ink-faint focus-visible:ring-[3px] focus-visible:ring-primary-600";

const FIELD_LABEL_CLASS =
  "mb-1.5 block text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle";

/** Small pill button shared by the row-level actions below. */
const ROW_ACTION_CLASS =
  "fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface px-3.5 py-2 text-xs font-black shadow-e1 ring-1 ring-inset ring-hairline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0";

/** Returns a number within [0, max], or null when the string is not valid. */
function parseMacro(value: string, max: number): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}

export function NutritionEditPanel() {
  const { meals, addMeal, duplicateMeal, updateMealItem, removeMeal } = useDayLog();
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [mealName, setMealName] = useState("");
  const [itemName, setItemName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [showLoggedItems, setShowLoggedItems] = useState(false);
  const [editingItem, setEditingItem] = useState<{ mealId: string; itemId: string } | null>(null);
  const [editValues, setEditValues] = useState({ calories: "", protein: "", carbs: "", fat: "" });

  const parsedCalories = parseMacro(calories, 10000);
  const canSubmit = itemName.trim().length > 0 || parsedCalories !== null;

  function addQuickMeal() {
    if (!canSubmit) return;
    const name = mealName.trim() || `${formatMealType(mealType)} entry`;
    const item = itemName.trim() || name;
    addMeal({
      mealType,
      name,
      items: [
        {
          name: item,
          servings: 1,
          calories: parsedCalories ?? 0,
          protein: parseMacro(protein, 1000) ?? 0,
          carbs: parseMacro(carbs, 1000) ?? 0,
          fat: parseMacro(fat, 1000) ?? 0,
        },
      ],
    });
    setMealName("");
    setItemName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  }

  return (
    <Card padding="none" className="min-w-0 space-y-5 rounded-[1.5rem] px-5 py-5 md:px-6 md:py-6">
      <SectionHeader
        as="h2"
        icon={UtensilsCrossed}
        title="Add or edit meals"
        description="Correct the daily score here, or jump to the full meal logger for barcode and guided entry."
        action={
          <Link
            href="/app/log"
            className="fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0"
          >
            Log meal page
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[0.8fr_1fr_repeat(4,0.52fr)_auto] xl:items-end">
        <label className="block min-w-0">
          <span className={FIELD_LABEL_CLASS}>Meal</span>
          <select
            value={mealType}
            onChange={(event) => setMealType(event.target.value as MealType)}
            className={FIELD_CLASS}
            aria-label="Meal type"
          >
            {mealTypes.map((type) => (
              <option key={type} value={type}>
                {formatMealType(type)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={FIELD_LABEL_CLASS}>Food</span>
          <input
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Food or meal name"
            className={FIELD_CLASS}
          />
        </label>
        <MacroInput label="Calories" value={calories} onChange={setCalories} />
        <MacroInput label="Protein g" value={protein} onChange={setProtein} />
        <MacroInput label="Carbs g" value={carbs} onChange={setCarbs} />
        <MacroInput label="Fat g" value={fat} onChange={setFat} />
        <Button type="button" onClick={addQuickMeal} disabled={!canSubmit} className="rounded-2xl">
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Add
        </Button>
      </div>

      {/* Says why Add is unavailable instead of leaving a dead disabled button. */}
      <p
        className={cn(
          "text-xs font-semibold leading-5",
          canSubmit ? "text-primary-700" : "text-ink-subtle"
        )}
        aria-live="polite"
      >
        {canSubmit
          ? "Ready to add — this entry counts toward today's totals immediately."
          : "Add a food name or a calorie figure to enable Add."}
      </p>

      {meals.length > 0 && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            aria-expanded={showLoggedItems}
            onClick={() => setShowLoggedItems((open) => !open)}
            className="min-h-12 w-full rounded-[1.2rem]"
          >
            <Pencil className="h-4 w-4" />
            {showLoggedItems ? "Hide logged items" : "Edit logged items"}
          </Button>
          {showLoggedItems && (
            // Inset well inside an already-raised card: sunken surface, one
            // hairline, no second drop shadow.
            <div className="min-w-0 divide-y divide-hairline rounded-[1.25rem] bg-surface-subtle px-4 ring-1 ring-inset ring-hairline">
              {meals.map((meal) => (
                <div key={meal.id} className="py-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-black text-ink">{formatMealType(meal.mealType)}</p>
                      <p className="break-words text-sm font-semibold text-ink-muted">{meal.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => duplicateMeal(meal.id)}
                        className={cn(ROW_ACTION_CLASS, "text-primary-700 hover:bg-primary-50")}
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMeal(meal.id)}
                        className={cn(ROW_ACTION_CLASS, "text-accent-700 hover:bg-accent-50")}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                        Delete meal
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {meal.items.map((item) => {
                      const isEditing =
                        editingItem?.mealId === meal.id && editingItem.itemId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "grid min-w-0 gap-2 rounded-[1rem] bg-surface px-4 py-3 ring-1 ring-inset lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
                            isEditing ? "ring-primary-300" : "ring-hairline"
                          )}
                        >
                          <div className="min-w-0">
                            <p className="break-words text-sm font-black text-ink">{item.name}</p>
                            <p className="text-xs font-semibold tabular-nums text-ink-muted">
                              {item.calories} kcal · {item.protein}g protein · {item.carbs}g carbs · {item.fat}g fat
                            </p>
                          </div>
                          {isEditing ? (
                            <div className="grid gap-2 sm:grid-cols-[5rem_5rem_5rem_5rem_auto]">
                              <MacroInput label="Calories" value={editValues.calories} onChange={(value) => setEditValues((current) => ({ ...current, calories: value }))} compact />
                              <MacroInput label="Protein g" value={editValues.protein} onChange={(value) => setEditValues((current) => ({ ...current, protein: value }))} compact />
                              <MacroInput label="Carbs g" value={editValues.carbs} onChange={(value) => setEditValues((current) => ({ ...current, carbs: value }))} compact />
                              <MacroInput label="Fat g" value={editValues.fat} onChange={(value) => setEditValues((current) => ({ ...current, fat: value }))} compact />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  updateMealItem(meal.id, item.id, {
                                    calories: parseMacro(editValues.calories, 10000) ?? 0,
                                    protein: parseMacro(editValues.protein, 1000) ?? 0,
                                    carbs: parseMacro(editValues.carbs, 1000) ?? 0,
                                    fat: parseMacro(editValues.fat, 1000) ?? 0,
                                  });
                                  setEditingItem(null);
                                }}
                                className="rounded-full"
                              >
                                <Save className="h-4 w-4" strokeWidth={2.25} />
                                Save
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem({ mealId: meal.id, itemId: item.id });
                                setEditValues({
                                  calories: String(item.calories),
                                  protein: String(item.protein),
                                  carbs: String(item.carbs),
                                  fat: String(item.fat),
                                });
                              }}
                              aria-label={`Edit ${item.name}`}
                              className="fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-700 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0"
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
                              Edit item
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function MacroInput({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span
        className={cn(
          "mb-1 block font-black uppercase tracking-[0.12em] text-ink-subtle",
          compact ? "text-[9px]" : "text-[11px]"
        )}
      >
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        // Numbers are edited in place and compared column-to-column, so the
        // field itself is tabular — digits stop shifting as you type.
        className={cn(
          FIELD_CLASS,
          "px-3 tabular-nums",
          compact ? "py-2 text-xs" : "py-3"
        )}
        aria-label={label}
      />
    </label>
  );
}
