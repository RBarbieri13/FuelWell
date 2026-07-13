"use client";

import { Plus } from "lucide-react";
import type { ArtifactCardProps } from "./contract";

type Suggestion = {
  foodId: string;
  name: string;
  portion: number;
  slot: string;
  macros: { kcal: number; protein: number; carbs: number; fat: number };
  why: string;
};

type MealSuggestionsArtifact = {
  id: string;
  type: "meal_suggestions";
  suggestions: Suggestion[];
};

const grams = (n: number) => `${Math.round(n * 10) / 10}g`;

export function MealSuggestionsCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealSuggestionsArtifact>) {
  const suggestions = artifact.suggestions ?? [];

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
        Suggestions
      </p>
      {suggestions.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          No foods fit the remaining budget.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {suggestions.map((s) => (
            <li
              key={s.foodId}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3"
            >
              <div className="fw-artifact-mobile-stack flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-neutral-900">
                    {s.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-neutral-500">
                    {Math.round(s.macros.kcal)} kcal · {grams(s.macros.protein)} P ·{" "}
                    {grams(s.macros.carbs)} C · {grams(s.macros.fat)} F
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Log ${s.name} to ${s.slot}`}
                  onClick={() =>
                    onAction({
                      kind: "invoke_tool",
                      name: "log_meal",
                      input: {
                        food_id: s.foodId,
                        portion: s.portion,
                        meal_slot: s.slot,
                      },
                    })
                  }
                  className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-neutral-900 px-4 py-2 text-xs font-black text-white transition hover:bg-neutral-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Log it
                </button>
              </div>
              {s.why && (
                <p className="mt-2 text-xs font-medium leading-5 text-neutral-500">
                  {s.why}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
