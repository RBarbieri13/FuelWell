"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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

type PreferenceFilter = "all" | "favorites" | "dislikes" | "recent";

const PREFERENCE_FILTERS: { id: PreferenceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "dislikes", label: "Dislikes" },
  { id: "recent", label: "Recently used" },
];

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
  const [preferenceFilter, setPreferenceFilter] = useState<PreferenceFilter>("all");

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
  const activeFilterCount = diets.length + (preferenceFilter === "all" ? 0 : 1);

  return (
    <Card className="space-y-3 md:space-y-4">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 1,000+ foods by name"
          aria-label="Search 1,000+ foods by name"
          className="min-h-12 w-full rounded-[1.35rem] border border-primary-100 bg-primary-50/55 py-3 pl-12 pr-4 text-base font-semibold text-ink shadow-e1 transition duration-200 ease-out-soft placeholder:text-ink-faint hover:border-primary-200 focus:border-primary-500 focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-primary-500/35"
          autoFocus
        />
      </div>

      <DietFilterChips active={diets} onToggle={toggleDiet} />

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter foods by your preferences"
      >
        {PREFERENCE_FILTERS.map((filter) => {
          const isOn = preferenceFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => setPreferenceFilter(filter.id)}
              className={cn(
                "fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9",
                isOn
                  ? "bg-primary-600 text-white shadow-e1 ring-primary-700"
                  : "bg-surface-muted text-ink-muted ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-100 active:bg-primary-100"
              )}
            >
              {isOn && (
                <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
              )}
              {filter.label}
            </button>
          );
        })}
      </div>

      {query.trim().length === 0 && (
        <p className="rounded-[1.15rem] bg-primary-50/70 px-4 py-3 text-sm font-semibold text-primary-900/70 ring-1 ring-inset ring-primary-100">
          Showing common foods first. Type to narrow the list.
        </p>
      )}

      {!tooShort && results.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
            <span className="tabular-nums">{results.length}</span>{" "}
            {results.length === 1 ? "match" : "matches"}
          </p>
          {activeFilterCount > 0 && (
            <Badge variant="info" size="sm" dot>
              <span className="tabular-nums">{activeFilterCount}</span> filter
              {activeFilterCount === 1 ? "" : "s"} on
            </Badge>
          )}
        </div>
      )}

      {tooShort ? (
        <SearchState
          title="Keep going."
          body="Type at least two characters to see ranked matches."
        />
      ) : results.length === 0 ? (
        <div className="rounded-[1.35rem] bg-surface-muted ring-1 ring-inset ring-hairline">
          <EmptyState
            size="inline"
            icon={SearchX}
            title="No matches yet."
            description={
              diets.length > 0
                ? "Try removing a diet filter or a different search term."
                : "Try a different search term, or add your own meal below."
            }
          />
        </div>
      ) : (
        <div
          role="list"
          aria-label="Food search results"
          className={cn(
            "grid gap-1.5 overflow-y-auto overscroll-contain pr-1",
            // With a selection active the list shrinks so the portion card
            // below stays in view instead of a long spatial jump (audit L2).
            selectedId ? "max-h-56" : "max-h-[34rem]"
          )}
        >
          {results.map((food) => {
            const isSelected = selectedId === food.id;
            return (
              <div
                role="listitem"
                key={food.id}
                className={cn(
                  "fw-press grid min-w-0 items-center gap-2 rounded-[1rem] px-3 py-2.5 ring-1 ring-inset md:grid-cols-[minmax(0,1fr)_auto]",
                  isSelected
                    ? "bg-primary-50 shadow-e2 ring-2 ring-primary-400"
                    : "bg-surface-muted ring-hairline hover:-translate-y-0.5 hover:bg-surface hover:shadow-e2 hover:ring-primary-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(food)}
                  className="flex min-h-11 min-w-0 flex-col justify-center rounded-[0.75rem] text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-0"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate font-black text-ink">
                      {food.name}
                    </span>
                    {isSelected && (
                      <Badge variant="success" size="sm" className="shrink-0">
                        Selected
                      </Badge>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-ink-muted">
                    {food.categoryLabel} &middot;{" "}
                    <span className="tabular-nums">{food.per100.kcal}</span> kcal /100
                    {food.servingUnit} &middot;{" "}
                    <span className="tabular-nums">{food.per100.protein}</span>g protein
                  </span>
                </button>
                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <PreferenceToggle id={food.id} size="sm" />
                  <button
                    type="button"
                    onClick={() => onSelect(food)}
                    aria-label={`Choose ${food.name}`}
                    className={cn(
                      "fw-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                      isSelected
                        ? "bg-primary-600 text-white ring-primary-700"
                        : "bg-primary-100 text-primary-700 ring-primary-200/70 hover:bg-primary-200 active:bg-primary-300",
                      recentlyAddedId === food.id &&
                        "animate-pulse bg-primary-600 text-white ring-4 ring-primary-200"
                    )}
                  >
                    {isSelected ? (
                      <Check className="h-5 w-5" strokeWidth={2.5} />
                    ) : (
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function SearchState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60 p-5">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[1rem] bg-surface text-primary-700 shadow-e1 ring-1 ring-inset ring-primary-100">
        <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
      </div>
      <p className="mt-3 text-center font-black text-ink">{title}</p>
      <p className="mt-1 text-center text-sm font-semibold text-ink-muted">{body}</p>
    </div>
  );
}
