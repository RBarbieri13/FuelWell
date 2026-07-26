"use client";

import { useEffect, useState } from "react";
import { ChefHat, ChevronRight, Clock, ListOrdered, ShoppingCart, Users, UtensilsCrossed } from "lucide-react";
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

/**
 * Canonical macro palette, shared verbatim by every coach card that shows a
 * macro. `MACRO_FILL` is the bright chart tone — bars, dots, rings, where
 * contrast rules do not apply. `MACRO_TEXT` is the darker step used whenever
 * the same macro is rendered as a figure, so each number clears 4.5:1.
 */
const MACRO_FILL = {
  protein: "var(--color-macro-protein)",
  carbs: "var(--color-macro-carbs)",
  fat: "var(--color-macro-fat)",
} as const;

const MACRO_TEXT = {
  calories: "var(--color-primary-800)",
  protein: "var(--color-sky-700)",
  carbs: "var(--color-lemon-700)",
  fat: "var(--color-accent-700)",
} as const;

type Split = { key: string; label: string; grams: number; pct: number; tone: string };

/**
 * Share-of-weight strip for the three macros printed directly above it. It
 * visualises those exact grams — no new figure — and carries its own legend
 * with the percentages, so the bar is a readable chart rather than decoration.
 * Widths ease in on mount; the global reduced-motion rule flattens that.
 */
function MacroSplitBar({ splits }: { splits: Split[] }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mt-2.5">
      <div
        role="img"
        aria-label={`Macro split by weight per serving: ${splits
          .map((split) => `${grams(split.grams)} ${split.label.toLowerCase()}, ${Math.round(split.pct)} percent`)
          .join("; ")}`}
        className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-surface-sunken"
      >
        {splits.map((split) => (
          <span
            key={split.key}
            className="h-full first:rounded-l-full last:rounded-r-full transition-[width] duration-700 ease-out-soft"
            style={{
              width: grown ? `${split.pct}%` : "0%",
              backgroundColor: split.tone,
            }}
          />
        ))}
      </div>
      <ul
        aria-hidden="true"
        className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1"
      >
        {splits.map((split) => (
          <li
            key={split.key}
            className="flex items-center gap-1.5 text-[0.625rem] font-black uppercase tracking-wide text-ink-muted"
          >
            <span
              className="h-1.5 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: split.tone }}
            />
            <span className="min-w-0 truncate">{split.label}</span>
            <span className="shrink-0 tabular-nums text-ink-muted">
              {Math.round(split.pct)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    { key: "kcal", label: "kcal", value: `${Math.round(recipe.perServing.calories)}`, tone: MACRO_TEXT.calories },
    { key: "protein", label: "Protein", value: grams(recipe.perServing.protein), tone: MACRO_TEXT.protein },
    { key: "carbs", label: "Carbs", value: grams(recipe.perServing.carbs), tone: MACRO_TEXT.carbs },
    { key: "fat", label: "Fat", value: grams(recipe.perServing.fat), tone: MACRO_TEXT.fat },
  ];

  // Gram split of the three macros already printed above — the bar visualises
  // those exact numbers, it does not introduce any new figure.
  const gramTotal =
    recipe.perServing.protein + recipe.perServing.carbs + recipe.perServing.fat;
  const splits: Split[] =
    gramTotal > 0
      ? [
          { key: "protein", label: "Protein", grams: recipe.perServing.protein, pct: (recipe.perServing.protein / gramTotal) * 100, tone: MACRO_FILL.protein },
          { key: "carbs", label: "Carbs", grams: recipe.perServing.carbs, pct: (recipe.perServing.carbs / gramTotal) * 100, tone: MACRO_FILL.carbs },
          { key: "fat", label: "Fat", grams: recipe.perServing.fat, pct: (recipe.perServing.fat / gramTotal) * 100, tone: MACRO_FILL.fat },
        ].filter((split) => split.pct > 0)
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
          <Badge key={tag} variant="info" size="sm" className="max-w-full">
            <span className="min-w-0 truncate">{tag}</span>
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge variant="neutral" size="sm" className="tabular-nums">
            +{tags.length - 3}
          </Badge>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-surface-subtle p-2.5 ring-1 ring-inset ring-hairline">
        <p className="px-0.5 text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-muted">
          per serving
        </p>
        <ul className="mt-1.5 grid grid-cols-4 gap-1">
          {macros.map((macro) => (
            <li
              key={macro.key}
              className="flex min-h-11 min-w-0 flex-col items-center justify-center rounded-xl bg-surface px-1 py-2 text-center ring-1 ring-inset ring-hairline"
            >
              {/* Never truncated: at 320px these wrap instead of clipping. */}
              <p
                className="w-full text-sm font-black leading-tight tabular-nums"
                style={{ color: macro.tone }}
              >
                {macro.value}
              </p>
              <p className="mt-0.5 w-full truncate text-[0.625rem] font-black uppercase tracking-wide text-ink-muted">
                {macro.label}
              </p>
            </li>
          ))}
        </ul>
        {splits.length > 0 && <MacroSplitBar splits={splits} />}
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
        <section className="mt-3">
          <h4 className="flex items-center gap-1.5 px-1 text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-muted">
            <ListOrdered
              aria-hidden="true"
              strokeWidth={2.25}
              className="h-3.5 w-3.5 shrink-0 text-ink-faint"
            />
            Steps ({steps.length})
          </h4>
          <ol className="mt-1.5 max-h-48 list-none space-y-2 overflow-y-auto overscroll-contain pr-1">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm font-semibold leading-5 text-ink-muted">
                <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[0.625rem] font-black tabular-nums text-primary-700 ring-1 ring-inset ring-primary-100">
                  {i + 1}
                </span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        </section>
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
