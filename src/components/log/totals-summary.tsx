"use client";

import { Card } from "@/components/ui/card";
import { percentOf, remaining, type MacroTargets, type MacroTotals } from "@/lib/fuelwell-data";

const MACROS: { key: keyof MacroTotals; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

/**
 * Live totals against targets. Reads from the shared day log via props so it
 * updates the instant a meal is added, edited, or removed. Framing stays
 * neutral and forward-looking ("left" / "logged"), never "missed" or "over".
 */
export function TotalsSummary({
  totals,
  targets,
}: {
  totals: MacroTotals;
  targets: MacroTargets;
}) {
  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-black text-neutral-900">Today&apos;s totals</h2>
      <div className="space-y-3">
        {MACROS.map((macro) => {
          const current = totals[macro.key];
          const target = targets[macro.key];
          const pct = Math.min(100, percentOf(current, target));
          const left = remaining(current, target);
          return (
            <div key={macro.key} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-bold text-neutral-700">
                  {macro.label}
                </p>
                <p className="text-sm font-bold tabular-nums text-neutral-500">
                  <span className="text-neutral-900">
                    {current}
                    {macro.unit}
                  </span>{" "}
                  / {target}
                  {macro.unit}
                  <span className="ml-2 text-xs text-neutral-400">
                    {left}
                    {macro.unit} left
                  </span>
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
