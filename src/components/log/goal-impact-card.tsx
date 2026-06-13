"use client";

import { Target } from "lucide-react";
import type { MealGoalImpact } from "@/lib/goal-context";

export function GoalImpactCard({ impact }: { impact: MealGoalImpact }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm">
          <Target className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary-700">
            Goal impact · {impact.confidence}
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-neutral-900">
            {impact.headline}
          </p>
          <p className="mt-1 text-sm font-medium leading-5 text-neutral-600">
            {impact.nextAction}
          </p>
          <p className="mt-2 text-xs font-medium leading-5 text-neutral-500">
            {impact.sourceNote}
          </p>
        </div>
      </div>
    </div>
  );
}
