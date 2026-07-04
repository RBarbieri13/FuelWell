"use client";

import { ChevronRight, Clock } from "lucide-react";
import type { ArtifactCardProps } from "./contract";

type RecipeRow = {
  id: string;
  title: string;
  meal: string;
  minutes: number;
  perServing: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  tags: string[];
};

type RecipeListArtifact = {
  id: string;
  type: "recipe_list";
  recipes: RecipeRow[];
};

export function RecipeListCard({
  artifact,
  onAction,
}: ArtifactCardProps<RecipeListArtifact>) {
  const recipes = artifact.recipes ?? [];

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
        Recipes
      </p>
      {recipes.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          No recipes match. Try loosening the filters.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-100">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                aria-label={`View ${recipe.title} recipe`}
                onClick={() =>
                  onAction({
                    kind: "invoke_tool",
                    name: "get_recipe_detail",
                    input: { recipe_id: recipe.id },
                  })
                }
                className="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-primary-50/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-900">
                    {recipe.title}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                    <span>{recipe.meal}</span>
                    <span aria-hidden>·</span>
                    <Clock className="h-3 w-3" aria-hidden />
                    <span>{recipe.minutes} min</span>
                    <span aria-hidden>·</span>
                    <span>
                      {Math.round(recipe.perServing.calories)} kcal,{" "}
                      {Math.round(recipe.perServing.protein * 10) / 10}g protein /serving
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
