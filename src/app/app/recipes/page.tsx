"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const RECIPE_BATCH_SIZE = 12;
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, ChefHat, Search, SlidersHorizontal, Sparkles, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
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

  // Counts for the segmented control, taken before the meal filter is applied
  // so each tab can honestly say how many recipes it would show.
  const mealCounts = useMemo(() => {
    const pool = applyRecipeFilters(searchRecipes(query), diets, allergies);
    const counts: Record<string, number> = { All: pool.length };
    for (const recipe of pool) {
      counts[recipe.meal] = (counts[recipe.meal] ?? 0) + 1;
    }
    return counts;
  }, [query, diets, allergies]);

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
              className="fw-press mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              Open meal plan
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            </Link>
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-primary-200">
                Left today
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {[
                  { label: "kcal", raw: leftToday.calories, value: leftToday.calories.toLocaleString() },
                  { label: "protein", raw: leftToday.protein, value: `${leftToday.protein}g` },
                  { label: "carbs", raw: leftToday.carbs, value: `${leftToday.carbs}g` },
                  { label: "fat", raw: leftToday.fat, value: `${leftToday.fat}g` },
                ].map((chip) => {
                  // Nothing left is a different state from "still room" — it
                  // should not render as just another neutral number.
                  const met = chip.raw <= 0;
                  return (
                    <span
                      key={chip.label}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black tabular-nums ring-1 ring-inset ${
                        met
                          ? "bg-primary-400/22 text-primary-100 ring-primary-300/40"
                          : "bg-white/10 text-white ring-white/15"
                      }`}
                    >
                      {met && (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                      )}
                      {chip.value}
                      <span className={`font-bold ${met ? "text-primary-100/75" : "text-white/70"}`}>
                        {chip.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { value: results.length.toLocaleString(), label: "Matches" },
              { value: quickCount.toLocaleString(), label: "Quick" },
              { value: highProteinCount.toLocaleString(), label: "30g+ protein" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 rounded-[1.15rem] bg-white/10 px-3 py-3 ring-1 ring-inset ring-white/15 sm:px-4"
              >
                <p className="font-heading text-2xl font-black tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white/72">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-5 px-6 py-6 md:px-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600"
              strokeWidth={2.25}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recipes"
              aria-label="Search recipes"
              className="min-h-14 w-full rounded-[1.3rem] bg-surface-muted py-4 pl-12 pr-4 text-sm font-semibold text-ink outline-none ring-1 ring-inset ring-hairline-strong transition placeholder:text-ink-faint hover:bg-surface-subtle focus:bg-surface focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative min-w-0">
            <label className="block sm:hidden">
              <span className="sr-only">Recipe meal type</span>
              <select
                value={mealFilter}
                onChange={(event) => setMealFilter(event.currentTarget.value as "All" | Recipe["meal"])}
                aria-label="Recipe meal type"
                className="min-h-12 w-full appearance-none rounded-[1.15rem] bg-surface-sunken px-4 py-3 pr-10 text-sm font-black text-ink outline-none ring-1 ring-inset ring-hairline-strong focus:bg-surface focus:ring-2 focus:ring-primary-500"
              >
                {mealFilters.map((meal) => (
                  <option key={meal} value={meal}>
                    {meal} ({mealCounts[meal] ?? 0})
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-primary-700">⌄</span>
            </label>
            <div className="hidden gap-1 overflow-x-auto rounded-[1.35rem] bg-surface-sunken p-1 ring-1 ring-inset ring-hairline sm:flex">
              {mealFilters.map((meal) => {
                const count = mealCounts[meal] ?? 0;
                const active = mealFilter === meal;
                return (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setMealFilter(meal)}
                    aria-pressed={active}
                    className={`fw-press inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 md:min-h-10 ${
                      active
                        ? "bg-primary-600 text-white shadow-e2"
                        : count === 0
                          ? "text-ink-faint hover:bg-surface"
                          : "text-ink-muted hover:bg-surface hover:text-primary-800"
                    }`}
                  >
                    {meal}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                        active ? "bg-white/20" : "bg-surface text-ink-subtle"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-ink-subtle">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              Diet filters
            </div>
            <DietFilterChips active={diets} onToggle={toggleDiet} />
            {allergies.length > 0 && (
              <p className="text-xs font-semibold text-ink-muted">
                Hiding recipes with: {allergies.join(", ")}.
              </p>
            )}
            {(likes.length > 0 || dislikes.length > 0) && (
              <p className="text-xs font-semibold text-ink-muted">
                Your thumbs tune this list — liked recipes rank first, &ldquo;Not for
                me&rdquo; sinks to the end.
              </p>
            )}
          </div>

          {featured && (
            <button
              type="button"
              onClick={() => openRecipeDialog(featured)}
              className="fw-press w-full rounded-[1.35rem] bg-gradient-to-br from-primary-50 to-surface-subtle p-4 text-left ring-1 ring-inset ring-primary-100 hover:ring-primary-200 hover:shadow-e1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-700">
                <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                Best fit
              </div>
              <p className="mt-3 break-words font-heading text-base font-black leading-snug tracking-tight text-ink">
                {featured.title}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-black text-ink-muted">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-inset ring-hairline">
                  <ChefHat className="h-3.5 w-3.5 shrink-0 text-primary-600" strokeWidth={2.25} />
                  {featured.meal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-inset ring-hairline">
                  <Timer className="h-3.5 w-3.5 shrink-0 text-primary-600" strokeWidth={2.25} />
                  <span className="tabular-nums">{featured.minutes}</span> min
                </span>
              </div>
            </button>
          )}
        </div>
        {hasRecipeFilters && (
          <div className="flex flex-col gap-3 rounded-[1.15rem] bg-primary-50/70 px-4 py-3 ring-1 ring-inset ring-primary-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-primary-900/75">
              <span className="font-black tabular-nums">{results.length}</span> match
              {results.length === 1 ? "" : "es"} visible
              {mealFilter !== "All" ? ` for ${mealFilter.toLowerCase()}` : ""}.
              {highProteinCount > 0 ? ` ${highProteinCount} are 30g+ protein.` : " Try loosening filters for more protein options."}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 self-start sm:self-center"
              onClick={() => {
                setQuery("");
                setMealFilter("All");
                diets.forEach((diet) => toggleDiet(diet));
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {results.length === 0 ? (
        <Card variant="tinted" padding="none">
          <EmptyState
            icon={Sparkles}
            title="No recipes match these filters yet."
            description="Try a different search term or turn off a diet filter to see more."
          />
        </Card>
      ) : (
        <>
          <SectionHeader
            as="h2"
            title={`${results.length.toLocaleString()} ${results.length === 1 ? "recipe" : "recipes"}`}
            description={
              results.length > visibleCount
                ? `Showing the first ${visibleResults.length.toLocaleString()}.`
                : undefined
            }
            action={
              quickCount > 0 ? (
                <Badge variant="info" size="sm" dot>
                  {quickCount.toLocaleString()} under 15 min
                </Badge>
              ) : undefined
            }
          />
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
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3">
              <ProgressMeter
                className="w-full bg-surface-sunken"
                size="sm"
                value={visibleResults.length}
                target={results.length}
                color="var(--color-primary-500)"
                label={`Showing ${visibleResults.length} of ${results.length} matching recipes`}
              />
              <p className="text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
                <span className="tabular-nums">{visibleResults.length.toLocaleString()}</span> of{" "}
                <span className="tabular-nums">{results.length.toLocaleString()}</span> shown
              </p>
              <Button type="button" variant="secondary" size="lg" onClick={showMore}>
                Show {Math.min(RECIPE_BATCH_SIZE, results.length - visibleCount)} more of{" "}
                {results.length - visibleCount} remaining
              </Button>
            </div>
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
