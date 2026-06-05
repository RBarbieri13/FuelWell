"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react";

type Recipe = {
  id: string;
  title: string;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  time: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  fit: "Great fit" | "Balanced" | "Save for later";
  note: string;
};

const remainingTargets = {
  calories: 920,
  protein: 82,
  carbs: 96,
  fat: 33,
};

const recipes: Recipe[] = [
  {
    id: "turkey-quinoa-bowl",
    title: "Turkey Quinoa Power Bowl",
    meal: "Lunch",
    time: 22,
    calories: 520,
    protein: 43,
    carbs: 51,
    fat: 18,
    tags: ["High protein", "Meal prep", "Gluten-free"],
    fit: "Great fit",
    note: "Uses 57% of remaining protein while keeping dinner flexible.",
  },
  {
    id: "salmon-sweet-potato",
    title: "Salmon, Sweet Potato, and Greens",
    meal: "Dinner",
    time: 28,
    calories: 610,
    protein: 46,
    carbs: 45,
    fat: 26,
    tags: ["Omega-3", "Dinner", "Dairy-free"],
    fit: "Balanced",
    note: "Best when paired with a lighter afternoon snack.",
  },
  {
    id: "egg-white-wrap",
    title: "Egg White Feta Breakfast Wrap",
    meal: "Breakfast",
    time: 12,
    calories: 360,
    protein: 31,
    carbs: 34,
    fat: 11,
    tags: ["Fast", "Vegetarian", "High protein"],
    fit: "Great fit",
    note: "A clean start that leaves room for a bigger lunch.",
  },
  {
    id: "greek-yogurt-crunch",
    title: "Greek Yogurt Berry Crunch",
    meal: "Snack",
    time: 5,
    calories: 240,
    protein: 24,
    carbs: 26,
    fat: 5,
    tags: ["No cook", "Snack", "Sweet"],
    fit: "Great fit",
    note: "Quick protein top-up without crowding calories.",
  },
  {
    id: "chicken-pesto-pasta",
    title: "Chicken Pesto Protein Pasta",
    meal: "Dinner",
    time: 24,
    calories: 690,
    protein: 51,
    carbs: 74,
    fat: 21,
    tags: ["Post-workout", "Comfort", "High protein"],
    fit: "Balanced",
    note: "Works well on training days when carbs are still available.",
  },
  {
    id: "black-bean-tacos",
    title: "Black Bean Avocado Tacos",
    meal: "Lunch",
    time: 18,
    calories: 480,
    protein: 22,
    carbs: 62,
    fat: 17,
    tags: ["Vegetarian", "Fiber", "Budget"],
    fit: "Save for later",
    note: "Good option when protein has already been covered.",
  },
];

const mealTabs = ["All", "Breakfast", "Lunch", "Dinner", "Snack"] as const;
const fitTabs = ["All fits", "Great fit", "Balanced", "Saved"] as const;

function MacroPill({
  label,
  value,
  target,
  tone,
}: {
  label: string;
  value: number;
  target: number;
  tone: string;
}) {
  const percent = Math.min(100, Math.round((value / target) * 100));

  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-neutral-500">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-neutral-800">
          {value}g
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const [mealFilter, setMealFilter] = useState<(typeof mealTabs)[number]>("All");
  const [fitFilter, setFitFilter] = useState<(typeof fitTabs)[number]>("All fits");
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>(["turkey-quinoa-bowl", "greek-yogurt-crunch"]);

  const savedRecipes = recipes.filter((recipe) => savedIds.includes(recipe.id));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesMeal = mealFilter === "All" || recipe.meal === mealFilter;
    const matchesFit =
      fitFilter === "All fits" ||
      (fitFilter === "Saved" ? savedIds.includes(recipe.id) : recipe.fit === fitFilter);
    const matchesQuery =
      normalizedQuery.length === 0 ||
      recipe.title.toLowerCase().includes(normalizedQuery) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    return matchesMeal && matchesFit && matchesQuery;
  });

  function toggleSaved(recipeId: string) {
    setSavedIds((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId]
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Recipes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Pick a meal that fits the macros you have left today.
          </p>
        </div>
        <Button type="button" size="sm">
          <UtensilsCrossed className="w-4 h-4" />
          Build from fridge
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary-50/80 via-white to-accent-50/60 border-primary-100">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Today after lunch
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-neutral-900">
              You still have room for a high-protein dinner.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Start with a great-fit recipe, save the ones you want this week,
              then send ingredients to a grocery list when you are ready.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Calories", `${remainingTargets.calories}`, "left"],
              ["Protein", `${remainingTargets.protein}g`, "left"],
              ["Carbs", `${remainingTargets.carbs}g`, "left"],
              ["Fat", `${remainingTargets.fat}g`, "left"],
            ].map(([label, value, suffix]) => (
              <div key={label} className="rounded-2xl bg-white/85 border border-white px-4 py-3">
                <p className="text-[11px] font-medium text-neutral-400">{label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                  {value}
                </p>
                <p className="text-xs text-neutral-500">{suffix}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <Card padding="sm" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search meals, tags, or ingredients"
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </div>
              <div className="flex flex-wrap gap-2">
                {mealTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMealFilter(tab)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                      mealFilter === tab
                        ? "border-primary-300 bg-primary-50 text-primary-700"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {fitTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFitFilter(tab)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                      fitFilter === tab
                        ? "border-accent-300 bg-accent-50 text-accent-700"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredRecipes.map((recipe) => {
              const isSaved = savedIds.includes(recipe.id);

              return (
                <Card key={recipe.id} className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={recipe.fit === "Great fit" ? "success" : recipe.fit === "Balanced" ? "info" : "warning"}
                        >
                          {recipe.fit}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                          <Clock className="w-3.5 h-3.5" />
                          {recipe.time} min
                        </span>
                      </div>
                      <h2 className="mt-3 text-base font-semibold leading-snug text-neutral-900">
                        {recipe.title}
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                        {recipe.note}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSaved(recipe.id)}
                      aria-label={isSaved ? "Remove saved recipe" : "Save recipe"}
                      className={cn(
                        "rounded-xl border p-2 transition-colors",
                        isSaved
                          ? "border-red-100 bg-red-50 text-red-500"
                          : "border-neutral-200 text-neutral-400 hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                        <Flame className="w-3.5 h-3.5 text-primary-500" />
                        Calories
                      </div>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900">
                        {recipe.calories} of {remainingTargets.calories}
                      </p>
                    </div>
                    <MacroPill label="Protein" value={recipe.protein} target={remainingTargets.protein} tone="bg-blue-500" />
                    <MacroPill label="Carbs" value={recipe.carbs} target={remainingTargets.carbs} tone="bg-amber-500" />
                    <MacroPill label="Fat" value={recipe.fat} target={remainingTargets.fat} tone="bg-red-500" />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button type="button" variant="secondary" size="sm" className="mt-auto w-full">
                    Add to meal plan
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <Card padding="sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-neutral-900">Saved fits</h2>
              <span className="text-xs font-medium text-neutral-400">{savedRecipes.length} saved</span>
            </div>
            <div className="mt-3 space-y-2">
              {savedRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setQuery(recipe.title)}
                  className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/50"
                >
                  <p className="text-sm font-medium text-neutral-800">{recipe.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {recipe.protein}g protein / {recipe.calories} cal
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card padding="sm" className="bg-neutral-900 text-white border-neutral-900">
            <BookOpen className="w-5 h-5 text-primary-300" />
            <h2 className="mt-3 text-sm font-semibold">Next best move</h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-300">
              Save two dinners and one breakfast, then build a three-day plan
              from meals that keep protein above 140g.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
