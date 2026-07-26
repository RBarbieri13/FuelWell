"use client";

import { CalendarCheck, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
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
  const targets = artifact.targets;
  const evidence = artifact.evidence ?? [];
  const cells: Array<{ label: string; value: string }> = [
    { label: "kcal", value: `${targets.calories}` },
    { label: "protein", value: `${targets.protein}g` },
    { label: "carbs", value: `${targets.carbs}g` },
    { label: "fat", value: `${targets.fat}g` },
  ];

  return (
    <Card padding="sm" className="max-w-full">
      <SectionHeader
        as="h3"
        icon={CalendarCheck}
        eyebrow="Weekly goal review"
        title={artifact.summary}
      />

      <div className="mt-4 rounded-[1.15rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline">
        <p className="text-[0.625rem] font-black uppercase text-ink-subtle">Current target</p>
        <div className="mt-2 grid grid-cols-2 gap-2 min-[380px]:grid-cols-4">
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="min-w-0 rounded-[0.9rem] bg-surface px-2 py-2 text-center ring-1 ring-inset ring-hairline"
            >
              <p className="truncate text-sm font-black tabular-nums text-ink">{cell.value}</p>
              <p className="mt-0.5 truncate text-[0.625rem] font-bold uppercase text-ink-subtle">
                {cell.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {evidence.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {evidence.map((item) => (
            <li key={item} className="flex gap-2 text-xs font-semibold leading-5 text-ink-muted">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300"
              />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-start gap-2.5 rounded-[1.15rem] bg-primary-50 px-3 py-2.5 ring-1 ring-inset ring-primary-100">
        <Lightbulb
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
          strokeWidth={2}
        />
        <p className="min-w-0 text-sm font-bold leading-5 text-primary-900">
          {artifact.recommendation}
        </p>
      </div>
    </Card>
  );
}
