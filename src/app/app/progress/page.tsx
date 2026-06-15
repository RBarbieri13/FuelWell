"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Gauge,
  Scale,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  MacroStackedBars,
  MACRO_META,
  type MacroDay,
  type MacroKey,
} from "@/components/progress/macro-stacked-bars";
import { SeriesToggle } from "@/components/progress/series-toggle";
import { buildSampleHistory } from "@/components/progress/sample-history";

type ProgressState = "day0" | "day1" | "day3";

interface MacroStat {
  key: MacroKey;
  label: string;
  consumed: number;
  target: number;
  unit: "g";
  colorClass: string;
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
    verdict: "One meal starts the picture.",
    verdictDetail:
      "The chart below is sample history for now. Your own pattern begins the moment you log.",
    dataNote: "Sample model only. No logged nutrition data yet.",
    loggedDays: 0,
    calorieTarget: 2140,
    caloriesAverage: 0,
    adherence: 0,
    macroStats: [
      { key: "protein", label: "Protein", consumed: 0, target: 150, unit: "g", colorClass: "bg-macro-protein" },
      { key: "carbs", label: "Carbs", consumed: 0, target: 230, unit: "g", colorClass: "bg-macro-carbs" },
      { key: "fat", label: "Fat", consumed: 0, target: 70, unit: "g", colorClass: "bg-macro-fat" },
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
    subtitle: "One logged day is enough to see where today leaned.",
    verdict: "Protein has the most room to grow.",
    verdictDetail:
      "Calories landed close to plan. Protein has the widest gap left, so it is the easiest lever to lean into next.",
    dataNote: "1 logged day plus sample history for context.",
    loggedDays: 1,
    calorieTarget: 2140,
    caloriesAverage: 2015,
    adherence: 86,
    macroStats: [
      { key: "protein", label: "Protein", consumed: 118, target: 150, unit: "g", colorClass: "bg-macro-protein" },
      { key: "carbs", label: "Carbs", consumed: 218, target: 230, unit: "g", colorClass: "bg-macro-carbs" },
      { key: "fat", label: "Fat", consumed: 68, target: 70, unit: "g", colorClass: "bg-macro-fat" },
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
      detail: "Greek yogurt or a shake would lean protein further toward your target.",
    },
  },
  day3: {
    state: "day3",
    label: "3+ days",
    title: "A real pattern is forming",
    subtitle: "Three logged days unlock trend confidence and consistency coaching.",
    verdict: "The trend is holding steady.",
    verdictDetail:
      "Calories are tracking near plan across the week, and breakfast is your most consistent meal so far.",
    dataNote: "3 logged days. Older bars are sample history for context.",
    loggedDays: 3,
    calorieTarget: 2140,
    caloriesAverage: 2058,
    adherence: 92,
    macroStats: [
      { key: "protein", label: "Protein", consumed: 144, target: 150, unit: "g", colorClass: "bg-macro-protein" },
      { key: "carbs", label: "Carbs", consumed: 224, target: 230, unit: "g", colorClass: "bg-macro-carbs" },
      { key: "fat", label: "Fat", consumed: 66, target: 70, unit: "g", colorClass: "bg-macro-fat" },
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
      detail: "Picking a protein-forward dinner keeps the week's trend moving your way.",
    },
  },
};

const stateOrder: ProgressState[] = ["day0", "day1", "day3"];

type WindowKey = "7d" | "30d";

const windowOptions: { key: WindowKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
];

const ALL_MACROS: MacroKey[] = ["protein", "carbs", "fat"];

function percent(value: number, target: number) {
  if (target === 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / target) * 100));
}

function formatPounds(value: number) {
  return `${value.toFixed(1)} lb`;
}

/**
 * Overlay the snapshot's logged days onto the tail of the sample history so the
 * most-recent N bars reflect "logged" intake while older bars stay sample.
 */
