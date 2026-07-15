"use client";

import { useState } from "react";
import { ChevronDown, Flame, Wheat, Droplet, Beef } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  percentOf,
  remaining,
  sumMealItems,
  type MacroTargets,
  type MacroTotals,
  type MealRecord,
} from "@/lib/fuelwell-data";

const MACROS: {
  key: keyof MacroTotals;
  label: string;
  unit: string;
  color: string;
  iconBg: string;
  icon: typeof Flame;
}[] = [
  { key: "calories", label: "Calories", unit: "", color: "var(--color-macro-calories)", iconBg: "bg-primary-100 text-primary-700", icon: Flame },
  { key: "protein", label: "Protein", unit: "g", color: "var(--color-macro-protein)", iconBg: "bg-sky-100 text-sky-700", icon: Beef },
  { key: "carbs", label: "Carbs", unit: "g", color: "var(--color-macro-carbs)", iconBg: "bg-lemon-100 text-lemon-700", icon: Wheat },
  { key: "fat", label: "Fat", unit: "g", color: "var(--color-macro-fat)", iconBg: "bg-accent-100 text-accent-700", icon: Droplet },
];

/**
 * Live totals against targets. Reads from the shared day log via props so it
 * updates the instant a meal is added, edited, or removed. Framing stays
 * neutral and forward-looking ("left" / "logged"), never "missed" or "over".
 * Each macro row expands to show which of today's meals contributed to it.
 */
export function TotalsSummary({
  totals,
  targets,
  meals = [],
}: {
  totals: MacroTotals;
  targets: MacroTargets;
  meals?: MealRecord[];
}) {
  const [expanded, setExpanded] = useState<keyof MacroTotals | null>(null);

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-[#16302a]">Today&apos;s totals</h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          Live macro math for the selected day. Tap a macro for the meal
          breakdown.
        </p>
      </div>
      <div className="space-y-4">
        {MACROS.map((macro) => {
          const current = totals[macro.key];
          const target = targets[macro.key];
          const pct = Math.min(100, percentOf(current, target));
          const left = remaining(current, target);
          const Icon = macro.icon;
          const isExpanded = expanded === macro.key;
          const contributions = meals
            .map((meal) => ({
              id: meal.id,
              name: meal.name,
              amount: Math.round(sumMealItems(meal.items)[macro.key]),
            }))
            .filter((entry) => entry.amount > 0);
          return (
            <div key={macro.key} className="rounded-[1.2rem] bg-[#f7faf8] p-3">
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : macro.key)}
                aria-expanded={isExpanded}
                aria-label={`${macro.label} breakdown`}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[0.9rem] ${macro.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-black text-muted-foreground">
                    {macro.label}
                  </p>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>
                <div className="text-right">
                  <p className="text-xl font-black tabular-nums text-[#16302a]">
                    {current.toLocaleString()}
                    {macro.unit}
                    <span className="mx-1 text-muted-foreground">/</span>
                    <span className="text-base text-[#60776f]">
                      {target.toLocaleString()}
                      {macro.unit}
                    </span>
                  </p>
                  <p className="text-xs font-black tabular-nums text-muted-foreground">
                    {left.toLocaleString()}
                    {macro.unit} left
                  </p>
                </div>
              </button>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: macro.color }}
                />
              </div>
              {isExpanded && (
                <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {contributions.length > 0 ? (
                    contributions.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-3 rounded-[0.8rem] bg-white px-3 py-2"
                      >
                        <p className="min-w-0 truncate text-sm font-bold text-muted-foreground">
                          {entry.name}
                        </p>
                        <p className="shrink-0 text-sm font-black tabular-nums text-[#16302a]">
                          {entry.amount.toLocaleString()}
                          {macro.unit}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="px-1 text-sm font-semibold text-muted-foreground">
                      Nothing logged toward {macro.label.toLowerCase()} yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
