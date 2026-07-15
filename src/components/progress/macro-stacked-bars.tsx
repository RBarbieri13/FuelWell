"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

export type MacroGramKey = "protein" | "carbs" | "fat";
export type MacroKey = "calories" | MacroGramKey;

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
  calories: 1,
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const MACRO_META: Record<
  MacroKey,
  { label: string; barClass: string; swatchClass: string }
> = {
  calories: { label: "Calories", barClass: "bg-primary-500", swatchClass: "bg-primary-500" },
  protein: { label: "Protein", barClass: "bg-sky-500", swatchClass: "bg-sky-500" },
  carbs: { label: "Carbs", barClass: "bg-macro-carbs", swatchClass: "bg-macro-carbs" },
  fat: { label: "Fat", barClass: "bg-macro-fat", swatchClass: "bg-macro-fat" },
};

/** Stack order from bottom to top. */
const STACK_ORDER: MacroGramKey[] = ["protein", "carbs", "fat"];

function caloriesFor(day: MacroDay, key: MacroGramKey) {
  return day[key] * KCAL_PER_GRAM[key];
}

function totalMacroCalories(day: MacroDay) {
  return STACK_ORDER.reduce((sum, key) => sum + caloriesFor(day, key), 0);
}

/** Total calories for the macros that are currently visible. */
function visibleCalories(day: MacroDay, active: MacroKey[]) {
  const visibleMacros = STACK_ORDER.filter((key) => active.includes(key));
  const stackKeys = visibleMacros.length > 0 ? visibleMacros : STACK_ORDER;
  return stackKeys.reduce((sum, key) => sum + caloriesFor(day, key), 0);
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

  const stackKeys = useMemo(
    () => {
      const visibleMacros = STACK_ORDER.filter((key) => active.includes(key));
      return visibleMacros.length > 0 ? visibleMacros : STACK_ORDER;
    },
    [active]
  );
  const showCalories = active.includes("calories");

  // Width per bar scales with count so 30d stays readable; gap tightens too.
  const dense = days.length > 14;

  return (
    <div>
      <div
        className={cn(
          "flex items-end border-b border-primary-100/80 pb-4",
          dense ? "h-48 gap-[4px]" : "h-[172px] gap-4"
        )}
        role="img"
        aria-label={`Daily calories split by ${stackKeys
          .map((k) => MACRO_META[k].label)
          .join(", ")} over ${days.length} days${
          showCalories ? ", with calorie totals shown above each bar" : ""
        }. Sample and logged data combined.`}
      >
        {days.map((day) => {
          const dayKcal = visibleCalories(day, stackKeys);
          const totalKcal = totalMacroCalories(day);
          const stackHeightPct = Math.round((dayKcal / domain) * 100);

          return (
            <div
              key={day.date}
              className="flex-1 min-w-0 flex flex-col items-center justify-end h-full gap-1"
              title={`${day.label}: ${Math.round(dayKcal).toLocaleString()} kcal${
                day.source === "sample" ? " (sample)" : ""
              }`}
            >
              {showCalories ? (
                <span className="text-[10px] font-black text-primary-700 tabular-nums">
                  {Math.round(totalKcal).toLocaleString()}
                </span>
              ) : null}
              <div
                className={cn(
                  "relative flex w-full flex-col-reverse overflow-hidden rounded-t-[0.6rem]",
                  dense ? "max-w-none" : "max-w-[38px]",
                  day.source === "sample" && "opacity-70 ring-1 ring-inset ring-[#b8cac4]"
                )}
                style={{ height: `${Math.max(stackHeightPct, dayKcal > 0 ? 2 : 0)}%` }}
              >
                {stackKeys.map((key) => {
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
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">{day.label}</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
