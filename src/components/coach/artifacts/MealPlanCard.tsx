"use client";

import { ChevronRight } from "lucide-react";
import type { ArtifactCardProps } from "./contract";

type PlanMeal = {
  slot: string;
  recipeId: string;
  title: string;
  perServing: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
};

type PlanDay = {
  day: number;
  meals: PlanMeal[];
  dayTotals: { calories: number; protein: number; carbs: number; fat: number };
};

type MealPlanArtifact = {
  id: string;
  type: "meal_plan";
  days: PlanDay[];
  summary: string;
};

export function MealPlanCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealPlanArtifact>) {
  const days = artifact.days ?? [];

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
        Meal plan
      </p>
      {artifact.summary && (
        <p className="mt-1 text-sm font-medium leading-5 text-neutral-700">
          {artifact.summary}
        </p>
      )}

      {days.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          No plan days to show.
        </p>
      ) : (
        <div className="mt-3 max-h-96 space-y-3 overflow-y-auto">
          {days.map((day) => (
            <div key={day.day} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wide text-neutral-500">
                  Day {day.day}
                </p>
                <p className="text-[10px] font-bold text-neutral-400">
                  {Math.round(day.dayTotals.calories)} kcal ·{" "}
                  {Math.round(day.dayTotals.protein * 10) / 10}g protein
                </p>
              </div>
              <ul className="mt-1.5 divide-y divide-neutral-200/60">
                {day.meals.map((meal) => (
                  <li key={`${day.day}-${meal.slot}`}>
                    <button
                      type="button"
                      aria-label={`View recipe for day ${day.day} ${meal.slot}: ${meal.title}`}
                      onClick={() =>
                        onAction({
                          kind: "invoke_tool",
                          name: "get_recipe_detail",
                          input: { recipe_id: meal.recipeId },
                        })
                      }
                      className="flex min-h-10 w-full items-center justify-between gap-2 py-2 text-left transition hover:text-primary-700"
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="w-16 shrink-0 text-[10px] font-black uppercase tracking-wide text-neutral-400">
                          {meal.slot}
                        </span>
                        <span className="truncate text-sm font-bold text-neutral-900">
                          {meal.title}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-neutral-400">
                        {Math.round(meal.perServing.calories)} kcal
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
