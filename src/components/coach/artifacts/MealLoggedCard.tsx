"use client";

import { Check, Undo2, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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

const CONFIDENCE_LABEL: Record<string, string> = {
  exact: "Exact match",
  database: "Verified match",
  estimate: "Estimate",
  manual: "Manual entry",
};

export function MealLoggedCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealLoggedArtifact>) {
  const { meal, remaining } = artifact;

  if (!meal) {
    return (
      <div className="max-w-full rounded-[24px] border border-hairline bg-surface p-2 shadow-e1">
        <EmptyState
          size="inline"
          icon={UtensilsCrossed}
          title="No meal data to show"
          description="This message arrived without the meal details attached."
        />
      </div>
    );
  }

  const caloriesLeft = Math.round(remaining?.calories ?? 0);
  const proteinLeft = remaining?.protein ?? 0;

  return (
    <div className="max-w-full rounded-[24px] border border-hairline bg-surface p-4 shadow-e2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
          >
            <Check className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              Meal logged
            </div>
            <p className="mt-0.5 text-sm font-black leading-5 text-ink [overflow-wrap:anywhere]">
              {meal.name}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {artifact.updated && (
            <Badge variant="success" size="sm">
              Updated
            </Badge>
          )}
          <Badge variant="neutral" size="sm" className="capitalize">
            {meal.slot}
          </Badge>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-4 gap-1.5">
        <Macro label="kcal" value={`${Math.round(meal.macros.calories)}`} />
        <Macro label="Protein" value={grams(meal.macros.protein)} />
        <Macro label="Carbs" value={grams(meal.macros.carbs)} />
        <Macro label="Fat" value={grams(meal.macros.fat)} />
      </ul>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[1rem] bg-surface-sunken px-3 py-2.5 ring-1 ring-inset ring-hairline">
        <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-muted">
          Left today
        </div>
        <span className="flex items-baseline gap-1">
          <span
            className={`text-sm font-black tabular-nums ${
              caloriesLeft < 0 ? "text-accent-600" : "text-ink"
            }`}
          >
            {caloriesLeft}
          </span>
          <span className="text-xs font-bold text-ink-muted">kcal</span>
        </span>
        <span className="flex items-baseline gap-1">
          <span
            className={`text-sm font-black tabular-nums ${
              proteinLeft < 0 ? "text-accent-600" : "text-ink"
            }`}
          >
            {grams(proteinLeft)}
          </span>
          <span className="text-xs font-bold text-ink-muted">protein</span>
        </span>
      </div>

      {artifact.goalImpact && (
        <div className="mt-3 rounded-[1rem] bg-primary-50 px-3 py-2.5 ring-1 ring-inset ring-primary-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              Goal impact
            </div>
            <Badge variant="default" size="sm" className="shrink-0">
              {CONFIDENCE_LABEL[artifact.goalImpact.confidence] ??
                artifact.goalImpact.confidence}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm font-bold leading-5 text-ink">
            {artifact.goalImpact.headline}
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">
            {artifact.goalImpact.nextAction} {artifact.goalImpact.sourceNote}
          </p>
        </div>
      )}

      {artifact.undoable && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label={`Undo logging ${meal.name}`}
          onClick={() =>
            onAction({ kind: "invoke_tool", name: "undo_last_action", input: {} })
          }
          className="mt-3 w-full text-xs sm:w-auto"
        >
          <Undo2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          Undo
        </Button>
      )}
    </div>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <li className="min-w-0 rounded-[0.9rem] bg-surface-muted px-1 py-2 text-center ring-1 ring-inset ring-hairline">
      <p className="text-sm font-black tabular-nums text-ink [overflow-wrap:anywhere]">
        {value}
      </p>
      <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </div>
    </li>
  );
}
