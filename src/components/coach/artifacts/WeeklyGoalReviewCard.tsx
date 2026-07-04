"use client";

import { CalendarCheck } from "lucide-react";
import type { MacroTargets } from "@/lib/fuelwell-data";
import type { ArtifactCardProps } from "./contract";

type WeeklyGoalReviewArtifact = {
  id: string;
  type: "weekly_goal_review";
  summary: string;
  targets: MacroTargets;
  evidence: string[];
  recommendation: string;
};

export function WeeklyGoalReviewCard({ artifact }: ArtifactCardProps<WeeklyGoalReviewArtifact>) {
  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <CalendarCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
            Weekly goal review
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-neutral-900">
            {artifact.summary}
          </p>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-600">
        Current target: {artifact.targets.calories} kcal · {artifact.targets.protein}g protein ·{" "}
        {artifact.targets.carbs}g carbs · {artifact.targets.fat}g fat
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-xs font-medium leading-5 text-neutral-500">
        {artifact.evidence.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-bold leading-5 text-neutral-700">
        {artifact.recommendation}
      </p>
    </div>
  );
}
