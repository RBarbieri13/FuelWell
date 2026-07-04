"use client";

import { Activity, Target } from "lucide-react";
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
    <div className="max-w-full rounded-2xl border border-primary-100 bg-primary-50/50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm">
          <Target className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-primary-700">
            Active goal
          </p>
          <h3 className="mt-0.5 text-base font-black capitalize text-neutral-950">
            {goal.primaryGoal} · {goal.trainingPriority}
          </h3>
          <p className="mt-1 text-sm font-medium leading-5 text-neutral-600">
            {artifact.guidance.headline}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 text-center">
        <Metric label="kcal left" value={`${Math.round(artifact.remaining.calories)}`} />
        <Metric label="protein" value={grams(artifact.remaining.protein)} />
        <Metric label="carbs" value={grams(artifact.remaining.carbs)} />
        <Metric label="fat" value={grams(artifact.remaining.fat)} />
      </div>

      <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm font-bold leading-5 text-neutral-700">
        {artifact.guidance.nextMeal}
      </p>

      <div className="mt-3 flex items-start gap-2 text-xs font-medium text-neutral-500">
        <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700" />
        <p>
          {artifact.guidance.sourceNote}
          {artifact.integration?.status === "preview_sample" ? " Preview sample only." : ""}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-1 py-2">
      <p className="text-sm font-black text-neutral-950">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
    </div>
  );
}
