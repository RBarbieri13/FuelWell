"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
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
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Recipes
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Search the recipe library, filter to your diet, and open any recipe
          for full ingredients and nutrition.
        </p>
      </div>

      <Card padding="sm" className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, ingredients, or tags"
            aria-label="Search title, ingredients, or tags"
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Diet filters
          </div>
          <DietFilterChips active={diets} onToggle={toggleDiet} />
          {allergies.length > 0 && (
            <p className="text-xs text-neutral-500">
              Hiding recipes with: {allergies.join(", ")}.
            </p>
          )}
        </div>
      </Card>

      {results.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm font-medium text-neutral-700">
            No recipes match these filters yet.
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Try a different search term or turn off a diet filter to see more.
          </p>
        </Card>
      ) : (
        <>
          <p className="text-xs font-medium text-neutral-500">
            {results.length} {results.length === 1 ? "recipe" : "recipes"}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
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
