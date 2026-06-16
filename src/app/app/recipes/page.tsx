"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DietFilterChips } from "@/components/food/diet-filter-chips";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import {
  searchRecipes,
  applyRecipeFilters,
  type Recipe,
} from "@/lib/recipes-data";
import { usePreferences, rankByPreference } from "@/lib/use-preferences";

export default function RecipesPage() {
  const [query, setQuery] = useState("");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const { diets, allergies, likes, dislikes, toggleDiet } = usePreferences();

  const results = useMemo(() => {
    const searched = searchRecipes(query);
    const filtered = applyRecipeFilters(searched, diets, allergies);
    return rankByPreference(filtered, (r) => r.id, { likes, dislikes });
  }, [query, diets, allergies, likes, dislikes]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-28 md:p-8">
      <Card variant="elevated" className="fw-dark-panel text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary-100">
              <BookOpen className="h-4 w-4" />
              Recipe library
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
              Find food that fits today.
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Search meals, filter to your diet, and open a recipe for full
              ingredients, prep steps, and per-serving nutrition.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:min-w-64">
            <div className="rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black tabular-nums">{results.length}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
                Fits filters
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black tabular-nums">{diets.length}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
                Diet filters
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card padding="sm" className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, ingredients, or tags"
            aria-label="Search title, ingredients, or tags"
            className="w-full rounded-[1.3rem] border border-primary-100 bg-primary-50/55 py-4 pl-12 pr-4 text-sm font-semibold text-[#16302a] outline-none placeholder:text-[#91a7a0] transition focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#78928a]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Diet filters
          </div>
          <DietFilterChips active={diets} onToggle={toggleDiet} />
          {allergies.length > 0 && (
            <p className="text-xs font-semibold text-[#78928a]">
              Hiding recipes with: {allergies.join(", ")}.
            </p>
          )}
        </div>
      </Card>

      {results.length === 0 ? (
        <Card className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-black text-[#16302a]">
            No recipes match these filters yet.
          </p>
          <p className="mt-1 text-sm font-semibold text-[#78928a]">
            Try a different search term or turn off a diet filter to see more.
          </p>
        </Card>
      ) : (
        <>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#91a7a0]">
            {results.length} {results.length === 1 ? "recipe" : "recipes"}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onOpen={setOpenRecipe}
              />
            ))}
          </div>
        </>
      )}

      {openRecipe && (
        <RecipeDetail
          recipe={openRecipe}
          onClose={() => setOpenRecipe(null)}
        />
      )}
    </div>
  );
}
