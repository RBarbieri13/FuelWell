"use client";

import { Clock, Flame, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PreferenceToggle } from "@/components/food/preference-toggle";
import type { Recipe } from "@/lib/recipes-data";

/**
 * Recipe summary card: title, meal, time, per-serving calories + protein,
 * tags, and a like/dislike toggle. Clicking the body opens the detail view.
 */
export function RecipeCard({
  recipe,
  onOpen,
}: {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpen(recipe)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600">
              {recipe.meal}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.minutes} min
            </span>
          </div>
          <h2 className="mt-3 text-base font-semibold leading-snug text-neutral-900">
            {recipe.title}
          </h2>
        </button>
        <PreferenceToggle id={recipe.id} size="sm" />
      </div>

      <button
        type="button"
        onClick={() => onOpen(recipe)}
        className="grid grid-cols-2 gap-2 text-left"
      >
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2">
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
            <Flame className="h-3.5 w-3.5 text-primary-500" />
            Calories
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900">
            {recipe.perServing.calories}
            <span className="ml-1 text-xs font-normal text-neutral-400">
              / serving
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2">
          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
            <Dumbbell className="h-3.5 w-3.5 text-sky-500" />
            Protein
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900">
            {recipe.perServing.protein}g
            <span className="ml-1 text-xs font-normal text-neutral-400">
              / serving
            </span>
          </p>
        </div>
      </button>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
