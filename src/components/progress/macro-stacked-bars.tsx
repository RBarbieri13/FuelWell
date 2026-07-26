"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  {
    label: string;
    barClass: string;
    swatchClass: string;
    /** Ring colour for the selected chip in SeriesToggle. */
    ringClass: string;
    /** Text colour used for the chip label when the series is on. */
    textClass: string;
  }
> = {
  calories: {
    label: "Calories",
    barClass: "bg-primary-500",
    swatchClass: "bg-primary-500",
    ringClass: "ring-primary-500",
    textClass: "text-primary-800",
  },
  protein: {
    label: "Protein",
    barClass: "bg-macro-protein",
    swatchClass: "bg-macro-protein",
    ringClass: "ring-sky-500",
    textClass: "text-sky-700",
  },
  carbs: {
    label: "Carbs",
    barClass: "bg-macro-carbs",
    swatchClass: "bg-macro-carbs",
    ringClass: "ring-lemon-500",
    textClass: "text-lemon-700",
  },
  fat: {
    label: "Fat",
    barClass: "bg-macro-fat",
    swatchClass: "bg-macro-fat",
    ringClass: "ring-accent-400",
    textClass: "text-accent-700",
  },
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [grown, setGrown] = useState(false);

  // Bars rise from the baseline once on mount. Global prefers-reduced-motion
  // rules collapse the transition, so this degrades to an instant paint.
  useEffect(() => {
    const timer = setTimeout(() => setGrown(true), 60);
    return () => clearTimeout(timer);
  }, []);

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

  // Look the selection up fresh so a window switch never renders stale data.
  const selectedDay = selectedDate
    ? days.find((day) => day.date === selectedDate) ?? null
    : null;

  const hasSeries = days.length > 0 && days.some((day) => totalMacroCalories(day) > 0);

  // An axis with no series is decoration. Say so instead of drawing it.
  if (!hasSeries) {
    return (
      <div className="rounded-[1.25rem] bg-surface-muted px-4 py-10 text-center ring-1 ring-inset ring-hairline">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
          <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <p className="mt-3 text-sm font-black text-ink">Nothing to chart yet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs font-semibold leading-5 text-ink-muted">
          Once a day has macros against it, this becomes a calorie-per-day comparison.
        </p>
      </div>
    );
  }

  const midDomain = Math.round(domain / 2);

  // Mean of the bars actually drawn. It is derived from the same series, not an
  // invented target, and it is what makes a single tall bar readable as "above
  // your usual" rather than just "tall".
  const averageKcal =
    days.reduce((sum, day) => sum + visibleCalories(day, stackKeys), 0) / days.length;
  const averagePct = Math.min((averageKcal / domain) * 100, 100);

  return (
    <div className="min-w-0">
      {/* Legend first: the stack means nothing without it. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {stackKeys.map((key) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-muted"
          >
            <span
              aria-hidden="true"
              className={cn("h-2.5 w-2.5 rounded-[3px]", MACRO_META[key].swatchClass)}
            />
            {MACRO_META[key].label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-subtle">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-[3px] bg-[image:repeating-linear-gradient(135deg,var(--color-hairline-strong)_0,var(--color-hairline-strong)_2px,transparent_2px,transparent_4px)] ring-1 ring-inset ring-hairline-strong"
          />
          Sample day
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-ink-subtle">
          <span
            aria-hidden="true"
            className="h-0 w-3.5 border-t-2 border-dashed border-primary-400"
          />
          Avg {Math.round(averageKcal).toLocaleString()} kcal
        </span>
      </div>

      <div className="flex min-w-0 gap-2">
        {/* Y axis. A bar chart without a scale is a shape, not a measure. */}
        <div
          aria-hidden="true"
          className="flex w-10 shrink-0 flex-col justify-between pt-5 text-right text-[10px] font-bold leading-none tabular-nums text-ink-faint"
        >
          <span>{Math.round(domain).toLocaleString()}</span>
          <span>{midDomain.toLocaleString()}</span>
          <span>0</span>
        </div>

        <div className="relative min-w-0 flex-1 pt-5">
          {/* Gridlines sit behind the bars at the same stops as the labels. */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-5">
            <span className="absolute inset-x-0 top-0 border-t border-dashed border-hairline-strong" />
            <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-hairline-strong" />
            <span className="absolute inset-x-0 bottom-0 border-t border-hairline-strong" />
          </div>

          <div
            className={cn(
              "relative flex items-end",
              dense ? "h-44 gap-[2px] sm:gap-1" : "h-40 gap-2 sm:gap-3 md:gap-4"
            )}
            role="group"
            aria-label={`Daily calories split by ${stackKeys
              .map((k) => MACRO_META[k].label)
              .join(", ")} over ${days.length} days, scaled 0 to ${Math.round(
              domain
            ).toLocaleString()} kcal, averaging ${Math.round(
              averageKcal
            ).toLocaleString()} kcal per day. Tap a bar for its breakdown. Sample and logged data combined.`}
          >
            {/* Average reference line, drawn behind the bars at the same scale
                as the gridlines. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-primary-400/70"
              style={{ bottom: `${averagePct}%` }}
            />
            {days.map((day) => {
              const dayKcal = visibleCalories(day, stackKeys);
              const totalKcal = totalMacroCalories(day);
              const stackHeightPct = (dayKcal / domain) * 100;
              const isSelected = selectedDate === day.date;
              const barHeight = grown
                ? `${Math.max(stackHeightPct, dayKcal > 0 ? 2 : 0)}%`
                : "0%";

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() =>
                    setSelectedDate((current) => (current === day.date ? null : day.date))
                  }
                  aria-pressed={isSelected}
                  aria-label={`${day.label}: ${Math.round(totalKcal).toLocaleString()} kcal${
                    day.source === "sample" ? " (sample)" : " (logged)"
                  }. Show breakdown.`}
                  className="group relative flex h-full min-w-0 flex-1 items-end justify-center rounded-t-[0.6rem] focus:outline-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                  title={`${day.label}: ${Math.round(totalKcal).toLocaleString()} kcal${
                    day.source === "sample" ? " (sample)" : ""
                  }`}
                >
                  {/* Per-bar totals collide into a smear in the dense (30d)
                      window, so they only render on the 7d chart; dense bars
                      reveal their total via tap/selection instead. The label
                      rides just above the bar rather than inside it, which
                      would be swallowed by the bar's own clipped corners. */}
                  {showCalories && !dense ? (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] leading-none tabular-nums transition-[bottom] duration-700 ease-out-soft",
                        day.source === "sample"
                          ? "font-semibold text-ink-faint"
                          : "font-black text-primary-700"
                      )}
                      style={{ bottom: `calc(${barHeight} + 0.3rem)` }}
                    >
                      {Math.round(totalKcal).toLocaleString()}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "relative flex w-full flex-col-reverse overflow-hidden rounded-t-[0.6rem] transition-[height] duration-700 ease-out-soft",
                      dense ? "max-w-none" : "max-w-[38px]",
                      day.source === "sample"
                        ? "opacity-75 ring-1 ring-inset ring-hairline-strong"
                        : "ring-1 ring-inset ring-black/5",
                      isSelected && "opacity-100 ring-2 ring-primary-700",
                      !isSelected && "group-hover:opacity-100 group-hover:ring-primary-300"
                    )}
                    style={{ height: barHeight }}
                  >
                    {stackKeys.map((key, index) => {
                      const kcal = caloriesFor(day, key);
                      const segPct = dayKcal > 0 ? (kcal / dayKcal) * 100 : 0;

                      if (segPct <= 0) {
                        return null;
                      }

                      return (
                        <span
                          key={key}
                          className={cn(
                            "block w-full",
                            MACRO_META[key].barClass,
                            // Hairline boundary between stacked segments so
                            // adjacent macros never bleed into one another.
                            index > 0 && "border-t border-white/45",
                            day.source === "sample" &&
                              "bg-[image:repeating-linear-gradient(135deg,rgba(255,255,255,0.45)_0,rgba(255,255,255,0.45)_3px,transparent_3px,transparent_6px)]"
                          )}
                          style={{ height: `${segPct}%` }}
                        />
                      );
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* X axis labels: thinned out when dense so they don't collide. */}
      <div
        className={cn(
          "mt-2 flex pl-12",
          dense ? "gap-[2px] sm:gap-1" : "gap-2 sm:gap-3 md:gap-4"
        )}
      >
        {days.map((day, index) => {
          const showLabel = !dense || index % 5 === 0 || index === days.length - 1;
          return (
            <div key={day.date} className="min-w-0 flex-1 text-center">
              {showLabel ? (
                <span className="text-[11px] font-semibold tabular-nums text-ink-subtle">
                  {day.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectedDay ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[1rem] bg-primary-50/70 px-4 py-3 ring-1 ring-inset ring-primary-100">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-black tabular-nums text-ink">
              <span>
                {selectedDay.label} ·{" "}
                {Math.round(totalMacroCalories(selectedDay)).toLocaleString()} kcal
              </span>
              {selectedDay.source === "sample" ? (
                <Badge variant="neutral" size="sm">
                  Sample
                </Badge>
              ) : (
                <Badge variant="success" size="sm" dot>
                  Logged
                </Badge>
              )}
            </p>
            <p className="mt-1 text-xs font-semibold tabular-nums text-ink-muted">
              {selectedDay.protein}g protein · {selectedDay.carbs}g carbs · {selectedDay.fat}g fat
              {selectedDay.source === "sample" ? " · sample history, not measured intake" : ""}
            </p>
          </div>
          {selectedDay.source === "logged" ? (
            <Link
              href="/app/daily-review"
              className="fw-press inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-black text-primary-700 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0"
            >
              Open daily review
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs font-semibold text-ink-subtle">
          Tap a bar to see that day&apos;s calories and macro split.
        </p>
      )}
    </div>
  );
}
