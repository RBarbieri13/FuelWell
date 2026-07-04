"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  FOOD_DATABASE,
  filterFoods,
  searchFoods,
  type FoodItem,
} from "@/lib/food-database";
import {
  rankByPreference,
  usePreferences,
  type DietFilter,
} from "@/lib/use-preferences";
import { DietFilterChips } from "@/components/food/diet-filter-chips";
import { PreferenceToggle } from "@/components/food/preference-toggle";

/** DietFilter -> food-database filter id. "vegan" maps to "vegan-friendly". */
const DIET_TO_FOOD_FILTER: Record<
  DietFilter,
  "high-protein" | "low-carb" | "low-fat" | "vegan-friendly"
> = {
  "high-protein": "high-protein",
  "low-carb": "low-carb",
  "low-fat": "low-fat",
  vegan: "vegan-friendly",
};

/**
 * Ranked autocomplete over the real food database. Fires searchFoods once the
 * query reaches 2 chars, intersects active diet filters, and floats
 * liked/sinks disliked items via rankByPreference. Each result is tappable.
 */
export function FoodSearch({
  selectedId,
  onSelect,
  recentFoodIds = [],
  recentlyAddedId,
}: {
  selectedId: string | null;
  onSelect: (food: FoodItem) => void;
  recentFoodIds?: string[];
  recentlyAddedId?: string | null;
}) {
  const { likes, dislikes } = usePreferences();
  const [query, setQuery] = useState("");
  const [diets, setDiets] = useState<DietFilter[]>([]);
  const [preferenceFilter, setPreferenceFilter] = useState<"all" | "favorites" | "dislikes" | "recent">("all");

  const toggleDiet = (id: DietFilter) =>
    setDiets((current) =>
      current.includes(id) ? current.filter((d) => d !== id) : [...current, id]
    );

  const results = useMemo(() => {
    const trimmed = query.trim();
    let items =
      trimmed.length >= 2 ? searchFoods(trimmed, 60) : FOOD_DATABASE.slice(0, 36);
    for (const diet of diets) {
      items = filterFoods(DIET_TO_FOOD_FILTER[diet], items);
    }
    if (preferenceFilter === "favorites") {
      items = items.filter((item) => likes.includes(item.id));
    }
    if (preferenceFilter === "dislikes") {
      items = items.filter((item) => dislikes.includes(item.id));
    }
    if (preferenceFilter === "recent") {
      items = items.filter((item) => recentFoodIds.includes(item.id));
    }
    return rankByPreference(items, (f) => f.id, { likes, dislikes });
  }, [query, diets, likes, dislikes, preferenceFilter, recentFoodIds]);

  const tooShort = query.trim().length > 0 && query.trim().length < 2;

  return (
    <Card className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 1,000+ foods by name"
          aria-label="Search 1,000+ foods by name"
          className="w-full rounded-[1.35rem] border border-primary-100 bg-primary-50/55 py-4 pl-12 pr-4 text-base font-semibold text-[#16302a] placeholder:text-[#91a7a0] transition focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
        />
      </div>

      <DietFilterChips active={diets} onToggle={toggleDiet} />
      <div className="flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["favorites", "Favorites"],
          ["dislikes", "Dislikes"],
          ["recent", "Recently used"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPreferenceFilter(id as typeof preferenceFilter)}
            className={cn(
              "min-h-11 rounded-full px-3.5 py-1.5 text-sm font-semibold transition md:min-h-0",
              preferenceFilter === id
                ? "bg-primary-600 text-white"
                : "bg-primary-50 text-primary-800 hover:bg-primary-100"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {query.trim().length === 0 && (
        <div className="rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm font-semibold text-primary-900/70">
          Showing common foods first. Type to narrow the list.
        </div>
      )}

      {tooShort ? (
        <SearchState
          title="Keep going."
          body="Type at least two characters to see ranked matches."
        />
      ) : results.length === 0 ? (
        <SearchState
          title="No matches yet."
          body={
            diets.length > 0
              ? "Try removing a diet filter or a different search term."
              : "Try a different search term, or add your own meal below."
          }
        />
      ) : (
        <div className="grid max-h-[34rem] gap-1.5 overflow-y-auto pr-1">
          {results.map((food) => (
            <div
              key={food.id}
              className={cn(
                "grid gap-2 rounded-[1rem] border px-3 py-2.5 transition md:grid-cols-[1fr_auto]",
                selectedId === food.id
                  ? "border-primary-300 bg-primary-50/80 shadow-[0_18px_44px_rgba(21,145,108,0.12)]"
                  : "border-primary-100/70 bg-[#f7faf8] hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-[0_14px_32px_rgba(22,48,42,0.08)]"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(food)}
                className="min-h-11 text-left md:min-h-0"
              >
                <p className="font-black text-[#16302a]">{food.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#78928a]">
                  {food.categoryLabel} &middot; {food.per100.kcal} kcal /100
                  {food.servingUnit} &middot; {food.per100.protein}g protein
                </p>
              </button>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <PreferenceToggle id={food.id} size="sm" />
                <button
                  type="button"
                  onClick={() => onSelect(food)}
                  aria-label={`Choose ${food.name}`}
                  className={cn(
                    "rounded-[1rem] bg-primary-100 p-3 text-primary-700 transition hover:bg-primary-200",
                    recentlyAddedId === food.id && "animate-pulse bg-primary-600 text-white ring-4 ring-primary-200"
                  )}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SearchState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60 p-5">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-sm">
        <SlidersHorizontal className="h-5 w-5" />
      </div>
      <p className="mt-3 text-center font-black text-[#16302a]">{title}</p>
      <p className="mt-1 text-center text-sm font-semibold text-[#78928a]">{body}</p>
    </div>
  );
}
