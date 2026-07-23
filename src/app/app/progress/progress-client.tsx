"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Activity,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Flame,
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
  type MacroDay,
  type MacroKey,
} from "@/components/progress/macro-stacked-bars";
import { SeriesToggle } from "@/components/progress/series-toggle";
import { buildSampleHistory } from "@/components/progress/sample-history";
import {
  formatMealType,
  percentOf,
  remaining,
  sumMeals,
  todayIsoDate,
  type MacroTargets,
  type MacroTotals,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";
import { useBodyLog } from "@/lib/use-body-log";
import { usePreviewOnboardingOverride } from "@/lib/preview-onboarding";

type NutritionStatKey = "calories" | MacroKey;

interface MacroStat {
  key: NutritionStatKey;
  label: string;
  consumed: number;
  target: number;
  unit: "g" | "kcal";
  colorClass: string;
}

type WindowKey = "7d" | "30d";

const windowOptions: { key: WindowKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
];

const ALL_MACROS: MacroKey[] = ["calories", "protein", "carbs", "fat"];

const MEAL_SLOTS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const macroTextClass: Record<NutritionStatKey, string> = {
  calories: "text-primary-700",
  protein: "text-sky-700",
  carbs: "text-lemon-700",
  fat: "text-accent-600",
};

const LB_PER_KG = 2.20462;

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
 * The chart stays sample history except for today: when real meals are
 * logged, the last bar becomes the live day so the page never invents
 * multi-day "logged" history it does not have.
 */
function buildSeries(windowDays: number, totals: MacroTotals, hasLoggedToday: boolean): MacroDay[] {
  const sample = buildSampleHistory(windowDays);
  if (!hasLoggedToday) {
    return sample;
  }

  return sample.map((day, index) =>
    index === windowDays - 1
      ? {
          ...day,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          source: "logged" as const,
        }
      : day
  );
}

export function ProgressClient({
  meals: initialMeals,
  targets: serverTargets,
}: {
  meals: MealRecord[];
  targets: MacroTargets;
}) {
  // Same override the dashboard applies, so a preview onboarding run changes
  // both pages identically.
  const previewOverride = usePreviewOnboardingOverride();
  const targets: MacroTargets = {
    calories: Number(previewOverride?.macros?.calories) || serverTargets.calories,
    protein: Number(previewOverride?.macros?.protein) || serverTargets.protein,
    carbs: Number(previewOverride?.macros?.carbs) || serverTargets.carbs,
    fat: Number(previewOverride?.macros?.fat) || serverTargets.fat,
  };

  // Same live client store the dashboard and daily review read.
  const { meals, hydrateDayLog } = useDayLog();

  useEffect(() => {
    hydrateDayLog(initialMeals);
  }, [hydrateDayLog, initialMeals]);

  const totals = useMemo(() => sumMeals(meals), [meals]);
  const hasLoggedToday = totals.calories > 0;

  const [windowKey, setWindowKey] = useState<WindowKey>("7d");
  const [activeMacros, setActiveMacros] = useState<MacroKey[]>(ALL_MACROS);

  const mealSlots = MEAL_SLOTS.map((mealType) => ({
    mealType,
    label: formatMealType(mealType),
    logged: meals.some((meal) => meal.mealType === mealType),
  }));
  const loggedMealCount = mealSlots.filter((slot) => slot.logged).length;
  const dinnerLogged = mealSlots.some((slot) => slot.mealType === "dinner" && slot.logged);

  const calorieRoom = remaining(totals.calories, targets.calories);
  const proteinRoom = remaining(totals.protein, targets.protein);

  const macroStats: MacroStat[] = [
    { key: "calories", label: "Calories", consumed: totals.calories, target: targets.calories, unit: "kcal", colorClass: "bg-primary-500" },
    { key: "protein", label: "Protein", consumed: totals.protein, target: targets.protein, unit: "g", colorClass: "bg-sky-500" },
    { key: "carbs", label: "Carbs", consumed: totals.carbs, target: targets.carbs, unit: "g", colorClass: "bg-macro-carbs" },
    { key: "fat", label: "Fat", consumed: totals.fat, target: targets.fat, unit: "g", colorClass: "bg-macro-fat" },
  ];

  const verdict = !hasLoggedToday
    ? {
        title: "Your baseline is ready",
        headline: "One meal starts the picture.",
        detail:
          "The chart below is sample history for now. Your own pattern begins the moment you log.",
        dataNote: "Sample model only. No logged nutrition data yet.",
      }
    : totals.calories > targets.calories
      ? {
          title: "Today's signal",
          headline: "Calories ran past target today.",
          detail: `You are ${(totals.calories - targets.calories).toLocaleString()} kcal over the ${targets.calories.toLocaleString()} kcal target. Keeping the rest of today light and protein-forward protects the trend.`,
          dataNote: `${meals.length} logged meal${meals.length === 1 ? "" : "s"} today. Older chart bars are sample history.`,
        }
      : proteinRoom >= 30
        ? {
            title: "Today's signal",
            headline: "Protein has the most room to grow.",
            detail: `Calories are at ${percentOf(totals.calories, targets.calories)}% of plan with ${calorieRoom.toLocaleString()} kcal left. Protein has the widest gap (${proteinRoom}g to go), so it is the easiest lever to lean into next.`,
            dataNote: `${meals.length} logged meal${meals.length === 1 ? "" : "s"} today. Older chart bars are sample history.`,
          }
        : {
            title: "Today's signal",
            headline: "Today is tracking near plan.",
            detail: `${calorieRoom.toLocaleString()} kcal and ${proteinRoom}g protein remain against your daily targets. Keep the next choice simple and the day lands close to plan.`,
            dataNote: `${meals.length} logged meal${meals.length === 1 ? "" : "s"} today. Older chart bars are sample history.`,
          };

  const nextAction = !hasLoggedToday
    ? {
        label: "Log first meal",
        href: "/app/log",
        detail: "One meal gives the coach enough signal to personalize today.",
      }
    : !dinnerLogged
      ? {
          label: "Plan dinner",
          href: "/app/recipes",
          detail: "Picking a protein-forward dinner keeps today's trend moving your way.",
        }
      : proteinRoom >= 30
        ? {
            label: "Add protein snack",
            href: "/app/log?mode=search",
            detail: "Greek yogurt or a shake would lean protein further toward your target.",
          }
        : {
            label: "Review the full day",
            href: "/app/daily-review",
            detail: "Every meal slot is covered — check the day's full energy ledger next.",
          };

  const windowDays = useMemo(
    () => windowOptions.find((option) => option.key === windowKey)?.days ?? 7,
    [windowKey]
  );

  const series = useMemo(
    () => buildSeries(windowDays, totals, hasLoggedToday),
    [windowDays, totals, hasLoggedToday]
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
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-5 md:py-7">
          <h1 className="fw-heading text-2xl md:text-4xl">Progress</h1>
          <p className="fw-muted mt-1 text-sm md:text-base">
            Trends and direction over time.
          </p>
        </div>
      </header>

      <div className="fw-page-inner max-w-[1120px] space-y-4 md:space-y-6">

      <Card className="fw-mint-panel rounded-[24px] border-primary-200/80 px-6 py-6 shadow-none">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-primary-700">
              <Sparkles className="w-4 h-4" />
              <span>{verdict.dataNote}</span>
            </div>
            <div>
              <p className="text-sm font-black text-primary-800/75">{verdict.title}</p>
              <h2 className="mt-3 font-heading text-[22px] font-black tracking-tight text-[#16302a] md:text-3xl">
                {verdict.headline}
              </h2>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-primary-900/70">
                {verdict.detail}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Meals today" value={`${loggedMealCount} of 4`} icon={CalendarCheck} />
            <StatTile label="Calories today" value={hasLoggedToday ? totals.calories.toLocaleString() : "—"} icon={Flame} />
            <StatTile label="Protein today" value={hasLoggedToday ? `${totals.protein}g` : "—"} icon={Utensils} />
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="fw-dark-panel">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-500 rounded-[1rem] shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-300" />
            </div>
            <div>
              <p className="text-sm font-semibold">One next step</p>
              <p className="text-sm text-white/70 mt-1 leading-relaxed">
                {nextAction.detail}
              </p>
            </div>
          </div>
          <Link href={nextAction.href} className="shrink-0">
            <Button className="w-full sm:w-auto bg-white text-neutral-950 hover:bg-neutral-100">
              {nextAction.label}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-6 rounded-[24px] border-border px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            icon={BarChart3}
            label="Calories and macro split per day"
            detail="Each bar is a day. Calories can be shown as totals, with protein, carbs, and fat stacked underneath."
          />
          <div className="flex gap-1 rounded-full border border-primary-100/80 bg-primary-50/70 p-1 self-start">
            {windowOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setWindowKey(option.key)}
                aria-pressed={windowKey === option.key}
                className={cn(
                  "min-h-11 rounded-full px-5 py-2 text-sm font-bold transition-all duration-150 md:min-h-0",
                  windowKey === option.key
                    ? "bg-white text-[#16302a] shadow-[0_3px_8px_rgba(20,90,75,0.08)]"
                    : "text-muted-foreground hover:text-primary-800"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <SeriesToggle active={activeMacros} onToggle={toggleMacro} />

        <MacroStackedBars days={series} active={activeMacros} />

        <p className="text-xs font-semibold text-muted-foreground">
          {loggedInWindow > 0
            ? `${loggedInWindow} logged ${loggedInWindow === 1 ? "day" : "days"} in this window — older bars are sample history.`
            : "Sample history shown until you start logging. None of these bars are measured intake yet."}
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-6 rounded-[24px] border-border px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <SectionHeader
            icon={CheckCircle2}
            label="Where calories and macros lean"
            detail={hasLoggedToday ? "Today's intake next to your daily targets" : "Targets shown until logging starts"}
          />
          <div className="space-y-5">
            {macroStats.map((macro) => {
              const completion = percent(macro.consumed, macro.target);

              return (
                <div key={macro.key}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className={cn("font-black", macroTextClass[macro.key])}>
                      {macro.label}
                    </span>
                    <span
                      className={cn(
                        "tabular-nums",
                        macro.consumed > macro.target
                          ? "font-black text-accent-600"
                          : "font-semibold text-muted-foreground"
                      )}
                    >
                      {macro.consumed.toLocaleString()}{macro.unit === "g" ? "g" : " kcal"} / {macro.target.toLocaleString()}{macro.unit === "g" ? "g" : " kcal"}
                      {macro.consumed > macro.target ? " · over" : ""}
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#f2f7f5] rounded-full overflow-hidden mt-2">
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

        <Card className="space-y-6 rounded-[24px] border-border px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <SectionHeader
            icon={Utensils}
            label="Meal consistency"
            detail={`${loggedMealCount} of ${mealSlots.length} meals represented today`}
          />
          <div className="grid grid-cols-2 gap-3">
            {mealSlots.map((slot) => (
              <Link
                key={slot.mealType}
                href={slot.logged ? "/app/nutrition" : "/app/log"}
                aria-label={
                  slot.logged
                    ? `${slot.label} logged — open nutrition detail`
                    : `${slot.label} not logged yet — log it now`
                }
                className={cn(
                  "group block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-primary-300",
                  slot.logged
                    ? "border-primary-200 bg-primary-50/70"
                    : "border-primary-100 bg-[#f7faf8]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        slot.logged ? "bg-primary-500" : "bg-[#b8cac4]"
                      )}
                    />
                    <p className="text-sm font-black text-muted-foreground">{slot.label}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground mt-2">
                  {slot.logged ? "Logged · view detail" : "Not logged yet · log it"}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <WeightTrendCard />

      <Link
        href="/app/fitness"
        aria-label="Open Fitness and Activity"
        className="group flex min-h-24 items-center justify-between gap-5 rounded-[24px] border border-primary-200 bg-white px-6 py-5 shadow-[0_12px_30px_rgba(20,90,75,0.07)] transition hover:border-primary-300 hover:bg-primary-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
            <Activity className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-black text-[#16302a]">
              Fitness &amp; Activity
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
              Review workouts, active calories, steps, and readiness alongside your progress.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-primary-600 transition-transform group-hover:translate-x-1" />
      </Link>

      </div>
    </div>
  );
}

function WeightTrendCard() {
  const { entries, addBodyLogEntry, persistence } = useBodyLog();
  const [weightEntry, setWeightEntry] = useState("");
  const [weightTouched, setWeightTouched] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const weightPoints = useMemo(
    () =>
      entries
        .filter((entry): entry is typeof entry & { weightKg: number } =>
          typeof entry.weightKg === "number" && Number.isFinite(entry.weightKg)
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((entry) => ({ date: entry.date, lb: entry.weightKg * LB_PER_KG })),
    [entries]
  );

  const latest = weightPoints[weightPoints.length - 1];
  const first = weightPoints[0];

  const parsed = Number.parseFloat(weightEntry);
  const weightInvalid =
    weightEntry.trim() === "" || !Number.isFinite(Number(weightEntry))
      ? "Enter a number, like 176.5."
      : parsed < 60 || parsed > 1000
        ? "Enter a weight between 60 and 1,000 lb."
        : null;
  const weightError = weightTouched ? weightInvalid : null;

  const saveWeight = async () => {
    setWeightTouched(true);
    if (weightInvalid) return;
    setSaveState("saving");
    setSaveError(null);
    const result = await addBodyLogEntry({
      date: todayIsoDate(),
      weightKg: Math.round((parsed / LB_PER_KG) * 100) / 100,
    });
    if (result.ok) {
      setSaveState("saved");
      setWeightEntry("");
      setWeightTouched(false);
    } else {
      setSaveState("error");
      setSaveError(result.error);
    }
  };

  return (
    <Card className="space-y-6 rounded-[24px] border-border px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
      <SectionHeader
        icon={Scale}
        label="Weight trend"
        detail="Logged weigh-ins over time — saved to your log"
      />
      <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
        <div>
          <label className="block">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.14em]">
              Today&apos;s weight
            </span>
            <div
              className={`mt-2 flex items-center gap-2 rounded-[1rem] border px-4 py-3 transition focus-within:ring-2 ${
                weightError
                  ? "border-red-300 bg-red-50/40 focus-within:ring-red-400"
                  : "border-primary-100 bg-primary-50/60 focus-within:ring-primary-500"
              }`}
            >
              <input
                value={weightEntry}
                onChange={(event) => {
                  setWeightEntry(event.target.value);
                  if (saveState === "saved") setSaveState("idle");
                }}
                onBlur={() => setWeightTouched(true)}
                inputMode="decimal"
                placeholder={latest ? latest.lb.toFixed(1) : "176.5"}
                aria-invalid={weightError ? "true" : undefined}
                className="w-full bg-transparent text-lg font-black text-[#16302a] tabular-nums focus:outline-none placeholder:text-muted-foreground/50"
              />
              <span className="text-sm font-bold text-muted-foreground">lb</span>
            </div>
          </label>
          {weightError ? (
            <p className="mt-2 text-xs font-bold text-red-600" role="alert">
              {weightError}
            </p>
          ) : saveState === "error" && saveError ? (
            <p className="mt-2 text-xs font-bold text-red-600" role="alert">
              {saveError}
            </p>
          ) : saveState === "saved" ? (
            <p className="mt-2 text-xs font-bold text-primary-700" role="status">
              Saved to today&apos;s log.
            </p>
          ) : (
            <p className="text-xs font-semibold text-muted-foreground mt-2">
              Saves to your body log{persistence.mode === "preview" ? " on this device" : ""}.
            </p>
          )}
          <Button
            size="sm"
            className="mt-3 rounded-full"
            onClick={saveWeight}
            loading={saveState === "saving"}
          >
            Save weight
          </Button>
        </div>

        <div className="space-y-3 rounded-[18px] border border-primary-100 bg-[#f7faf8] p-5">
          {weightPoints.length >= 2 && first && latest ? (
            <>
              <WeightSparkline points={weightPoints} />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted-foreground">Start</span>
                <span className="font-black text-[#16302a] tabular-nums">{formatPounds(first.lb)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted-foreground">Latest</span>
                <span className="font-black text-[#16302a] tabular-nums">{formatPounds(latest.lb)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-primary-100 pt-2 text-sm">
                <span className="font-semibold text-muted-foreground">Change</span>
                <span className="font-black text-[#16302a] tabular-nums">
                  {Math.abs(first.lb - latest.lb) < 0.05
                    ? "No change yet"
                    : `${latest.lb < first.lb ? "-" : "+"}${Math.abs(latest.lb - first.lb).toFixed(1)} lb`}
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {weightPoints.length} weigh-ins logged.
              </p>
            </>
          ) : weightPoints.length === 1 && latest ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted-foreground">Latest</span>
                <span className="font-black text-[#16302a] tabular-nums">{formatPounds(latest.lb)}</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                One weigh-in logged. Weigh in again another day and the trend line starts here.
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold leading-6 text-muted-foreground">
              No weights logged yet. Save today&apos;s weight and this panel becomes your
              weight-over-time trend — no sample numbers, only what you log.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function WeightSparkline({ points }: { points: { date: string; lb: number }[] }) {
  const values = points.map((point) => point.lb);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 28 - ((point.lb - min) / span) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className="text-primary-500"
      role="img"
      aria-label={`Weight trend from ${points[0].lb.toFixed(1)} to ${points[points.length - 1].lb.toFixed(1)} lb across ${points.length} weigh-ins`}
    >
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-14 w-full">
        <polyline
          points={coords}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
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
        <h2 className="flex items-center gap-2 font-heading text-lg font-black tracking-tight text-[#16302a]">
          <Icon className="h-5 w-5 text-primary-600" />
          {label}
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{detail}</p>
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
    <div className="min-w-[92px] rounded-2xl bg-white px-4 py-4 text-center shadow-[0_6px_14px_rgba(20,90,75,0.06)]">
      <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-[0.7rem] bg-primary-100 text-primary-600">
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-heading text-2xl font-black leading-none text-[#16302a] tabular-nums">{value}</p>
      <p className="mt-1.5 text-[11px] font-semibold leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
