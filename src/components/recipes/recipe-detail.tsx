"use client";

import { useEffect } from "react";
import { Clock, Users, X } from "lucide-react";
import { PreferenceToggle } from "@/components/food/preference-toggle";
import type { Recipe } from "@/lib/recipes-data";

/**
 * Recipe detail modal: full ingredient list with measurements, the steps, and
 * complete per-serving nutrition plus serving count. Closes on backdrop click
 * or Escape.
 */
export function RecipeDetail({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const nutrition: { label: string; value: string }[] = [
    { label: "Calories", value: `${recipe.perServing.calories}` },
    { label: "Protein", value: `${recipe.perServing.protein}g` },
    { label: "Carbs", value: `${recipe.perServing.carbs}g` },
    { label: "Fat", value: `${recipe.perServing.fat}g` },
    { label: "Fiber", value: `${recipe.perServing.fiber}g` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={recipe.title}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600">
                {recipe.meal}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {recipe.minutes} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings}{" "}
                {recipe.servings === 1 ? "serving" : "servings"}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold leading-snug text-neutral-900">
              {recipe.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <PreferenceToggle id={recipe.id} size="sm" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close recipe"
              className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Per serving
            </h3>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {nutrition.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2 text-center"
                >
                  <p className="text-sm font-semibold tabular-nums text-neutral-900">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-neutral-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Ingredients
            </h3>
            <ul className="mt-2 divide-y divide-neutral-100">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={`${ing.item}-${i}`}
                  className="flex items-baseline justify-between gap-4 py-2 text-sm"
                >
                  <span className="text-neutral-800">{ing.item}</span>
                  <span className="shrink-0 font-medium tabular-nums text-neutral-500">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Steps
            </h3>
            <ol className="mt-2 space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                    {i + 1}
                  </span>
                  <span className="text-neutral-700">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
