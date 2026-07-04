"use client";

import { Flame, Wheat, Droplet, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { percentOf, remaining, type MacroTargets, type MacroTotals } from "@/lib/fuelwell-data";

const MACROS: {
  key: keyof MacroTotals;
  label: string;
  unit: string;
  color: string;
  iconBg: string;
  icon: typeof Flame;
}[] = [
  { key: "calories", label: "Calories", unit: "", color: "#1eae84", iconBg: "bg-primary-100 text-primary-700", icon: Flame },
  { key: "protein", label: "Protein", unit: "g", color: "#3e98cf", iconBg: "bg-sky-100 text-sky-700", icon: Dumbbell },
  { key: "carbs", label: "Carbs", unit: "g", color: "#c7a91e", iconBg: "bg-lemon-100 text-lemon-700", icon: Wheat },
  { key: "fat", label: "Fat", unit: "g", color: "#f0795b", iconBg: "bg-accent-100 text-accent-700", icon: Droplet },
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
    <Card className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-[#16302a]">Today&apos;s totals</h2>
        <p className="mt-1 text-sm font-semibold text-[#78928a]">
          Live macro math for the selected day.
        </p>
      </div>
      <div className="space-y-4">
        {MACROS.map((macro) => {
          const current = totals[macro.key];
          const target = targets[macro.key];
          const pct = Math.min(100, percentOf(current, target));
          const left = remaining(current, target);
          const Icon = macro.icon;
          return (
            <div key={macro.key} className="rounded-[1.2rem] bg-[#f7faf8] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-[0.9rem] ${macro.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-black text-[#516b63]">
                    {macro.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black tabular-nums text-[#16302a]">
                    {current}
                    {macro.unit}
                    <span className="mx-1 text-[#91a7a0]">/</span>
                    <span className="text-base text-[#60776f]">
                      {target}
                      {macro.unit}
                    </span>
                  </p>
                  <p className="text-xs font-black tabular-nums text-[#91a7a0]">
                    {left}
                    {macro.unit} left
                  </p>
                </div>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: macro.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
