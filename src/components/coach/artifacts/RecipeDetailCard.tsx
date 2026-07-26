"use client";

import { ChefHat, ChevronRight, Clock, ShoppingCart, Users, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactCardProps } from "./contract";

type RecipeDetail = {
  id: string;
  title: string;
  meal: string;
  minutes: number;
  servings: number;
  perServing: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  ingredients: { item: string; amount: string }[];
  steps: string[];
  tags: string[];
};

type RecipeDetailArtifact = {
  id: string;
  type: "recipe_detail";
  recipe: RecipeDetail;
};

const SLOT_BY_MEAL: Record<string, string> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "snack",
};

const grams = (n: number) => `${Math.round(n * 10) / 10}g`;

export function RecipeDetailCard({
  artifact,
  onAction,
}: ArtifactCardProps<RecipeDetailArtifact>) {
  const recipe = artifact.recipe;
  if (!recipe) {
    return (
      <Card padding="sm" className="min-w-0 max-w-full">
        <EmptyState
          size="inline"
          icon={ChefHat}
          title="Recipe not found."
          description="Ask for another recipe and it will show up here."
        />
      </Card>
    );
  }
  const slot = SLOT_BY_MEAL[recipe.meal?.toLowerCase()] ?? "dinner";
  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];
  const tags = recipe.tags ?? [];

  const macros = [
    { key: "kcal", label: "kcal", value: `${Math.round(recipe.perServing.calories)}`, tone: "var(--color-macro-calories)" },
    { key: "protein", label: "Protein", value: grams(recipe.perServing.protein), tone: "var(--color-macro-protein)" },
    { key: "carbs", label: "Carbs", value: grams(recipe.perServing.carbs), tone: "var(--color-macro-carbs)" },
    { key: "fat", label: "Fat", value: grams(recipe.perServing.fat), tone: "var(--color-macro-fat)" },
  ];

  // Gram split of the three macros already printed above — the bar visualises
  // those exact numbers, it does not introduce any new figure.
  const gramTotal =
    recipe.perServing.protein + recipe.perServing.carbs + recipe.perServing.fat;
  const splits =
    gramTotal > 0
      ? [
          { key: "protein", pct: (recipe.perServing.protein / gramTotal) * 100, tone: "var(--color-macro-protein)" },
          { key: "carbs", pct: (recipe.perServing.carbs / gramTotal) * 100, tone: "var(--color-macro-carbs)" },
          { key: "fat", pct: (recipe.perServing.fat / gramTotal) * 100, tone: "var(--color-macro-fat)" },
        ]
      : [];

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <SectionHeader as="h3" icon={ChefHat} eyebrow="Recipe" title={recipe.title} />

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge variant="neutral" size="sm" className="tabular-nums">
          <Clock className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
          {recipe.minutes} min
        </Badge>
        <Badge variant="neutral" size="sm" className="tabular-nums">
          <Users className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
          {recipe.servings} serving{recipe.servings === 1 ? "" : "s"}
        </Badge>
        <Badge variant="default" size="sm" className="capitalize">
          {recipe.meal}
        </Badge>
        {tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="info" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-surface-subtle p-2.5 ring-1 ring-inset ring-hairline">
        <p className="px-0.5 text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
          per serving
        </p>
        <ul className="mt-1.5 grid grid-cols-4 gap-1">
          {macros.map((macro) => (
            <li
              key={macro.key}
              className="min-w-0 rounded-xl bg-surface px-1 py-2 text-center ring-1 ring-inset ring-hairline"
            >
              <p
                className="truncate text-sm font-black tabular-nums"
                style={{ color: macro.tone }}
              >
                {macro.value}
              </p>
              <p className="mt-0.5 truncate text-[0.625rem] font-black uppercase tracking-wide text-ink-subtle">
                {macro.label}
              </p>
            </li>
          ))}
        </ul>
        {splits.length > 0 && (
          <div
            role="img"
            aria-label={`Macro split by weight: ${grams(recipe.perServing.protein)} protein, ${grams(recipe.perServing.carbs)} carbs, ${grams(recipe.perServing.fat)} fat per serving`}
            className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
          >
            {splits.map((split) => (
              <span
                key={split.key}
                className="h-full transition-[width] duration-700 ease-out-soft"
                style={{ width: `${split.pct}%`, backgroundColor: split.tone }}
              />
            ))}
          </div>
        )}
      </div>

      <details className="group mt-3 rounded-2xl bg-surface-muted ring-1 ring-inset ring-hairline">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-2xl px-3 py-2.5 text-xs font-black uppercase tracking-wider text-ink-muted [&::-webkit-details-marker]:hidden hover:text-primary-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600">
          Ingredients ({ingredients.length})
          <ChevronRight
            aria-hidden="true"
            strokeWidth={2.5}
            className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-open:rotate-90"
          />
        </summary>
        <div className="px-3 pb-3">
          {ingredients.length === 0 ? (
            <p className="text-sm font-semibold text-ink-muted">No ingredients listed.</p>
          ) : (
            <ul className="divide-y divide-hairline">
              {ingredients.map((ing, i) => (
                <li
                  key={`${ing.item}-${i}`}
                  className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
                >
                  <span className="min-w-0 font-semibold text-ink">{ing.item}</span>
                  <span className="shrink-0 text-xs font-black tabular-nums text-ink-muted">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

      {steps.length > 0 && (
        <ol className="mt-3 max-h-48 list-none space-y-2 overflow-y-auto pr-1">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm font-semibold leading-5 text-ink-muted">
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[0.625rem] font-black tabular-nums text-primary-700 ring-1 ring-inset ring-primary-100">
                {i + 1}
              </span>
              <span className="min-w-0">{step}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="fw-artifact-actions mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          aria-label={`Log ${recipe.title} as a ${slot} meal`}
          onClick={() =>
            onAction({
              kind: "invoke_tool",
              name: "log_recipe_as_meal",
              input: { recipe_id: recipe.id, servings: 1, meal_slot: slot },
            })
          }
        >
          <UtensilsCrossed className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          Log as meal
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label={`Add ${recipe.title} ingredients to grocery list`}
          onClick={() =>
            onAction({
              kind: "invoke_tool",
              name: "add_recipe_to_grocery_list",
              input: { recipe_id: recipe.id },
            })
          }
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          Add to grocery list
        </Button>
      </div>
    </Card>
  );
}
