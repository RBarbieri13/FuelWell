"use client";

import { CalendarCheck, Check, Lightbulb } from "lucide-react";
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
  // Same colour roles the macro charts use, so a target cell and its bar
  // elsewhere in the transcript are recognisably the same quantity.
  const cells: Array<{ label: string; value: string; color: string }> = [
    { label: "kcal", value: `${targets.calories}`, color: "var(--color-macro-calories)" },
    { label: "protein", value: `${targets.protein}g`, color: "var(--color-macro-protein)" },
    { label: "carbs", value: `${targets.carbs}g`, color: "var(--color-macro-carbs)" },
    { label: "fat", value: `${targets.fat}g`, color: "var(--color-macro-fat)" },
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
        <p className="text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-muted">
          Current target
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2 min-[380px]:grid-cols-4">
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="relative flex min-w-0 flex-col-reverse overflow-hidden rounded-[0.9rem] bg-surface px-2 py-2 text-center ring-1 ring-inset ring-hairline"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: cell.color }}
              />
              <dt className="mt-0.5 truncate text-[0.625rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                {cell.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-black tabular-nums text-ink">
                {cell.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {evidence.length > 0 && (
        <ul className="mt-4 space-y-2">
          {evidence.map((item) => (
            <li key={item} className="flex gap-2.5 text-xs font-semibold leading-5 text-ink-muted">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
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
