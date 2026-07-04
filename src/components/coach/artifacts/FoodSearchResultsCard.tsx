"use client";

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

export function FoodSearchResultsCard({
  artifact,
  onAction,
}: ArtifactCardProps<FoodSearchResultsArtifact>) {
  const foods = artifact.foods ?? [];

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
        Results for &ldquo;{artifact.query}&rdquo;
      </p>
      {foods.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          No foods found. Try another name.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-neutral-100">
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
                  className="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-primary-50/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900">
                      {food.name}
                    </p>
                    <p className="text-[11px] font-medium text-neutral-400">
                      {food.categoryLabel} · per 100{food.servingUnit}:{" "}
                      {Math.round(food.per100.kcal)} kcal, {grams(food.per100.protein)} P,{" "}
                      {grams(food.per100.carbs)} C, {grams(food.per100.fat)} F
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black text-neutral-500">
                    {portion} {food.servingUnit}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
