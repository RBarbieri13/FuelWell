"use client";

import { Check, Undo2 } from "lucide-react";
import type { MealGoalImpact } from "@/lib/goal-context";
import type { ArtifactCardProps } from "./contract";

type MealLoggedArtifact = {
  id: string;
  type: "meal_logged";
  meal: {
    id: string;
    slot: string;
    name: string;
    macros: { calories: number; protein: number; carbs: number; fat: number };
  };
  remaining: { calories: number; protein: number };
  goalImpact?: MealGoalImpact;
  undoable?: boolean;
  updated?: boolean;
};

const grams = (n: number) => `${Math.round(n * 10) / 10}g`;

export function MealLoggedCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealLoggedArtifact>) {
  const { meal, remaining } = artifact;
  if (!meal) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-500">
        No meal data to show.
      </div>
    );
  }
  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Check className="h-4 w-4" />
          </span>
          <p className="truncate text-sm font-black text-neutral-900">{meal.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {artifact.updated && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-700">
              Updated
            </span>
          )}
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-neutral-500">
            {meal.slot}
          </span>
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-1 text-center">
        <Macro label="kcal" value={`${Math.round(meal.macros.calories)}`} />
        <Macro label="Protein" value={grams(meal.macros.protein)} />
        <Macro label="Carbs" value={grams(meal.macros.carbs)} />
        <Macro label="Fat" value={grams(meal.macros.fat)} />
      </ul>

      <p className="mt-3 text-xs font-bold text-neutral-500">
        Left today: {Math.round(remaining?.calories ?? 0)} kcal,{" "}
        {grams(remaining?.protein ?? 0)} protein
      </p>

      {artifact.goalImpact && (
        <div className="mt-3 rounded-2xl bg-primary-50 px-3 py-2">
          <p className="text-xs font-black uppercase tracking-wide text-primary-700">
            Goal impact · {artifact.goalImpact.confidence}
          </p>
          <p className="mt-1 text-sm font-bold leading-5 text-neutral-800">
            {artifact.goalImpact.headline}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-neutral-500">
            {artifact.goalImpact.nextAction} {artifact.goalImpact.sourceNote}
          </p>
        </div>
      )}

      {artifact.undoable && (
        <button
          type="button"
          aria-label={`Undo logging ${meal.name}`}
          onClick={() =>
            onAction({ kind: "invoke_tool", name: "undo_last_action", input: {} })
          }
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-black text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </button>
      )}
    </div>
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
