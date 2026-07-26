"use client";

import { useState } from "react";
import { ChevronDown, Flame, Wheat, Droplet, Beef, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
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
  iconPlate: string;
  icon: typeof Flame;
}[] = [
  {
    key: "calories",
    label: "Calories",
    unit: " kcal",
    color: "var(--color-macro-calories)",
    iconPlate: "bg-primary-50 text-primary-700 ring-primary-100",
    icon: Flame,
  },
  {
    key: "protein",
    label: "Protein",
    unit: "g",
    color: "var(--color-macro-protein)",
    iconPlate: "bg-sky-50 text-sky-700 ring-sky-100",
    icon: Beef,
  },
  {
    key: "carbs",
    label: "Carbs",
    unit: "g",
    color: "var(--color-macro-carbs)",
    iconPlate: "bg-lemon-50 text-lemon-700 ring-lemon-200",
    icon: Wheat,
  },
  {
    key: "fat",
    label: "Fat",
    unit: "g",
    color: "var(--color-macro-fat)",
    iconPlate: "bg-accent-50 text-accent-700 ring-accent-100",
    icon: Droplet,
  },
];

/** Five evenly spaced ticks give the meter an actual 0 → target scale. */
const TICKS = [0, 1, 2, 3, 4];

/**
 * Live totals against targets. Reads from the shared day log via props so it
 * updates the instant a meal is added, edited, or removed. Framing stays
 * neutral and forward-looking ("left" / "over"), never "missed" or "failed".
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
  const nothingLogged = MACROS.every((macro) => totals[macro.key] <= 0);
  const overCount = MACROS.filter(
    (macro) => totals[macro.key] > targets[macro.key]
  ).length;

  return (
    <Card className="space-y-5">
      <SectionHeader
        icon={Gauge}
        title="Today's totals"
        description="Live macro math for the selected day. Tap a macro for the meal breakdown."
        action={
          overCount > 0 ? (
            <Badge variant="warning" dot>
              {overCount} over target
            </Badge>
          ) : (
            <Badge variant="neutral" dot>
              All under target
            </Badge>
          )
        }
      />

      {nothingLogged && (
        <p className="rounded-[1.15rem] bg-surface-muted px-4 py-3 text-sm font-semibold leading-6 text-ink-muted ring-1 ring-inset ring-hairline">
          Nothing logged yet — the bars below show today&apos;s targets for scale.
        </p>
      )}

      <div className="space-y-3">
        {MACROS.map((macro) => {
          const current = totals[macro.key];
          const target = targets[macro.key];
          const percent = percentOf(current, target);
          const left = remaining(current, target);
          const over = current > target ? current - target : 0;
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
            <div
              key={macro.key}
              className={cn(
                "rounded-[1.2rem] p-3 ring-1 ring-inset transition-colors duration-200 ease-out-soft",
                over > 0
                  ? "bg-accent-50/50 ring-accent-100"
                  : "bg-surface-muted ring-hairline"
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : macro.key)}
                aria-expanded={isExpanded}
                aria-label={`${macro.label} breakdown`}
                className="fw-press flex min-h-11 w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[0.9rem] text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-0"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] ring-1 ring-inset",
                      macro.iconPlate
                    )}
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 truncate text-sm font-black text-ink">
                    {macro.label}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink-subtle transition-transform duration-200 ease-out-soft",
                      isExpanded && "rotate-180"
                    )}
                    strokeWidth={2}
                  />
                </span>
                <span className="min-w-0 text-right">
                  <span className="block text-xl font-black tabular-nums text-ink">
                    {current.toLocaleString()}
                    {macro.unit}
                    <span className="mx-1 font-bold text-ink-faint">/</span>
                    <span className="text-base font-bold text-ink-muted">
                      {target.toLocaleString()}
                      {macro.unit}
                    </span>
                  </span>
                  {over > 0 ? (
                    <span className="mt-0.5 flex items-center justify-end gap-1.5 text-xs font-black tabular-nums text-accent-700">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-accent-500"
                      />
                      {over.toLocaleString()}
                      {macro.unit} over · {percent}%
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-xs font-black tabular-nums text-ink-muted">
                      {left.toLocaleString()}
                      {macro.unit} left · {percent}%
                    </span>
                  )}
                </span>
              </button>

              <div className="mt-2.5">
                <ProgressMeter
                  value={current}
                  target={target}
                  color={macro.color}
                  size="md"
                  label={`${macro.label}: ${current.toLocaleString()}${macro.unit} of ${target.toLocaleString()}${macro.unit} target${
                    over > 0
                      ? `, ${over.toLocaleString()}${macro.unit} over`
                      : `, ${left.toLocaleString()}${macro.unit} left`
                  }`}
                />
                <div aria-hidden="true" className="mt-1 flex justify-between px-px">
                  {TICKS.map((tick) => (
                    <span key={tick} className="h-1.5 w-px bg-hairline-strong" />
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  className="mt-0.5 flex items-baseline justify-between gap-2 text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-faint"
                >
                  <span>0</span>
                  <span className="tabular-nums">
                    {Math.round(target / 2).toLocaleString()}
                  </span>
                  <span className="min-w-0 truncate tabular-nums">
                    {target.toLocaleString()}
                    {macro.unit} target
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-1.5 border-t border-hairline pt-3">
                  {contributions.length > 0 ? (
                    <>
                      <p className="px-0.5 text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
                        Share of today&apos;s {macro.label.toLowerCase()}
                      </p>
                      {contributions.map((entry) => {
                        const share =
                          current > 0
                            ? Math.min(100, (entry.amount / current) * 100)
                            : 0;
                        return (
                          <div
                            key={entry.id}
                            className="rounded-[0.85rem] bg-surface px-3 py-2 ring-1 ring-inset ring-hairline"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="min-w-0 truncate text-sm font-bold text-ink-muted">
                                {entry.name}
                              </p>
                              <p className="shrink-0 text-sm font-black tabular-nums text-ink">
                                {entry.amount.toLocaleString()}
                                {macro.unit}
                              </p>
                            </div>
                            <div
                              aria-hidden="true"
                              className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-sunken"
                            >
                              <div
                                className="h-full rounded-full transition-[width] duration-500 ease-out-soft"
                                style={{
                                  width: `${share}%`,
                                  backgroundColor: macro.color,
                                  opacity: 0.78,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="px-1 text-sm font-semibold text-ink-muted">
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
