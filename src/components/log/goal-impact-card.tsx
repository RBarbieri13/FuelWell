"use client";

import { Target } from "lucide-react";
import type { MealGoalImpact } from "@/lib/goal-context";

export function GoalImpactCard({ impact }: { impact: MealGoalImpact }) {
  return (
    <div className="rounded-[1.35rem] border border-primary-100 bg-primary-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-sm">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-700">
            Goal impact · {impact.confidence}
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-[#16302a]">
            {impact.headline}
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-muted-foreground">
            {impact.nextAction}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">
            {impact.sourceNote}
          </p>
        </div>
      </div>
    </div>
  );
}
