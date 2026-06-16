"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
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
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 500+ foods by name"
          aria-label="Search 500+ foods by name"
          className="w-full rounded-[1.35rem] border border-primary-100 bg-primary-50/55 py-4 pl-12 pr-4 text-base font-semibold text-[#16302a] placeholder:text-[#91a7a0] transition focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
        />
      </div>

      <DietFilterChips active={diets} onToggle={toggleDiet} />

      {query.trim().length === 0 ? (
        <SearchState
          title="Start typing to search."
          body="Try chicken, salmon, oatmeal, yogurt, or rice. Results rank as you type."
        />
      ) : tooShort ? (
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
        <div className="grid gap-2">
          {results.map((food) => (
            <div
              key={food.id}
              className={cn(
                "grid gap-3 rounded-[1.25rem] border p-4 transition md:grid-cols-[1fr_auto]",
                selectedId === food.id
                  ? "border-primary-300 bg-primary-50/80 shadow-[0_18px_44px_rgba(21,145,108,0.12)]"
                  : "border-primary-100/70 bg-[#f7faf8] hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-[0_14px_32px_rgba(22,48,42,0.08)]"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(food)}
                className="text-left"
              >
                <p className="font-black text-[#16302a]">{food.name}</p>
                <p className="mt-1 text-sm font-semibold text-[#78928a]">
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
                  className="rounded-[1rem] bg-primary-100 p-2.5 text-primary-700 transition hover:bg-primary-200"
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
