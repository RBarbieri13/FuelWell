"use client";

import type { ArtifactCardProps } from "./contract";

type PlateMeal = {
  id: string;
  slot: string;
  name: string;
  macros: { calories: number; protein: number; carbs: number; fat: number };
};

type TodaysPlateArtifact = {
  id: string;
  type: "todays_plate";
  meals: PlateMeal[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories: number; protein: number; carbs: number; fat: number };
};

const grams = (n: number) => `${Math.round(n * 10) / 10}g`;

export function TodaysPlateCard({
  artifact,
  onAction,
}: ArtifactCardProps<TodaysPlateArtifact>) {
  const meals = artifact.meals ?? [];
  const totals = artifact.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = artifact.targets ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
        Today&apos;s plate
      </p>

      {meals.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          Nothing logged yet today.
        </p>
      ) : (
        <ul className="-mx-1 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
          {meals.map((meal) => (
            <li key={meal.id} className="snap-start">
              <button
                type="button"
                aria-label={`Tell me about my ${meal.slot}: ${meal.name}`}
                onClick={() =>
                  onAction({
                    kind: "send_message",
                    text: `Tell me about my ${meal.slot}`,
                  })
                }
                className="flex min-h-10 w-36 flex-col items-start rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition hover:border-primary-300 hover:bg-primary-50/60"
              >
                <span className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
                  {meal.slot}
                </span>
                <span className="w-full truncate text-sm font-bold text-neutral-900">
                  {meal.name}
                </span>
                <span className="text-xs font-medium text-neutral-500">
                  {Math.round(meal.macros.calories)} kcal · {grams(meal.macros.protein)} P
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2">
        <BudgetBar
          label="kcal"
          unit=" kcal"
          current={totals.calories}
          target={targets.calories}
          barClass="bg-primary-500"
        />
        <BudgetBar
          label="Protein"
          unit="g"
          current={totals.protein}
          target={targets.protein}
          barClass="bg-macro-protein"
        />
        <BudgetBar
          label="Carbs"
          unit="g"
          current={totals.carbs}
          target={targets.carbs}
          barClass="bg-macro-carbs"
        />
        <BudgetBar
          label="Fat"
          unit="g"
          current={totals.fat}
          target={targets.fat}
          barClass="bg-red-500"
        />
      </div>
    </div>
  );
}

function BudgetBar({
  label,
  unit,
  current,
  target,
  barClass,
}: {
  label: string;
  unit: string;
  current: number;
  target: number;
  barClass: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const fmt = (n: number) =>
    unit === "g" ? `${Math.round(n * 10) / 10}` : `${Math.round(n)}`;
  return (
    <div
      role="img"
      aria-label={`${label}: ${fmt(current)}${unit} of ${fmt(target)}${unit}`}
    >
      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500">
        <span className="uppercase tracking-wide">{label}</span>
        <span>
          {fmt(current)} / {fmt(target)}
          {unit}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
