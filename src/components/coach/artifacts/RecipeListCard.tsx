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

/**
 * Canonical macro palette, shared verbatim by every coach card that prints a
 * macro figure. Bright `--color-macro-*` tokens are reserved for fills; text
 * uses the darker step so each figure clears 4.5:1 on the surfaces it sits on.
 */
const MACRO_TEXT = {
  calories: "var(--color-primary-800)",
  protein: "var(--color-sky-700)",
  carbs: "var(--color-lemon-700)",
  fat: "var(--color-accent-700)",
} as const;

/**
 * Fixed metric cell so kcal / protein line up as columns down the list.
 * The label yields space before the figure ever does.
 */
function MetricCell({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex min-h-6 min-w-0 items-baseline justify-between gap-1.5 rounded-lg bg-surface-muted px-1.5 py-1 ring-1 ring-inset ring-hairline">
      <span className="min-w-0 truncate text-[0.625rem] font-black uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <span
        className="shrink-0 text-[0.6875rem] font-black tabular-nums"
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
        <ul className="mt-3 space-y-1.5">
          {recipes.map((recipe) => {
            const tag = (recipe.tags ?? [])[0];
            return (
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
                  className="fw-press group flex min-h-11 w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-left ring-1 ring-inset ring-transparent hover:bg-primary-50/60 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-ink">
                      {recipe.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.6875rem] font-bold text-ink-muted">
                      <span className="capitalize">{recipe.meal}</span>
                      <span aria-hidden="true" className="text-ink-faint">
                        ·
                      </span>
                      <Clock className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                      <span className="shrink-0 tabular-nums">{recipe.minutes} min</span>
                      {tag && (
                        <span className="min-w-0 max-w-[9rem] truncate rounded-full bg-sky-50 px-1.5 py-0.5 text-[0.625rem] font-black text-sky-700 ring-1 ring-inset ring-sky-100">
                          {tag}
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 grid max-w-[18rem] grid-cols-2 gap-1">
                      <MetricCell
                        label="kcal"
                        value={`${Math.round(recipe.perServing.calories)}`}
                        tone={MACRO_TEXT.calories}
                      />
                      <MetricCell
                        label="P"
                        value={`${Math.round(recipe.perServing.protein * 10) / 10}g`}
                        tone={MACRO_TEXT.protein}
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
            );
          })}
        </ul>
      )}
    </Card>
  );
}
