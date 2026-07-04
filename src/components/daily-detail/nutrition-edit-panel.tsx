"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Pencil, Plus, Save, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMealType, type MealType } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function NutritionEditPanel() {
  const { meals, addMeal, duplicateMeal, updateMealItem, removeMeal } = useDayLog();
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [mealName, setMealName] = useState("");
  const [itemName, setItemName] = useState("");
  const [calories, setCalories] = useState(420);
  const [protein, setProtein] = useState(30);
  const [carbs, setCarbs] = useState(40);
  const [fat, setFat] = useState(12);
  const [editingItem, setEditingItem] = useState<{ mealId: string; itemId: string } | null>(null);
  const [editValues, setEditValues] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  function addQuickMeal() {
    const name = mealName.trim() || `${formatMealType(mealType)} entry`;
    const item = itemName.trim() || name;
    addMeal({
      mealType,
      name,
      items: [
        {
          name: item,
          servings: 1,
          calories: Math.max(0, calories),
          protein: Math.max(0, protein),
          carbs: Math.max(0, carbs),
          fat: Math.max(0, fat),
        },
      ],
    });
    setMealName("");
    setItemName("");
  }

  return (
    <Card className="space-y-5 rounded-[1.5rem] border-primary-100 bg-white px-6 py-6 shadow-[0_16px_36px_rgba(20,90,75,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-black text-[#16302a]">
              Add or edit meals
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">
              Correct the daily score here, or jump to the full meal logger for barcode and guided entry.
            </p>
          </div>
        </div>
        <Link
          href="/app/log"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 transition hover:bg-primary-100"
        >
          Log meal page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 xl:grid-cols-[0.8fr_1fr_repeat(4,0.52fr)_auto] xl:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.12em] text-[#7c968f]">
            Meal
          </span>
          <select
            value={mealType}
            onChange={(event) => setMealType(event.target.value as MealType)}
            className="w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
            aria-label="Meal type"
          >
            {mealTypes.map((type) => (
              <option key={type} value={type}>
                {formatMealType(type)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.12em] text-[#7c968f]">
            Food
          </span>
          <input
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Food or meal name"
            className="w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa] focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
          />
        </label>
        <MacroInput label="Calories" value={calories} onChange={setCalories} />
        <MacroInput label="Protein g" value={protein} onChange={setProtein} />
        <MacroInput label="Carbs g" value={carbs} onChange={setCarbs} />
        <MacroInput label="Fat g" value={fat} onChange={setFat} />
        <Button type="button" onClick={addQuickMeal} className="rounded-2xl">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="divide-y divide-primary-100/70 rounded-[1.25rem] border border-primary-100 bg-[#f8fbf9] px-4">
        {meals.map((meal) => (
          <div key={meal.id} className="py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-black text-[#16302a]">{formatMealType(meal.mealType)}</p>
                <p className="text-sm font-semibold text-[#7c968f]">{meal.name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => duplicateMeal(meal.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => removeMeal(meal.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-accent-600 transition hover:bg-accent-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete meal
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              {meal.items.map((item) => {
                const isEditing =
                  editingItem?.mealId === meal.id && editingItem.itemId === item.id;
                return (
                  <div key={item.id} className="grid gap-2 rounded-[1rem] bg-white px-4 py-3 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <p className="text-sm font-black text-[#16302a]">{item.name}</p>
                      <p className="text-xs font-semibold text-[#9db0aa]">
                        {item.calories} cal · {item.protein}g protein · {item.carbs}g carbs · {item.fat}g fat
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
                            updateMealItem(meal.id, item.id, editValues);
                            setEditingItem(null);
                          }}
                          className="rounded-full"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem({ mealId: meal.id, itemId: item.id });
                          setEditValues({
                            calories: item.calories,
                            protein: item.protein,
                            carbs: item.carbs,
                            fat: item.fat,
                          });
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
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
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={`mb-1 block font-black uppercase tracking-[0.12em] text-[#7c968f] ${
          compact ? "text-[9px]" : "text-[11px]"
        }`}
      >
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        placeholder={label}
        className={`w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-3 py-3 text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa] focus:border-primary-300 focus:ring-2 focus:ring-primary-200 ${
          compact ? "py-2 text-xs" : ""
        }`}
        aria-label={label}
      />
    </label>
  );
}
