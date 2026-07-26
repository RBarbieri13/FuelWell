"use client";

import { BookOpen, ChevronRight, Clock, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactCardProps } from "./contract";

type RecipeRow = {
  id: string;
  title: string;
  meal: string;
  minutes: number;
  perServing: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  tags: string[];
};

type RecipeListArtifact = {
  id: string;
  type: "recipe_list";
  recipes: RecipeRow[];
};

/** Fixed metric cell so kcal / protein line up as columns down the list. */
function MetricCell({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex min-w-0 items-baseline justify-between gap-1 rounded-lg bg-surface-muted px-1.5 py-1 ring-1 ring-inset ring-hairline">
      <span className="shrink-0 text-[0.625rem] font-black uppercase tracking-wide text-ink-subtle">
        {label}
      </span>
      <span
        className="min-w-0 truncate text-[0.6875rem] font-black tabular-nums"
        style={{ color: tone }}
      >
        {value}
      </span>
    </span>
  );
}

export function RecipeListCard({
  artifact,
  onAction,
}: ArtifactCardProps<RecipeListArtifact>) {
  const recipes = artifact.recipes ?? [];

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <SectionHeader
        as="h3"
        icon={BookOpen}
        title="Recipes"
        description={
          recipes.length > 0
            ? `${recipes.length} match${recipes.length === 1 ? "" : "es"} · values per serving`
            : undefined
        }
      />

      {recipes.length === 0 ? (
        <EmptyState
          size="inline"
          icon={SearchX}
          title="No recipes match"
          description="Try loosening the filters."
        />
      ) : (
        <ul className="mt-3 space-y-1">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                aria-label={`View ${recipe.title} recipe`}
                onClick={() =>
                  onAction({
                    kind: "invoke_tool",
                    name: "get_recipe_detail",
                    input: { recipe_id: recipe.id },
                  })
                }
                className="fw-press group flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left hover:bg-primary-50/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-ink">
                    {recipe.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.6875rem] font-bold text-ink-subtle">
                    <span className="capitalize">{recipe.meal}</span>
                    <span aria-hidden="true" className="text-ink-faint">
                      ·
                    </span>
                    <Clock className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                    <span className="tabular-nums">{recipe.minutes} min</span>
                  </span>
                  <span className="mt-1.5 grid max-w-[18rem] grid-cols-2 gap-1">
                    <MetricCell
                      label="kcal"
                      value={`${Math.round(recipe.perServing.calories)}`}
                      tone="var(--color-macro-calories)"
                    />
                    <MetricCell
                      label="P"
                      value={`${Math.round(recipe.perServing.protein * 10) / 10}g`}
                      tone="var(--color-macro-protein)"
                    />
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={2}
                  className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
