"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
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
}: {
  selectedId: string | null;
  onSelect: (food: FoodItem) => void;
}) {
  const { likes, dislikes } = usePreferences();
  const [query, setQuery] = useState("");
  const [diets, setDiets] = useState<DietFilter[]>([]);

  const toggleDiet = (id: DietFilter) =>
    setDiets((current) =>
      current.includes(id) ? current.filter((d) => d !== id) : [...current, id]
    );

  const results = useMemo(() => {
    const trimmed = query.trim();
    let items =
      trimmed.length >= 2 ? searchFoods(trimmed, 20) : ([] as FoodItem[]);
    for (const diet of diets) {
      items = filterFoods(DIET_TO_FOOD_FILTER[diet], items);
    }
    return rankByPreference(items, (f) => f.id, { likes, dislikes });
  }, [query, diets, likes, dislikes]);

  const tooShort = query.trim().length > 0 && query.trim().length < 2;

  return (
    <Card className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 500+ foods by name"
          className="w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-12 pr-4 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
        />
      </div>

      <DietFilterChips active={diets} onToggle={toggleDiet} />

      {query.trim().length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
          <p className="font-bold text-neutral-900">Start typing to search.</p>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            Try chicken, salmon, oatmeal, yogurt, or rice. Results rank as you
            type.
          </p>
        </div>
      ) : tooShort ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
          <p className="font-bold text-neutral-900">Keep going.</p>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            Type at least two characters to see ranked matches.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
          <p className="font-bold text-neutral-900">No matches yet.</p>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            {diets.length > 0
              ? "Try removing a diet filter or a different search term."
              : "Try a different search term, or add your own meal below."}
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {results.map((food) => (
            <div
              key={food.id}
              className={cn(
                "grid gap-3 rounded-2xl border p-4 transition md:grid-cols-[1fr_auto]",
                selectedId === food.id
                  ? "border-primary-300 bg-primary-50/70 shadow-md shadow-primary-100"
                  : "border-neutral-100 bg-neutral-50/70 hover:border-primary-200 hover:bg-white"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(food)}
                className="text-left"
              >
                <p className="font-black text-neutral-900">{food.name}</p>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  {food.categoryLabel} &middot; {food.per100.kcal} cal /100
                  {food.servingUnit} &middot; {food.per100.protein}g protein
                </p>
              </button>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <PreferenceToggle id={food.id} size="sm" />
                <button
                  type="button"
                  onClick={() => onSelect(food)}
                  aria-label={`Choose ${food.name}`}
                  className="rounded-xl bg-primary-50 p-2 text-primary-600 transition hover:bg-primary-100"
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
