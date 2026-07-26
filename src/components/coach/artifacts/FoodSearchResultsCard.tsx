"use client";

import { ChevronRight, Search, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactCardProps } from "./contract";

type FoodResult = {
  id: string;
  name: string;
  categoryLabel: string;
  per100: { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
  commonServings: { label: string; amount: number }[];
  servingUnit: "g" | "ml";
};

type FoodSearchResultsArtifact = {
  id: string;
  type: "food_search_results";
  query: string;
  foods: FoodResult[];
};

/** Same default-portion rule the suggest_meal tool uses: 2nd preset, else 1st, else 100. */
function defaultPortion(food: FoodResult): number {
  return food.commonServings[1]?.amount ?? food.commonServings[0]?.amount ?? 100;
}

function slotForNow(): string {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 17) return "snack";
  return "dinner";
}

const grams = (n: number) => `${Math.round(n * 10) / 10}g`;

/**
 * One metric cell. Every row uses the same four cells in the same grid, so
 * the numbers read down as columns instead of as a ragged sentence.
 */
function MetricCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <span className="flex min-w-0 items-baseline justify-between gap-1 rounded-lg bg-surface-muted px-1.5 py-1 ring-1 ring-inset ring-hairline">
      <span className="shrink-0 text-[0.625rem] font-black uppercase tracking-wide text-ink-subtle">
        {label}
      </span>
      <span
        className="min-w-0 truncate text-[0.6875rem] font-black tabular-nums text-ink"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </span>
    </span>
  );
}

export function FoodSearchResultsCard({
  artifact,
  onAction,
}: ArtifactCardProps<FoodSearchResultsArtifact>) {
  const foods = artifact.foods ?? [];

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <SectionHeader
        as="h3"
        icon={Search}
        eyebrow="Food search"
        title={`Results for “${artifact.query}”`}
        description={
          foods.length > 0
            ? `${foods.length} match${foods.length === 1 ? "" : "es"} · tap one to log it`
            : undefined
        }
      />

      {foods.length === 0 ? (
        <EmptyState
          size="inline"
          icon={SearchX}
          title="No foods found"
          description="Try another name."
        />
      ) : (
        <ul className="mt-3 space-y-1">
          {foods.map((food) => {
            const portion = defaultPortion(food);
            return (
              <li key={food.id}>
                <button
                  type="button"
                  aria-label={`Log ${food.name}, ${portion} ${food.servingUnit}`}
                  onClick={() =>
                    onAction({
                      kind: "invoke_tool",
                      name: "log_meal",
                      input: {
                        food_id: food.id,
                        portion,
                        meal_slot: slotForNow(),
                      },
                    })
                  }
                  className="fw-press group flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-primary-50/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-black text-ink">
                        {food.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[0.625rem] font-black tabular-nums text-primary-800 ring-1 ring-inset ring-primary-100">
                        {portion} {food.servingUnit}
                      </span>
                    </span>
                    <span className="mt-1.5 grid grid-cols-2 gap-1 sm:grid-cols-4">
                      <MetricCell
                        label="kcal"
                        value={`${Math.round(food.per100.kcal)}`}
                        tone="var(--color-macro-calories)"
                      />
                      <MetricCell
                        label="P"
                        value={grams(food.per100.protein)}
                        tone="var(--color-macro-protein)"
                      />
                      <MetricCell
                        label="C"
                        value={grams(food.per100.carbs)}
                        tone="var(--color-lemon-700)"
                      />
                      <MetricCell
                        label="F"
                        value={grams(food.per100.fat)}
                        tone="var(--color-accent-700)"
                      />
                    </span>
                    <span className="mt-1 block truncate text-[0.6875rem] font-bold text-ink-subtle">
                      {food.categoryLabel} · per 100{food.servingUnit}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    strokeWidth={2}
                    className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
