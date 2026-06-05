"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Gauge,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type ProgressState = "day0" | "day1" | "day3";

type MacroKey = "protein" | "carbs" | "fat";

interface MacroStat {
  key: MacroKey;
  label: string;
  consumed: number;
  target: number;
  unit: "g";
  colorClass: string;
}

interface CaloriePoint {
  day: string;
  value: number;
  target: number;
  source: "sample" | "logged";
}

interface MealStat {
  label: string;
  logged: boolean;
}

interface ProgressSnapshot {
  state: ProgressState;
  label: string;
  title: string;
  subtitle: string;
  verdict: string;
  verdictDetail: string;
  dataNote: string;
  loggedDays: number;
  calorieTarget: number;
  caloriesAverage: number;
  adherence: number;
  macroStats: MacroStat[];
  calorieTrend: CaloriePoint[];
  meals: MealStat[];
  startingWeight: number;
  currentWeight: number;
  goalWeight: number;
  weeklyPace: number;
  projectionWeeks: number;
  nextAction: {
    label: string;
    href: string;
    detail: string;
  };
}

const snapshots: Record<ProgressState, ProgressSnapshot> = {
  day0: {
    state: "day0",
    label: "Day 0",
    title: "Your baseline is ready",
    subtitle: "FuelWell is using sample analytics until your first logged meal lands.",
    verdict: "Start with one complete meal today.",
    verdictDetail:
      "The numbers below show exactly what will unlock as soon as you begin logging.",
    dataNote: "Sample model only. No logged nutrition data yet.",
    loggedDays: 0,
    calorieTarget: 2140,
    caloriesAverage: 0,
    adherence: 0,
    macroStats: [
      { key: "protein", label: "Protein", consumed: 0, target: 150, unit: "g", colorClass: "bg-blue-500" },
      { key: "carbs", label: "Carbs", consumed: 0, target: 230, unit: "g", colorClass: "bg-amber-500" },
      { key: "fat", label: "Fat", consumed: 0, target: 70, unit: "g", colorClass: "bg-red-500" },
    ],
    calorieTrend: [
      { day: "Today", value: 0, target: 2140, source: "sample" },
      { day: "Next", value: 1760, target: 2140, source: "sample" },
      { day: "Then", value: 2025, target: 2140, source: "sample" },
    ],
    meals: [
      { label: "Breakfast", logged: false },
      { label: "Lunch", logged: false },
      { label: "Dinner", logged: false },
      { label: "Snack", logged: false },
    ],
    startingWeight: 186.4,
    currentWeight: 186.4,
    goalWeight: 178,
    weeklyPace: 0,
    projectionWeeks: 12,
    nextAction: {
      label: "Log first meal",
      href: "/app/log",
      detail: "One meal gives the coach enough signal to personalize today.",
    },
  },
  day1: {
    state: "day1",
    label: "Day 1",
    title: "First signal captured",
    subtitle: "One logged day is enough to spot the biggest macro gap.",
    verdict: "Protein is the clearest lever today.",
    verdictDetail:
      "You were close on calories, but protein finished 32g under target.",
    dataNote: "1 logged day plus sample projection for upcoming days.",
    loggedDays: 1,
    calorieTarget: 2140,
    caloriesAverage: 2015,
    adherence: 86,
    macroStats: [
      { key: "protein", label: "Protein", consumed: 118, target: 150, unit: "g", colorClass: "bg-blue-500" },
      { key: "carbs", label: "Carbs", consumed: 218, target: 230, unit: "g", colorClass: "bg-amber-500" },
      { key: "fat", label: "Fat", consumed: 68, target: 70, unit: "g", colorClass: "bg-red-500" },
    ],
    calorieTrend: [
      { day: "Mon", value: 2015, target: 2140, source: "logged" },
      { day: "Tue", value: 2060, target: 2140, source: "sample" },
      { day: "Wed", value: 2110, target: 2140, source: "sample" },
    ],
    meals: [
      { label: "Breakfast", logged: true },
      { label: "Lunch", logged: true },
      { label: "Dinner", logged: true },
      { label: "Snack", logged: false },
    ],
    startingWeight: 186.4,
    currentWeight: 186,
    goalWeight: 178,
    weeklyPace: 0.4,
    projectionWeeks: 20,
    nextAction: {
      label: "Add protein snack",
      href: "/app/log?mode=search",
      detail: "Greek yogurt or a shake would close most of the remaining gap.",
    },
  },
  day3: {
    state: "day3",
    label: "3+ days",
    title: "A real pattern is forming",
    subtitle: "Three logged days unlock trend confidence and consistency coaching.",
    verdict: "You are on pace with one dinner risk.",
    verdictDetail:
      "Calories average 4% under target and breakfast consistency is strong.",
    dataNote: "3 logged days. Remaining future bars are clearly marked as sample.",
    loggedDays: 3,
    calorieTarget: 2140,
    caloriesAverage: 2058,
    adherence: 92,
    macroStats: [
      { key: "protein", label: "Protein", consumed: 144, target: 150, unit: "g", colorClass: "bg-blue-500" },
      { key: "carbs", label: "Carbs", consumed: 224, target: 230, unit: "g", colorClass: "bg-amber-500" },
      { key: "fat", label: "Fat", consumed: 66, target: 70, unit: "g", colorClass: "bg-red-500" },
    ],
    calorieTrend: [
      { day: "Mon", value: 2015, target: 2140, source: "logged" },
      { day: "Tue", value: 2168, target: 2140, source: "logged" },
      { day: "Wed", value: 1992, target: 2140, source: "logged" },
      { day: "Thu", value: 2075, target: 2140, source: "sample" },
      { day: "Fri", value: 2120, target: 2140, source: "sample" },
    ],
    meals: [
      { label: "Breakfast", logged: true },
      { label: "Lunch", logged: true },
      { label: "Dinner", logged: false },
      { label: "Snack", logged: true },
    ],
    startingWeight: 186.4,
    currentWeight: 185.7,
    goalWeight: 178,
    weeklyPace: 1.2,
    projectionWeeks: 7,
    nextAction: {
      label: "Plan dinner",
      href: "/app/recipes",
      detail: "Choose a higher-protein dinner before the day gets noisy.",
    },
  },
};

