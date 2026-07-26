"use client";

import { Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MealGoalImpact } from "@/lib/goal-context";

const CONFIDENCE_LABEL: Record<MealGoalImpact["confidence"], string> = {
  exact: "Exact match",
  database: "Verified match",
  estimate: "Estimate",
  manual: "Manual entry",
};

/**
 * How trustworthy the macros behind this impact are. Estimates and manual
 * entries are tinted differently from database matches so a soft number never
 * reads with the same authority as a verified one.
 */
const CONFIDENCE_TONE: Record<
  MealGoalImpact["confidence"],
  { plate: string; dot: string; text: string }
> = {
  exact: {
    plate: "bg-primary-50 text-primary-700 ring-primary-100",
    dot: "bg-primary-500",
    text: "text-primary-700",
  },
  database: {
    plate: "bg-primary-50 text-primary-700 ring-primary-100",
    dot: "bg-primary-500",
    text: "text-primary-700",
  },
  estimate: {
    plate: "bg-lemon-50 text-lemon-700 ring-lemon-200",
    dot: "bg-lemon-500",
    text: "text-lemon-700",
  },
  manual: {
    plate: "bg-surface-muted text-ink-muted ring-hairline-strong",
    dot: "bg-ink-faint",
    text: "text-ink-muted",
  },
};

export function GoalImpactCard({ impact }: { impact: MealGoalImpact }) {
  const tone = CONFIDENCE_TONE[impact.confidence];

  return (
    // Nested inside an elevated card, so this panel takes an inset ring rather
    // than a second drop shadow — one depth per layer.
    <div className="rounded-[1.35rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline-strong">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] ring-1 ring-inset",
            tone.plate
          )}
        >
          <Target className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              "flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em]",
              tone.text
            )}
          >
            <span
              aria-hidden="true"
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}
            />
            Goal impact · {CONFIDENCE_LABEL[impact.confidence]}
          </p>
          <p className="mt-1.5 text-sm font-black leading-5 text-ink">
            {impact.headline}
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-ink-muted">
            {impact.nextAction}
          </p>
          <p className="mt-2 border-t border-hairline pt-2 text-xs font-semibold leading-5 text-ink-subtle">
            {impact.sourceNote}
          </p>
        </div>
      </div>
    </div>
  );
}
