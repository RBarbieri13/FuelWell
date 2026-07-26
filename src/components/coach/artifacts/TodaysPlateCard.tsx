"use client";

import { UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
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

const SPLIT: Array<{ key: "protein" | "carbs" | "fat"; label: string; color: string }> = [
  { key: "protein", label: "Protein", color: "var(--color-macro-protein)" },
  { key: "carbs", label: "Carbs", color: "var(--color-macro-carbs)" },
  { key: "fat", label: "Fat", color: "var(--color-macro-fat)" },
];

export function TodaysPlateCard({
  artifact,
  onAction,
}: ArtifactCardProps<TodaysPlateArtifact>) {
  const meals = artifact.meals ?? [];
  const totals = artifact.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = artifact.targets ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const gramTotal = totals.protein + totals.carbs + totals.fat;
  const splitShares = SPLIT.map((part) => ({
    ...part,
    grams: totals[part.key],
    percent: gramTotal > 0 ? Math.round((totals[part.key] / gramTotal) * 100) : 0,
  }));

  return (
    <Card padding="sm" className="max-w-full">
      <SectionHeader
        as="h3"
        icon={UtensilsCrossed}
        title="Today's plate"
        action={
          meals.length > 0 ? (
            <Badge variant="neutral" size="sm" className="tabular-nums">
              {`${meals.length} logged`}
            </Badge>
          ) : undefined
        }
      />

      {meals.length === 0 ? (
        <EmptyState
          size="inline"
          icon={UtensilsCrossed}
          title="Nothing logged yet today."
          description="Log a meal and it lands here with its macros."
        />
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => {
            const share =
              totals.calories > 0
                ? Math.round((meal.macros.calories / totals.calories) * 100)
                : null;
            return (
              <li key={meal.id} className="min-w-0">
                <button
                  type="button"
                  aria-label={`Tell me about my ${meal.slot}: ${meal.name}`}
                  onClick={() =>
                    onAction({
                      kind: "send_message",
                      text: `Tell me about my ${meal.slot}`,
                    })
                  }
                  className="fw-press flex min-h-11 w-full min-w-0 flex-col items-start rounded-[1.15rem] bg-surface-muted px-3 py-2.5 text-left ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:ring-primary-200 active:bg-primary-100"
                >
                  <span className="text-[0.625rem] font-black uppercase tracking-[0.08em] text-ink-muted">
                    {meal.slot}
                  </span>
                  <span className="mt-0.5 w-full truncate text-sm font-bold text-ink">
                    {meal.name}
                  </span>
                  <span className="w-full truncate text-xs font-semibold tabular-nums text-ink-muted">
                    {`${Math.round(meal.macros.calories)} kcal · ${grams(meal.macros.protein)} P`}
                  </span>
                  {share !== null && (
                    /* Each meal against the day's total — a kcal figure alone
                       does not say whether it was a snack or the main event. */
                    <span className="mt-1.5 flex w-full items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-sunken"
                      >
                        <span
                          className="block h-full rounded-full bg-primary-400"
                          style={{ width: `${Math.min(share, 100)}%` }}
                        />
                      </span>
                      <span className="shrink-0 text-[0.625rem] font-bold tabular-nums text-ink-muted">
                        {`${share}% of day`}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {gramTotal > 0 && (
        <div className="mt-4 rounded-[1.15rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline">
          <p className="text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-muted">
            Macro split by grams
          </p>
          <div
            className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-hairline-strong"
            role="img"
            aria-label={`Macro split by grams: ${splitShares
              .map((part) => `${part.label} ${part.percent} percent, ${Math.round(part.grams)} grams`)
              .join("; ")}`}
          >
            {splitShares.map((part) => (
              <span
                key={part.key}
                className="h-full ring-1 ring-inset ring-white/30 transition-[width] duration-700 ease-out-soft"
                style={{ width: `${part.percent}%`, backgroundColor: part.color }}
              />
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {splitShares.map((part) => (
              <li
                key={part.key}
                className="flex min-w-0 items-center gap-1.5 text-[0.6875rem] font-bold text-ink-muted"
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
                  style={{ backgroundColor: part.color }}
                />
                <span className="truncate tabular-nums">
                  {`${part.label} ${part.percent}%`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-hairline pt-4">
        <BudgetBar
          label="Calories"
          unit=" kcal"
          current={totals.calories}
          target={targets.calories}
          color="var(--color-macro-calories)"
        />
        <BudgetBar
          label="Protein"
          unit="g"
          current={totals.protein}
          target={targets.protein}
          color="var(--color-macro-protein)"
        />
        <BudgetBar
          label="Carbs"
          unit="g"
          current={totals.carbs}
          target={targets.carbs}
          color="var(--color-macro-carbs)"
        />
        <BudgetBar
          label="Fat"
          unit="g"
          current={totals.fat}
          target={targets.fat}
          color="var(--color-macro-fat)"
        />
      </div>
    </Card>
  );
}

function BudgetBar({
  label,
  unit,
  current,
  target,
  color,
}: {
  label: string;
  unit: string;
  current: number;
  target: number;
  color: string;
}) {
  const fmt = (n: number) =>
    unit === "g" ? `${Math.round(n * 10) / 10}` : `${Math.round(n)}`;
  const over = target > 0 && current > target;
  const pct = target > 0 ? Math.round((current / target) * 100) : null;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-[0.6875rem]">
        <span className="min-w-0 truncate font-black uppercase tracking-[0.08em] text-ink-muted">
          {label}
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span
            className={
              over
                ? "font-black tabular-nums text-accent-700"
                : "font-bold tabular-nums text-ink"
            }
          >
            {`${fmt(current)} / ${fmt(target)}${unit}`}
          </span>
          {/* Fixed-width percentage column so all four rows share one axis. */}
          <span
            className={
              over
                ? "w-10 text-right font-black tabular-nums text-accent-700"
                : "w-10 text-right font-bold tabular-nums text-ink-muted"
            }
          >
            {pct === null ? "—" : `${pct}%`}
          </span>
        </span>
      </div>
      <ProgressMeter
        className="mt-1.5"
        size="sm"
        value={current}
        target={target}
        color={color}
        label={`${label}: ${fmt(current)}${unit} of ${fmt(target)}${unit}${over ? ", over target" : ""}`}
      />
    </div>
  );
}