const stateOrder: ProgressState[] = ["day0", "day1", "day3"];

function percent(value: number, target: number) {
  if (target === 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / target) * 100));
}

function formatPounds(value: number) {
  return `${value.toFixed(1)} lb`;
}

export default function ProgressPage() {
  const [selectedState, setSelectedState] = useState<ProgressState>("day3");
  const snapshot = snapshots[selectedState];
  const [weightEntry, setWeightEntry] = useState(snapshot.currentWeight.toFixed(1));

  const previewWeight = Number.parseFloat(weightEntry);
  const projectedDelta = Number.isFinite(previewWeight)
    ? snapshot.startingWeight - previewWeight
    : snapshot.startingWeight - snapshot.currentWeight;

  const loggedMealCount = snapshot.meals.filter((meal) => meal.logged).length;

  const calorieDomain = useMemo(
    () => Math.max(...snapshot.calorieTrend.map((point) => point.value), snapshot.calorieTarget),
    [snapshot]
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Progress
          </h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Early progress analytics that stay useful before charts have a full history.
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl self-start md:self-auto">
          {stateOrder.map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => {
                setSelectedState(state);
                setWeightEntry(snapshots[state].currentWeight.toFixed(1));
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150",
                selectedState === state
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {snapshots[state].label}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary-50/90 via-white to-white border-primary-100">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-700">
              <Sparkles className="w-4 h-4" />
              <span>{snapshot.dataNote}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">{snapshot.title}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-950 tracking-tight mt-1">
                {snapshot.verdict}
              </h2>
              <p className="text-sm md:text-base text-neutral-600 mt-2 leading-relaxed">
                {snapshot.verdictDetail}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Logged days" value={snapshot.loggedDays.toString()} icon={CalendarCheck} />
            <StatTile label="Adherence" value={`${snapshot.adherence}%`} icon={Gauge} />
            <StatTile label="Avg cals" value={snapshot.caloriesAverage ? snapshot.caloriesAverage.toLocaleString() : "—"} icon={Flame} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-5">
          <SectionHeader
            icon={CheckCircle2}
            label="Macro adherence"
            detail={snapshot.loggedDays === 0 ? "Targets shown until logging starts" : "Average intake vs daily targets"}
          />
          <div className="space-y-5">
            {snapshot.macroStats.map((macro) => {
              const completion = percent(macro.consumed, macro.target);

              return (
                <div key={macro.key}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-neutral-800">{macro.label}</span>
                    <span className="text-neutral-500 tabular-nums">
                      {macro.consumed}{macro.unit} / {macro.target}{macro.unit}
                    </span>
                  </div>
                  <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden mt-2">
                    <div
                      className={cn("h-full rounded-full transition-all duration-300", macro.colorClass)}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-5">
          <SectionHeader
            icon={TrendingUp}
            label="Calories trend"
            detail="Logged bars are solid; sample bars are striped"
          />
          <div className="h-48 flex items-end gap-3 border-b border-neutral-200 pb-3">
            {snapshot.calorieTrend.map((point) => {
              const height = Math.max(8, Math.round((point.value / calorieDomain) * 100));

              return (
                <div key={point.day} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-2">
                  <div className="relative w-full flex items-end justify-center h-36">
                    <div
                      className={cn(
                        "w-full max-w-12 rounded-t-lg border transition-all duration-300",
                        point.source === "logged"
                          ? "bg-primary-500 border-primary-600"
                          : "bg-[repeating-linear-gradient(135deg,#dcfce7_0,#dcfce7_5px,#f0fdf4_5px,#f0fdf4_10px)] border-primary-200"
                      )}
                      style={{ height: `${height}%` }}
                      title={`${point.day}: ${point.value} calories`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-neutral-600">{point.day}</p>
                    <p className="text-[11px] text-neutral-400 tabular-nums">{point.value || "—"}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500">
            Target: <span className="font-medium text-neutral-700 tabular-nums">{snapshot.calorieTarget.toLocaleString()} cal</span>
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-5">
          <SectionHeader
            icon={Utensils}
            label="Meal consistency"
            detail={`${loggedMealCount} of ${snapshot.meals.length} meals represented`}
          />
          <div className="grid grid-cols-2 gap-3">
            {snapshot.meals.map((meal) => (
              <div
                key={meal.label}
                className={cn(
                  "rounded-xl border p-4",
                  meal.logged
                    ? "border-primary-200 bg-primary-50/70"
                    : "border-neutral-200 bg-neutral-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      meal.logged ? "bg-primary-500" : "bg-neutral-300"
                    )}
                  />
                  <p className="text-sm font-semibold text-neutral-800">{meal.label}</p>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {meal.logged ? "Logged" : "Needs signal"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <SectionHeader
            icon={Scale}
            label="Weight and goal projection"
            detail="Mock entry for planning only"
          />
          <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
            <label className="block">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Today&apos;s weight
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
                <input
                  value={weightEntry}
                  onChange={(event) => setWeightEntry(event.target.value)}
                  inputMode="decimal"
                  className="w-full bg-transparent text-lg font-semibold text-neutral-900 tabular-nums focus:outline-none"
                  aria-label="Mock weight entry"
                />
                <span className="text-sm text-neutral-400">lb</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                This updates the preview only; it is not saved.
              </p>
            </label>

            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Start</span>
                <span className="font-medium text-neutral-900 tabular-nums">{formatPounds(snapshot.startingWeight)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Goal</span>
                <span className="font-medium text-neutral-900 tabular-nums">{formatPounds(snapshot.goalWeight)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Preview change</span>
                <span className="font-medium text-neutral-900 tabular-nums">
                  {projectedDelta >= 0 ? "-" : "+"}{Math.abs(projectedDelta).toFixed(1)} lb
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">Projected time to goal</p>
                <p className="text-lg font-bold text-neutral-950 mt-1">
                  {snapshot.weeklyPace > 0 ? `${snapshot.projectionWeeks} weeks` : "After 3 logged days"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card
        variant="elevated"
        className="bg-neutral-950 text-white border-neutral-950 shadow-neutral-300/60"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
              {snapshot.state === "day3" ? (
                <TrendingDown className="w-4 h-4 text-primary-300" />
              ) : (
                <ArrowRight className="w-4 h-4 text-primary-300" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">Next best action</p>
              <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
                {snapshot.nextAction.detail}
              </p>
            </div>
          </div>
          <Link href={snapshot.nextAction.href} className="shrink-0">
            <Button className="w-full sm:w-auto bg-white text-neutral-950 hover:bg-neutral-100">
              {snapshot.nextAction.label}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof CheckCircle2;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </h2>
        <p className="text-sm text-neutral-500 mt-1">{detail}</p>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CalendarCheck;
}) {
  return (
    <div className="rounded-xl bg-white/75 border border-white p-3 shadow-sm shadow-primary-100/50">
      <Icon className="w-4 h-4 text-primary-600 mb-2" />
      <p className="text-lg font-bold text-neutral-950 tabular-nums">{value}</p>
      <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}
