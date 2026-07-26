"use client";

import { Activity, Target, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import type { GoalPlan, IntegrationDailySummary } from "@/lib/goal-context";
import type { MacroTotals } from "@/lib/fuelwell-data";
import type { ArtifactCardProps } from "./contract";

type GoalProgressArtifact = {
  id: string;
  type: "goal_progress";
  goalPlan: GoalPlan;
  remaining: MacroTotals;
  guidance: { headline: string; nextMeal: string; sourceNote: string };
  dataSources: string[];
  integration?: IntegrationDailySummary;
};

const grams = (n: number) => `${Math.round(n)}g`;

export function GoalProgressCard({ artifact }: ArtifactCardProps<GoalProgressArtifact>) {
  const goal = artifact.goalPlan;
  const targets = goal.macroTargets;
  const cells: Array<{
    key: keyof MacroTotals;
    label: string;
    value: string;
    unit: string;
    color: string;
  }> = [
    {
      key: "calories",
      label: "kcal left",
      value: `${Math.round(artifact.remaining.calories)}`,
      unit: "kcal",
      color: "var(--color-macro-calories)",
    },
    {
      key: "protein",
      label: "protein",
      value: grams(artifact.remaining.protein),
      unit: "g",
      color: "var(--color-macro-protein)",
    },
    {
      key: "carbs",
      label: "carbs",
      value: grams(artifact.remaining.carbs),
      unit: "g",
      color: "var(--color-macro-carbs)",
    },
    {
      key: "fat",
      label: "fat",
      value: grams(artifact.remaining.fat),
      unit: "g",
      color: "var(--color-macro-fat)",
    },
  ];

  return (
    <Card
      padding="sm"
      className="max-w-full border-primary-100 bg-primary-50/60 [&_h3]:capitalize"
    >
      <SectionHeader
        as="h3"
        icon={Target}
        eyebrow="Active goal"
        title={`${goal.primaryGoal} · ${goal.trainingPriority}`}
        description={artifact.guidance.headline}
      />

      <div className="mt-4 grid grid-cols-2 gap-2 min-[380px]:grid-cols-4">
        {cells.map((cell) => (
          <Metric
            key={cell.key}
            label={cell.label}
            value={cell.value}
            unit={cell.unit}
            left={artifact.remaining[cell.key]}
            target={targets?.[cell.key] ?? 0}
            color={cell.color}
          />
        ))}
      </div>

      <p className="mt-3 flex items-start gap-2.5 rounded-[1.15rem] bg-surface px-3 py-2.5 text-sm font-bold leading-5 text-ink ring-1 ring-inset ring-primary-100">
        <UtensilsCrossed
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
          strokeWidth={2}
        />
        <span className="min-w-0">{artifact.guidance.nextMeal}</span>
      </p>

      <div className="mt-3 flex items-start gap-2.5 text-xs font-semibold leading-5 text-ink-muted">
        <Activity
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
          strokeWidth={2}
        />
        <p className="min-w-0">
          {artifact.guidance.sourceNote}
          {artifact.integration?.status === "preview_sample" ? " Preview sample only." : ""}
        </p>
      </div>
    </Card>
  );
}

/**
 * Each cell pairs the remaining figure with how much of the day's budget that
 * actually is — a bare "42g" says nothing without the target behind it.
 */
function Metric({
  label,
  value,
  unit,
  left,
  target,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  left: number;
  target: number;
  color: string;
}) {
  const hasTarget = target > 0;
  const spent = Math.max(0, target - left);
  return (
    <div className="min-w-0 rounded-[1rem] bg-surface px-2 py-2.5 text-center ring-1 ring-inset ring-primary-100">
      <p className="truncate text-base font-black tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 truncate text-[0.625rem] font-bold uppercase text-ink-muted">
        {label}
      </p>
      {hasTarget && (
        <>
          <ProgressMeter
            className="mt-2"
            size="sm"
            value={spent}
            target={target}
            color={color}
            label={`${label}: ${Math.round(left)} ${unit} left of a ${Math.round(target)} ${unit} target`}
          />
          <p className="mt-1 truncate text-[0.625rem] font-bold tabular-nums text-ink-muted">
            {`of ${Math.round(target)}${unit === "g" ? "g" : ""}`}
          </p>
        </>
      )}
    </div>
  );
}
