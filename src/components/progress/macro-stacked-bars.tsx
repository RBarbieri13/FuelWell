"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

export type MacroKey = "protein" | "carbs" | "fat";

export interface MacroDay {
  /** ISO date, e.g. "2026-06-04" */
  date: string;
  /** Short axis label, e.g. "Thu" or "6/4" */
  label: string;
  protein: number;
  carbs: number;
  fat: number;
  source: "logged" | "sample";
}

/** Calories per gram for each macro. */
const KCAL_PER_GRAM: Record<MacroKey, number> = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const MACRO_META: Record<
  MacroKey,
  { label: string; barClass: string; swatchClass: string }
> = {
  protein: { label: "Protein", barClass: "bg-blue-500", swatchClass: "bg-blue-500" },
  carbs: { label: "Carbs", barClass: "bg-amber-500", swatchClass: "bg-amber-500" },
  fat: { label: "Fat", barClass: "bg-rose-500", swatchClass: "bg-rose-500" },
};

/** Stack order from bottom to top. */
const STACK_ORDER: MacroKey[] = ["protein", "carbs", "fat"];

function caloriesFor(day: MacroDay, key: MacroKey) {
  return day[key] * KCAL_PER_GRAM[key];
}

/** Total calories for the macros that are currently visible. */
function visibleCalories(day: MacroDay, active: MacroKey[]) {
  return active.reduce((sum, key) => sum + caloriesFor(day, key), 0);
}

export function MacroStackedBars({
  days,
  active,
}: {
  days: MacroDay[];
  active: MacroKey[];
}) {
  // Domain is the largest single-day total across ALL macros, so toggling a
  // series off never rescales the axis under the user.
  const domain = useMemo(() => {
    const max = Math.max(
      0,
      ...days.map((day) => STACK_ORDER.reduce((s, k) => s + caloriesFor(day, k), 0))
    );
    return max === 0 ? 1 : max;
  }, [days]);

  const orderedActive = useMemo(
    () => STACK_ORDER.filter((key) => active.includes(key)),
    [active]
  );

  // Width per bar scales with count so 30d stays readable; gap tightens too.
  const dense = days.length > 14;

  return (
    <div>
      <div
        className={cn(
          "flex items-end border-b border-neutral-200 pb-3",
          dense ? "gap-[3px] h-44" : "gap-2 h-52"
        )}
        role="img"
        aria-label={`Daily calories split by ${orderedActive
          .map((k) => MACRO_META[k].label)
          .join(", ")} over ${days.length} days. Sample and logged data combined.`}
      >
        {days.map((day) => {
          const dayKcal = visibleCalories(day, orderedActive);
          const stackHeightPct = Math.round((dayKcal / domain) * 100);

          return (
            <div
              key={day.date}
              className="flex-1 min-w-0 flex flex-col items-center justify-end h-full"
              title={`${day.label}: ${Math.round(dayKcal)} cal${
                day.source === "sample" ? " (sample)" : ""
              }`}
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-t-md flex flex-col-reverse",
                  dense ? "max-w-none" : "max-w-10",
                  day.source === "sample" && "opacity-70 ring-1 ring-inset ring-neutral-300"
                )}
                style={{ height: `${Math.max(stackHeightPct, dayKcal > 0 ? 2 : 0)}%` }}
              >
                {orderedActive.map((key) => {
                  const kcal = caloriesFor(day, key);
                  const segPct = dayKcal > 0 ? (kcal / dayKcal) * 100 : 0;

                  if (segPct <= 0) {
                    return null;
                  }

                  return (
                    <div
                      key={key}
                      className={cn(
                        MACRO_META[key].barClass,
                        day.source === "sample" &&
                          "bg-[image:repeating-linear-gradient(135deg,rgba(255,255,255,0.45)_0,rgba(255,255,255,0.45)_3px,transparent_3px,transparent_6px)]"
                      )}
                      style={{ height: `${segPct}%` }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis labels: thinned out when dense so they don't collide. */}
      <div className={cn("flex mt-2", dense ? "gap-[3px]" : "gap-2")}>
        {days.map((day, index) => {
          const showLabel = !dense || index % 5 === 0 || index === days.length - 1;
          return (
            <div key={day.date} className="flex-1 min-w-0 text-center">
              {showLabel ? (
                <span className="text-[10px] text-neutral-400 tabular-nums">{day.label}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
