"use client";

import { Activity, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
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
        <Metric label="kcal left" value={`${Math.round(artifact.remaining.calories)}`} />
        <Metric label="protein" value={grams(artifact.remaining.protein)} />
        <Metric label="carbs" value={grams(artifact.remaining.carbs)} />
        <Metric label="fat" value={grams(artifact.remaining.fat)} />
      </div>

      <p className="mt-3 rounded-[1.15rem] bg-surface px-3 py-2.5 text-sm font-bold leading-5 text-ink shadow-e1">
        {artifact.guidance.nextMeal}
      </p>

      <div className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-ink-muted">
        <Activity
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700"
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1rem] bg-surface px-2 py-2.5 text-center ring-1 ring-inset ring-primary-100">
      <p className="truncate text-base font-black tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 truncate text-[0.625rem] font-bold uppercase text-ink-subtle">
        {label}
      </p>
    </div>
  );
}