function buildSeries(
  windowDays: number,
  snapshot: ProgressSnapshot
): MacroDay[] {
  const sample = buildSampleHistory(windowDays);
  const loggedCount = Math.min(snapshot.loggedDays, windowDays);
  if (loggedCount === 0) {
    return sample;
  }

  const logged = snapshot.macroStats.reduce(
    (acc, stat) => {
      acc[stat.key] = stat.consumed;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 } as Record<MacroKey, number>
  );

  return sample.map((day, index) => {
    const isLoggedDay = index >= windowDays - loggedCount;
    if (!isLoggedDay) {
      return day;
    }

    // Spread the snapshot's macro values across the logged tail with the same
    // deterministic wobble already baked into the sample day, so logged bars
    // vary slightly day-to-day without inventing precise fake measurements.
    const drift = (day.protein - 138) / 138;
    return {
      ...day,
      protein: Math.max(0, Math.round(logged.protein * (1 + drift * 0.15))),
      carbs: Math.max(0, Math.round(logged.carbs * (1 + drift * 0.15))),
      fat: Math.max(0, Math.round(logged.fat * (1 + drift * 0.1))),
      source: "logged",
    };
  });
}

export default function ProgressPage() {
  const [selectedState, setSelectedState] = useState<ProgressState>("day3");
  const snapshot = snapshots[selectedState];
  const [weightEntry, setWeightEntry] = useState(snapshot.currentWeight.toFixed(1));
  const [windowKey, setWindowKey] = useState<WindowKey>("7d");
  const [activeMacros, setActiveMacros] = useState<MacroKey[]>(ALL_MACROS);

  const previewWeight = Number.parseFloat(weightEntry);
  const projectedDelta = Number.isFinite(previewWeight)
    ? snapshot.startingWeight - previewWeight
    : snapshot.startingWeight - snapshot.currentWeight;

  const loggedMealCount = snapshot.meals.filter((meal) => meal.logged).length;

  const windowDays = useMemo(
    () => windowOptions.find((option) => option.key === windowKey)?.days ?? 7,
    [windowKey]
  );

  const series = useMemo(
    () => buildSeries(windowDays, snapshot),
    [windowDays, snapshot]
  );

  const loggedInWindow = useMemo(
    () => series.filter((day) => day.source === "logged").length,
    [series]
  );

  const toggleMacro = (key: MacroKey) => {
    setActiveMacros((current) => {
      if (current.includes(key)) {
        // Never allow zero series — the disabled state in SeriesToggle guards
        // this, but enforce it here too.
        if (current.length === 1) {
          return current;
        }
        return current.filter((macro) => macro !== key);
      }
      return ALL_MACROS.filter((macro) => macro === key || current.includes(macro));
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Progress
          </h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Trends and direction over time — no targets to fail, just the shape of your days.
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
              aria-pressed={selectedState === state}
              className={cn(
                "min-h-[44px] md:min-h-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150",
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
            <StatTile label="Consistency" value={`${snapshot.adherence}%`} icon={Gauge} />
            <StatTile label="Avg cals" value={snapshot.caloriesAverage ? snapshot.caloriesAverage.toLocaleString() : "—"} icon={Flame} />
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            icon={BarChart3}
            label="Macro split per day"
            detail="Each bar is a day, segmented by calories from protein, carbs, and fat."
          />
          <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl self-start">
            {windowOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setWindowKey(option.key)}
                aria-pressed={windowKey === option.key}
                className={cn(
                  "min-h-[44px] md:min-h-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
                  windowKey === option.key
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <SeriesToggle active={activeMacros} onToggle={toggleMacro} />

        <MacroStackedBars days={series} active={activeMacros} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            {ALL_MACROS.map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-[3px]", MACRO_META[key].swatchClass)} />
                {MACRO_META[key].label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-neutral-300 bg-[image:repeating-linear-gradient(135deg,rgba(255,255,255,0.6)_0,rgba(255,255,255,0.6)_2px,transparent_2px,transparent_4px)]" />
              Sample day
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {loggedInWindow > 0
              ? `${loggedInWindow} logged ${loggedInWindow === 1 ? "day" : "days"} in this window — older bars are sample history.`
              : "Sample history shown until you start logging. None of these bars are measured intake yet."}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-5">
          <SectionHeader
            icon={CheckCircle2}
            label="Where your macros lean"
            detail={snapshot.loggedDays === 0 ? "Targets shown until logging starts" : "Average intake next to your daily targets"}
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
                  {meal.logged ? "Logged" : "Not logged yet"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

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

      <Card
        variant="elevated"
        className="bg-neutral-950 text-white border-neutral-950 shadow-neutral-300/60"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-xl shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-300" />
            </div>
            <div>
              <p className="text-sm font-semibold">One next step</p>
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
      <p className="text-xs font-medium text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}
