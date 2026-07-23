"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const RECIPE_BATCH_SIZE = 12;
import { ArrowRight, BookOpen, CalendarDays, ChefHat, Search, SlidersHorizontal, Sparkles, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DietFilterChips } from "@/components/food/diet-filter-chips";
import { RecipeCard, type RecipePlanStatus } from "@/components/recipes/recipe-card";
import { RecipeDetail } from "@/components/recipes/recipe-detail";
import {
  RECIPES,
  searchRecipes,
  applyRecipeFilters,
  type Recipe,
} from "@/lib/recipes-data";
import { usePreferences, rankByPreference } from "@/lib/use-preferences";
import { useDayLog } from "@/lib/use-day-log";
import { useMealPlan } from "@/lib/use-meal-plan";
import { remaining, sumMeals } from "@/lib/fuelwell-data";
import { usePreviewOnboardingOverride } from "@/lib/preview-onboarding";

export default function RecipesPage() {
  const [query, setQuery] = useState("");
  const [mealFilter, setMealFilter] = useState<"All" | Recipe["meal"]>("All");
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const { diets, allergies, likes, dislikes, toggleDiet } = usePreferences();
  const { meals, targets } = useDayLog();
  const { days } = useMealPlan();

  // Deep-link support: /app/recipes?recipe=<id> opens that recipe's detail,
  // so other surfaces (grocery rows, plan slots) can link to a recipe.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("recipe");
    if (!requested) return;
    const match = RECIPES.find((candidate) => candidate.id === requested);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL read on mount, same pattern as signup/page.tsx
    if (match) setOpenRecipe(match);
  }, []);

  function openRecipeDialog(recipe: Recipe) {
    setOpenRecipe(recipe);
    window.history.replaceState(null, "", `/app/recipes?recipe=${recipe.id}`);
  }

  function closeRecipeDialog() {
    setOpenRecipe(null);
    window.history.replaceState(null, "", "/app/recipes");
  }

  // "Already planned / logged today" signals for recipe cards (audit R5).
  const planStatusByTitle = useMemo(() => {
    const map = new Map<string, RecipePlanStatus>();
    for (const day of days) {
      for (const meal of day.meals) {
        if (meal.status === "open") continue;
        const key = meal.title.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { label: `In plan · ${day.label}`, href: "/app/meal-plan" });
        }
      }
    }
    return map;
  }, [days]);
  const loggedTitles = useMemo(() => {
    const names = new Set<string>();
    for (const meal of meals) {
      names.add(meal.name.toLowerCase());
      meal.items.forEach((item) => names.add(item.name.toLowerCase()));
    }
    return names;
  }, [meals]);

  function planStatusFor(recipe: Recipe): RecipePlanStatus | null {
    const key = recipe.title.toLowerCase();
    if (loggedTitles.has(key)) return { label: "Logged today", href: "/app/nutrition" };
    return planStatusByTitle.get(key) ?? null;
  }
  const previewOverride = usePreviewOnboardingOverride();
  const todayTotals = sumMeals(meals);
  const effectiveTargets = {
    calories: Number(previewOverride?.macros?.calories) || targets.calories,
    protein: Number(previewOverride?.macros?.protein) || targets.protein,
    carbs: Number(previewOverride?.macros?.carbs) || targets.carbs,
    fat: Number(previewOverride?.macros?.fat) || targets.fat,
  };
  const leftToday = {
    calories: remaining(todayTotals.calories, effectiveTargets.calories),
    protein: remaining(todayTotals.protein, effectiveTargets.protein),
    carbs: remaining(todayTotals.carbs, effectiveTargets.carbs),
    fat: remaining(todayTotals.fat, effectiveTargets.fat),
  };

  const results = useMemo(() => {
    const searched = searchRecipes(query);
    const filtered = applyRecipeFilters(searched, diets, allergies);
    const byMeal =
      mealFilter === "All"
        ? filtered
        : filtered.filter((recipe) => recipe.meal === mealFilter);
    return rankByPreference(byMeal, (r) => r.id, { likes, dislikes });
  }, [query, mealFilter, diets, allergies, likes, dislikes]);

  // Batch the grid: rendering all 600+ tall cards at once makes the phone
  // page hundreds of thousands of pixels long. The batch size resets whenever
  // the filter key changes (render-time comparison, no effect needed).
  const filterKey = JSON.stringify([query, mealFilter, diets, allergies]);
  const [batch, setBatch] = useState({ key: filterKey, count: RECIPE_BATCH_SIZE });
  const visibleCount = batch.key === filterKey ? batch.count : RECIPE_BATCH_SIZE;
  const showMore = () =>
    setBatch({ key: filterKey, count: visibleCount + RECIPE_BATCH_SIZE });
  const visibleResults = results.slice(0, visibleCount);

  const mealFilters: Array<"All" | Recipe["meal"]> = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
  ];
  const quickCount = results.filter((recipe) => recipe.minutes <= 15).length;
  const highProteinCount = results.filter((recipe) => recipe.perServing.protein >= 30).length;
  const featured = results[0];
  const hasRecipeFilters = query.trim().length > 0 || mealFilter !== "All" || diets.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-28 md:p-8">
      <Card variant="elevated" className="fw-dark-panel text-white">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary-100">
              <BookOpen className="h-4 w-4" />
              Recipe library
            </p>
            <h1 className="mt-4 text-2xl font-black leading-tight md:text-4xl">
              Find food that fits today.
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Search meals, filter to your diet, and open a recipe for full
              ingredients, prep steps, and per-serving nutrition.
            </p>
            <Link
              href="/app/meal-plan"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            >
              <CalendarDays className="h-4 w-4" />
              Open meal plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-primary-200">
                Left today
              </span>
              {[
                { label: "kcal", value: leftToday.calories.toLocaleString() },
                { label: "protein", value: `${leftToday.protein}g` },
                { label: "carbs", value: `${leftToday.carbs}g` },
                { label: "fat", value: `${leftToday.fat}g` },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-black tabular-nums text-white"
                >
                  {chip.value}
                  <span className="ml-1 font-bold text-white/60">{chip.label}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black tabular-nums">{results.length}</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white/70">
                Matches
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black tabular-nums">{quickCount}</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white/70">
                Quick
              </p>
            </div>
            <div className="rounded-[1.15rem] border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black tabular-nums">{highProteinCount}</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-white/70">
                30g+ protein
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 px-6 py-6 md:px-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recipes"
              aria-label="Search recipes"
              className="w-full rounded-[1.3rem] border border-primary-100 bg-primary-50/55 py-4 pl-12 pr-4 text-sm font-semibold text-[#16302a] outline-none placeholder:text-[#91a7a0] transition focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative min-w-0">
            <div className="flex gap-2 overflow-x-auto rounded-[1.35rem] bg-[#f2f7f5] p-1">
              {mealFilters.map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setMealFilter(meal)}
                  aria-pressed={mealFilter === meal}
                  className={`min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-black transition md:min-h-0 ${
                    mealFilter === meal
                      ? "bg-primary-500 text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)]"
                      : "text-neutral-600 hover:bg-white"
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
            {/* Cue that the chip row scrolls — Snack sits off-screen at phone widths. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 right-1 w-8 rounded-r-[1.35rem] bg-gradient-to-l from-[#f2f7f5] to-transparent sm:hidden"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Diet filters
            </div>
            <DietFilterChips active={diets} onToggle={toggleDiet} />
            {allergies.length > 0 && (
              <p className="text-xs font-semibold text-muted-foreground">
                Hiding recipes with: {allergies.join(", ")}.
              </p>
            )}
            {(likes.length > 0 || dislikes.length > 0) && (
              <p className="text-xs font-semibold text-muted-foreground">
                Your thumbs tune this list — liked recipes rank first, &ldquo;Not for
                me&rdquo; sinks to the end.
              </p>
            )}
          </div>

          {featured && (
            <button
              type="button"
              onClick={() => openRecipeDialog(featured)}
              className="w-full rounded-[1.35rem] border border-primary-100 bg-primary-50/70 p-4 text-left transition hover:border-primary-200"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-700">
                <Sparkles className="h-4 w-4" />
                Best fit
              </div>
              <p className="mt-3 text-base font-black text-[#16302a]">{featured.title}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-[#60776f]">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1">
                  <ChefHat className="h-3.5 w-3.5 text-primary-600" />
                  {featured.meal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1">
                  <Timer className="h-3.5 w-3.5 text-primary-600" />
                  {featured.minutes} min
                </span>
              </div>
            </button>
          )}
        </div>
        {hasRecipeFilters && (
          <div className="flex flex-col gap-2 rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-primary-900/70">
              {results.length} match{results.length === 1 ? "" : "es"} visible
              {mealFilter !== "All" ? ` for ${mealFilter.toLowerCase()}` : ""}.
              {highProteinCount > 0 ? ` ${highProteinCount} are 30g+ protein.` : " Try loosening filters for more protein options."}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setMealFilter("All");
                diets.forEach((diet) => toggleDiet(diet));
              }}
              className="self-start rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-100 sm:self-center"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {results.length === 0 ? (
        <Card className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-black text-[#16302a]">
            No recipes match these filters yet.
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Try a different search term or turn off a diet filter to see more.
          </p>
        </Card>
      ) : (
        <>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
            {results.length} {results.length === 1 ? "recipe" : "recipes"}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleResults.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onOpen={openRecipeDialog}
                planStatus={planStatusFor(recipe)}
              />
            ))}
          </div>
          {results.length > visibleCount && (
            <button
              type="button"
              onClick={showMore}
              className="mx-auto block rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-black text-primary-700 shadow-[0_8px_22px_rgba(20,90,75,0.06)] transition hover:bg-primary-50"
            >
              Show {Math.min(RECIPE_BATCH_SIZE, results.length - visibleCount)} more of{" "}
              {results.length - visibleCount} remaining
            </button>
          )}
        </>
      )}

      {openRecipe && (
        <RecipeDetail
          recipe={openRecipe}
          onClose={closeRecipeDialog}
        />
      )}
    </div>
  );
}
