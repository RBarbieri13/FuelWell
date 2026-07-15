"use client";

import { ArrowRight, ChefHat, Clock, Dumbbell, Flame, Wheat, Droplet } from "lucide-react";
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
  const macroTiles = [
    {
      label: "kcal",
      value: recipe.perServing.calories,
      className: "bg-primary-50 text-primary-700 border-primary-100",
      icon: Flame,
    },
    {
      label: "Pro",
      value: `${recipe.perServing.protein}g`,
      className: "bg-sky-50 text-sky-700 border-sky-100",
      icon: Dumbbell,
    },
    {
      label: "Carb",
      value: `${recipe.perServing.carbs}g`,
      className: "bg-lemon-50 text-lemon-700 border-lemon-100",
      icon: Wheat,
    },
    {
      label: "Fat",
      value: `${recipe.perServing.fat}g`,
      className: "bg-accent-50 text-accent-700 border-accent-100",
      icon: Droplet,
    },
  ];

  return (
    <Card className="group flex min-h-full flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_22px_60px_rgba(22,48,42,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpen(recipe)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-black text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-primary-800">
              <ChefHat className="h-3.5 w-3.5" />
              {recipe.meal}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f7f5] px-2.5 py-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.minutes} min
            </span>
          </div>
          <h2 className="mt-3 text-xl font-black leading-snug text-[#16302a]">
            {recipe.title}
          </h2>
        </button>
        <PreferenceToggle id={recipe.id} size="sm" />
      </div>

      <button
        type="button"
        onClick={() => onOpen(recipe)}
        className="grid grid-cols-2 gap-2 text-left sm:grid-cols-4"
      >
        {macroTiles.map((macro) => {
          const Icon = macro.icon;
          return (
            <div
              key={macro.label}
              className={`rounded-[1rem] border px-3 py-3 ${macro.className}`}
            >
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em]">
                <Icon className="h-3.5 w-3.5" />
                {macro.label}
              </div>
              <p className="mt-1 text-lg font-black tabular-nums text-[#16302a]">
                {macro.value}
              </p>
            </div>
          );
        })}
      </button>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#f2f7f5] px-2.5 py-1 text-xs font-bold text-[#60776f]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpen(recipe)}
        className="mt-auto inline-flex min-h-11 items-center justify-between rounded-[1.1rem] bg-[#f7faf8] px-4 py-3 text-sm font-black text-primary-800 transition group-hover:bg-primary-50"
      >
        Open recipe
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </button>
    </Card>
  );
}
