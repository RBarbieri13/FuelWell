"use client";

import Link from "next/link";
import { ArrowRight, Beef, CheckCircle2, ChefHat, Clock, Flame, Wheat, Droplet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PreferenceToggle } from "@/components/food/preference-toggle";
import type { Recipe } from "@/lib/recipes-data";

/** "Already planned / logged today" badge data — links to the owning surface. */
export type RecipePlanStatus = { label: string; href: string };

/**
 * Recipe summary card: title, meal, time, per-serving calories + protein,
 * tags, and a like/dislike toggle. Clicking the body opens the detail view.
 *
 * There is no photography in the library, so the card's identity comes from a
 * tinted header plate, the display-weight title, and the macro chip row —
 * the chips are the only colour in the card and read as the recipe's shape.
 */
export function RecipeCard({
  recipe,
  onOpen,
  planStatus,
}: {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
  planStatus?: RecipePlanStatus | null;
}) {
  const macroTiles = [
    {
      label: "kcal",
      value: recipe.perServing.calories.toLocaleString(),
      tile: "bg-primary-50 ring-primary-100",
      glyph: "text-primary-600",
      icon: Flame,
    },
    {
      label: "Pro",
      value: `${recipe.perServing.protein}g`,
      tile: "bg-sky-50 ring-sky-100",
      glyph: "text-sky-600",
      icon: Beef,
    },
    {
      label: "Carb",
      value: `${recipe.perServing.carbs}g`,
      tile: "bg-lemon-50 ring-lemon-100",
      glyph: "text-lemon-600",
      icon: Wheat,
    },
    {
      label: "Fat",
      value: `${recipe.perServing.fat}g`,
      tile: "bg-accent-50 ring-accent-100",
      glyph: "text-accent-600",
      icon: Droplet,
    },
  ];

  return (
    <Card
      padding="none"
      className="group flex min-h-full flex-col overflow-hidden transition duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-e3"
    >
      {/* Tinted header plate — the card's only large colour field, so the
          title always lands on a designed surface instead of bare white. */}
      <div className="relative border-b border-hairline bg-gradient-to-br from-primary-50 via-surface-subtle to-surface px-5 pb-4 pt-4">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-white/70"
        />
        {planStatus && (
          <Link
            href={planStatus.href}
            className="mb-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-700 ring-1 ring-inset ring-sky-100 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            <span className="min-w-0 break-words">{planStatus.label}</span>
          </Link>
        )}
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpen(recipe)}
            className="fw-press min-w-0 flex-1 rounded-[1rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-black">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-primary-800 ring-1 ring-inset ring-primary-200/70">
                <ChefHat className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                {recipe.meal}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-ink-muted ring-1 ring-inset ring-hairline">
                <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                <span className="tabular-nums">{recipe.minutes}</span> min
              </span>
            </div>
            <h2 className="mt-3 break-words font-heading text-xl font-black leading-snug tracking-tight text-ink">
              {recipe.title}
            </h2>
          </button>
          <PreferenceToggle id={recipe.id} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <button
          type="button"
          onClick={() => onOpen(recipe)}
          aria-label={`Per serving: ${recipe.perServing.calories} calories, ${recipe.perServing.protein} grams protein, ${recipe.perServing.carbs} grams carbs, ${recipe.perServing.fat} grams fat`}
          className="fw-press w-full rounded-[1.1rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle">
            Per serving
          </span>
          {/* Two-up below 400px so a four-digit calorie count is never squeezed
              into a 40px column. */}
          <span className="mt-2 grid grid-cols-2 gap-1.5 min-[400px]:grid-cols-4 sm:gap-2">
            {macroTiles.map((macro) => {
              const Icon = macro.icon;
              return (
                <span
                  key={macro.label}
                  className={`block min-w-0 rounded-[1rem] px-2.5 py-2 ring-1 ring-inset sm:px-3 sm:py-2.5 ${macro.tile}`}
                >
                  <span
                    className={`flex flex-wrap items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] ${macro.glyph}`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                    {macro.label}
                  </span>
                  <span className="mt-1 block text-base font-black tabular-nums leading-6 text-ink sm:text-lg">
                    {macro.value}
                  </span>
                </span>
              );
            })}
          </span>
        </button>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="max-w-full break-words rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-ink-muted ring-1 ring-inset ring-hairline"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onOpen(recipe)}
          className="fw-press mt-auto inline-flex min-h-11 items-center justify-between gap-2 rounded-[1.1rem] bg-surface-muted px-4 py-3 text-sm font-black text-primary-800 ring-1 ring-inset ring-hairline transition group-hover:bg-primary-50 group-hover:ring-primary-100 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          Open recipe
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5"
            strokeWidth={2.25}
          />
        </button>
      </div>
    </Card>
  );
}
