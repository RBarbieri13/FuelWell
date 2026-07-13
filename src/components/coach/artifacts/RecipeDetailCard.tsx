"use client";

import { Clock, ShoppingCart, Users, UtensilsCrossed } from "lucide-react";
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-500">
        Recipe not found.
      </div>
    );
  }
  const slot = SLOT_BY_MEAL[recipe.meal?.toLowerCase()] ?? "dinner";
  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-base font-black text-neutral-900">{recipe.title}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Chip icon={<Clock className="h-3 w-3" />} text={`${recipe.minutes} min`} />
        <Chip
          icon={<Users className="h-3 w-3" />}
          text={`${recipe.servings} serving${recipe.servings === 1 ? "" : "s"}`}
        />
        <Chip text={recipe.meal} />
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-1 text-center">
        <Macro label="kcal" value={`${Math.round(recipe.perServing.calories)}`} />
        <Macro label="Protein" value={grams(recipe.perServing.protein)} />
        <Macro label="Carbs" value={grams(recipe.perServing.carbs)} />
        <Macro label="Fat" value={grams(recipe.perServing.fat)} />
      </ul>
      <p className="mt-1 text-center text-[10px] font-bold text-neutral-400">
        per serving
      </p>

      <details className="mt-3 rounded-2xl bg-neutral-50 p-3">
        <summary className="cursor-pointer text-xs font-black uppercase tracking-wider text-neutral-500">
          Ingredients ({ingredients.length})
        </summary>
        {ingredients.length === 0 ? (
          <p className="mt-2 text-sm font-medium text-neutral-500">
            No ingredients listed.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {ingredients.map((ing, i) => (
              <li
                key={`${ing.item}-${i}`}
                className="flex items-baseline justify-between gap-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-neutral-800">
                  {ing.item}
                </span>
                <span className="shrink-0 text-xs font-bold text-neutral-400">
                  {ing.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>

      {steps.length > 0 && (
        <ol className="mt-3 max-h-48 list-none space-y-2 overflow-y-auto pr-1">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm font-medium leading-5 text-neutral-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-black text-neutral-500">
                {i + 1}
              </span>
              <span className="min-w-0">{step}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="fw-artifact-actions mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label={`Log ${recipe.title} as a ${slot} meal`}
          onClick={() =>
            onAction({
              kind: "invoke_tool",
              name: "log_recipe_as_meal",
              input: { recipe_id: recipe.id, servings: 1, meal_slot: slot },
            })
          }
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-black text-white transition hover:bg-neutral-700"
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Log as meal
        </button>
        <button
          type="button"
          aria-label={`Add ${recipe.title} ingredients to grocery list`}
          onClick={() =>
            onAction({
              kind: "invoke_tool",
              name: "add_recipe_to_grocery_list",
              input: { recipe_id: recipe.id },
            })
          }
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-black text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Add to grocery list
        </button>
      </div>
    </div>
  );
}

function Chip({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-500">
      {icon}
      {text}
    </span>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-xl bg-neutral-50 px-1 py-2">
      <p className="text-sm font-black text-neutral-900">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
    </li>
  );
}
