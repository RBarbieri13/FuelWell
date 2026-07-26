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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
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
  /** CSS colour for the meter fill — the shared --color-macro-* roles. */
  color: string;
  textClass: string;
}

type WindowKey = "7d" | "30d";

const windowOptions: { key: WindowKey; label: string; days: number }[] = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
];

const ALL_MACROS: MacroKey[] = ["calories", "protein", "carbs", "fat"];

const MEAL_SLOTS: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

const LB_PER_KG = 2.20462;

function formatPounds(value: number) {
  return `${value.toFixed(1)} lb`;
}

/** "2026-07-21" → "7/21", without a UTC-parse day shift. */
function shortDate(iso: string) {
  const [, month, day] = iso.split("-");
  return `${Number(month)}/${Number(day)}`;
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
    {
      key: "calories",
      label: "Calories",
      consumed: totals.calories,
      target: targets.calories,
      unit: "kcal",
      color: "var(--color-macro-calories)",
      textClass: "text-primary-700",
    },
    {
      key: "protein",
      label: "Protein",
      consumed: totals.protein,
      target: targets.protein,
      unit: "g",
      color: "var(--color-macro-protein)",
      textClass: "text-sky-700",
    },
    {
      key: "carbs",
      label: "Carbs",
      consumed: totals.carbs,
      target: targets.carbs,
      unit: "g",
      color: "var(--color-macro-carbs)",
      textClass: "text-lemon-700",
    },
    {
      key: "fat",
      label: "Fat",
      consumed: totals.fat,
      target: targets.fat,
      unit: "g",
      color: "var(--color-macro-fat)",
      textClass: "text-accent-600",
    },
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

      <div className="fw-page-inner max-w-[1120px] space-y-4 pb-28 md:space-y-6 md:pb-8">

      <Card
        variant="tinted"
        padding="none"
        className="fw-mint-panel border-primary-200/80 p-4 md:p-6"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
          <div className="min-w-0 space-y-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-black text-primary-700 ring-1 ring-inset ring-primary-100 md:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="min-w-0">{verdict.dataNote}</span>
            </span>
            <div>
              <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
                {verdict.title}
              </p>
              <h2 className="mt-2 font-heading text-[22px] font-black tracking-tight text-ink md:text-3xl">
                {verdict.headline}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-ink-muted md:text-base">
                {verdict.detail}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatTile label="Meals today" value={`${loggedMealCount} of 4`} icon={CalendarCheck} />
            <StatTile
              label="Calories today"
              value={hasLoggedToday ? totals.calories.toLocaleString() : "—"}
              icon={Flame}
            />
            <StatTile
              label="Protein today"
              value={hasLoggedToday ? `${totals.protein}g` : "—"}
              icon={Utensils}
            />
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="fw-dark-panel">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-white/12 text-primary-200 ring-1 ring-inset ring-white/20">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-200">
                One next step
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-white/80">
                {nextAction.detail}
              </p>
            </div>
          </div>
          <Link href={nextAction.href} className="shrink-0">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              {nextAction.label}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeader
            as="h2"
            icon={BarChart3}
            title="Calories and macro split per day"
            description="Each bar is a day. Calories can be shown as totals, with protein, carbs, and fat stacked underneath."
            className="min-w-0 flex-1"
          />
          <div
            role="group"
            aria-label="Chart window"
            className="flex shrink-0 gap-1 self-start rounded-full bg-surface-sunken p-1 ring-1 ring-inset ring-hairline"
          >
            {windowOptions.map((option) => {
              const selected = windowKey === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setWindowKey(option.key)}
                  aria-pressed={selected}
                  className={cn(
                    "fw-press min-h-11 rounded-full px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1 md:min-h-9",
                    selected
                      ? "bg-surface text-ink shadow-e1 ring-1 ring-inset ring-hairline-strong"
                      : "text-ink-muted hover:bg-surface/60 hover:text-primary-800"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <SeriesToggle active={activeMacros} onToggle={toggleMacro} />

        <MacroStackedBars days={series} active={activeMacros} />

        <p className="text-xs font-semibold leading-5 text-ink-subtle">
          {loggedInWindow > 0
            ? `${loggedInWindow} logged ${loggedInWindow === 1 ? "day" : "days"} in this window — older bars are sample history.`
            : "Sample history shown until you start logging. None of these bars are measured intake yet."}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <Card className="space-y-5">
          <SectionHeader
            as="h2"
            icon={CheckCircle2}
            title="Where calories and macros lean"
            description={
              hasLoggedToday
                ? "Today's intake next to your daily targets"
                : "Targets shown until logging starts"
            }
          />
          <div className="space-y-4">
            {macroStats.map((macro) => {
              const over = macro.consumed > macro.target;
              const suffix = macro.unit === "g" ? "g" : " kcal";

              return (
                <div key={macro.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                    <span className={cn("font-black", macro.textClass)}>{macro.label}</span>
                    <span
                      className={cn(
                        "tabular-nums",
                        over ? "font-black text-accent-600" : "font-semibold text-ink-muted"
                      )}
                    >
                      {macro.consumed.toLocaleString()}
                      {suffix} / {macro.target.toLocaleString()}
                      {suffix}
                      {over ? " · over" : ""}
                    </span>
                  </div>
                  <ProgressMeter
                    className="mt-2"
                    value={macro.consumed}
                    target={macro.target}
                    color={macro.color}
                    label={`${macro.label}: ${macro.consumed.toLocaleString()}${suffix} of ${macro.target.toLocaleString()}${suffix}`}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-5">
          <SectionHeader
            as="h2"
            icon={Utensils}
            title="Meal consistency"
            description={`${loggedMealCount} of ${mealSlots.length} meals represented today`}
            action={
              <Badge variant={loggedMealCount === mealSlots.length ? "success" : "neutral"} dot>
                {loggedMealCount}/{mealSlots.length}
              </Badge>
            }
          />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
                  "fw-press group block min-h-[76px] rounded-2xl p-3.5 ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 sm:p-4",
                  slot.logged
                    ? "bg-primary-50 ring-primary-200 hover:bg-primary-100/70"
                    : "bg-surface-muted ring-hairline-strong hover:bg-primary-50/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-inset",
                        slot.logged
                          ? "bg-primary-500 ring-primary-500/25"
                          : "bg-ink-faint ring-ink-faint/25"
                      )}
                    />
                    <p className="truncate text-sm font-black text-ink">{slot.label}</p>
                  </div>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-primary-500 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5"
                    strokeWidth={2.25}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">
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
        className="fw-press group flex min-h-24 items-center justify-between gap-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:px-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Activity className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-black text-ink">
              Fitness &amp; Activity
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
              Review workouts, active calories, steps, and readiness alongside your progress.
            </p>
          </div>
        </div>
        <ArrowRight
          className="h-5 w-5 shrink-0 text-primary-600 transition-transform duration-200 ease-out-soft group-hover:translate-x-1"
          strokeWidth={2.25}
        />
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

  const change = first && latest ? latest.lb - first.lb : 0;
  const changeIsFlat = Math.abs(change) < 0.05;

  return (
    <Card className="space-y-5">
      <SectionHeader
        as="h2"
        icon={Scale}
        title="Weight trend"
        description="Logged weigh-ins over time — saved to your log"
        action={
          weightPoints.length > 0 ? (
            <Badge variant="neutral">
              {weightPoints.length} weigh-in{weightPoints.length === 1 ? "" : "s"}
            </Badge>
          ) : undefined
        }
      />
      <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
        <div className="min-w-0">
          <label className="block">
            <span className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle">
              Today&apos;s weight
            </span>
            <span
              className={cn(
                "mt-2 flex items-center gap-2 rounded-[1rem] px-4 py-3 ring-1 ring-inset transition-shadow duration-200 ease-out-soft focus-within:ring-[3px]",
                weightError
                  ? "bg-red-50/60 ring-red-300 focus-within:ring-red-500"
                  : "bg-surface-muted ring-hairline-strong focus-within:ring-primary-600"
              )}
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
                className="w-full min-w-0 bg-transparent text-lg font-black tabular-nums text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <span className="shrink-0 text-sm font-bold text-ink-subtle">lb</span>
            </span>
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
            <p className="mt-2 text-xs font-semibold text-ink-subtle">
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

        <div className="min-w-0 space-y-3 rounded-[18px] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline sm:p-5">
          {weightPoints.length >= 2 && first && latest ? (
            <>
              <WeightTrendChart points={weightPoints} />
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-semibold text-ink-muted">Start</dt>
                  <dd className="font-black tabular-nums text-ink">{formatPounds(first.lb)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="font-semibold text-ink-muted">Latest</dt>
                  <dd className="font-black tabular-nums text-ink">{formatPounds(latest.lb)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-hairline pt-2">
                  <dt className="font-semibold text-ink-muted">Change</dt>
                  <dd
                    className={cn(
                      "font-black tabular-nums",
                      changeIsFlat ? "text-ink" : change < 0 ? "text-primary-700" : "text-accent-600"
                    )}
                  >
                    {changeIsFlat
                      ? "No change yet"
                      : `${change < 0 ? "−" : "+"}${Math.abs(change).toFixed(1)} lb`}
                  </dd>
                </div>
              </dl>
            </>
          ) : weightPoints.length === 1 && latest ? (
            <>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-ink-muted">Latest</span>
                <span className="font-black tabular-nums text-ink">{formatPounds(latest.lb)}</span>
              </div>
              <div className="rounded-[14px] bg-surface-sunken px-3 py-6 text-center">
                <Scale className="mx-auto h-6 w-6 text-ink-faint" strokeWidth={1.75} />
                <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">
                  One weigh-in logged. Weigh in again another day and the trend line starts here.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-[14px] bg-surface-sunken px-3 py-8 text-center">
              <Scale className="mx-auto h-7 w-7 text-ink-faint" strokeWidth={1.75} />
              <p className="mt-2 text-sm font-black text-ink">No weights logged yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs font-semibold leading-5 text-ink-muted">
                Save today&apos;s weight and this panel becomes your weight-over-time trend — no
                sample numbers, only what you log.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const PLOT_W = 100;
const PLOT_H = 40;

/**
 * Weigh-in trend. Gridlines and a labelled y-axis give the line a scale, the
 * gradient area gives it depth, and every point is a real hit target that
 * pins a readout — a line with no axis is decoration, not data.
 */
function WeightTrendChart({ points }: { points: { date: string; lb: number }[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const { lo, hi, coords, area, ticks } = useMemo(() => {
    const values = points.map((point) => point.lb);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Pad the domain so a nearly-flat series doesn't render glued to an edge.
    const rawSpan = max - min;
    const pad = rawSpan < 0.6 ? 0.6 : rawSpan * 0.18;
    const low = min - pad;
    const high = max + pad;
    const span = high - low || 1;

    const xAt = (index: number) =>
      points.length === 1 ? PLOT_W / 2 : (index / (points.length - 1)) * PLOT_W;
    const yAt = (lb: number) => PLOT_H - ((lb - low) / span) * PLOT_H;

    const path = points
      .map((point, index) => `${xAt(index).toFixed(2)},${yAt(point.lb).toFixed(2)}`)
      .join(" ");

    return {
      lo: low,
      hi: high,
      coords: path,
      area: `M0,${PLOT_H} L${path.split(" ").join(" L")} L${PLOT_W},${PLOT_H} Z`,
      ticks: points.map((point, index) => ({
        ...point,
        x: xAt(index),
        y: yAt(point.lb),
      })),
    };
  }, [points]);

  const active = activeIndex !== null ? ticks[activeIndex] : null;
  const previous = activeIndex !== null && activeIndex > 0 ? ticks[activeIndex - 1] : null;
  const delta = active && previous ? active.lb - previous.lb : null;

  const gradientId = `fw-weight-fill-${points.length}`;

  return (
    <div className="min-w-0">
      <div className="flex min-h-[2.25rem] items-start justify-between gap-2">
        {active ? (
          <p className="text-xs font-black tabular-nums text-ink" role="status">
            {shortDate(active.date)} · {active.lb.toFixed(1)} lb
            {delta !== null && Math.abs(delta) >= 0.05 ? (
              <span
                className={cn(
                  "ml-1.5 font-black",
                  delta < 0 ? "text-primary-700" : "text-accent-600"
                )}
              >
                {delta < 0 ? "−" : "+"}
                {Math.abs(delta).toFixed(1)} lb
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs font-semibold text-ink-subtle">
            Tap a point for that weigh-in.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <div
          aria-hidden="true"
          className="flex w-9 shrink-0 flex-col justify-between py-px text-right text-[10px] font-bold tabular-nums leading-none text-ink-faint"
        >
          <span>{hi.toFixed(0)}</span>
          <span>{((hi + lo) / 2).toFixed(0)}</span>
          <span>{lo.toFixed(0)}</span>
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
            preserveAspectRatio="none"
            className="h-20 w-full text-primary-500"
            role="img"
            aria-label={`Weight trend across ${points.length} weigh-ins, from ${points[0].lb.toFixed(1)} pounds on ${shortDate(points[0].date)} to ${points[points.length - 1].lb.toFixed(1)} pounds on ${shortDate(points[points.length - 1].date)}. Chart scale runs ${lo.toFixed(0)} to ${hi.toFixed(0)} pounds.`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.26" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0, PLOT_H / 2].map((y) => (
              <line
                key={y}
                x1="0"
                x2={PLOT_W}
                y1={y}
                y2={y}
                stroke="var(--color-hairline-strong)"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* Baseline — the axis the series is measured against. */}
            <line
              x1="0"
              x2={PLOT_W}
              y1={PLOT_H}
              y2={PLOT_H}
              stroke="var(--color-hairline-strong)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />

            <path
              d={area}
              fill={`url(#${gradientId})`}
              style={{
                opacity: drawn ? 1 : 0,
                transition: "opacity 700ms var(--ease-out-soft)",
              }}
            />
            <polyline
              points={coords}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              style={{
                strokeDashoffset: drawn ? 0 : 1,
                transition: "stroke-dashoffset 900ms var(--ease-out-soft)",
              }}
            />
          </svg>

          <div className="absolute inset-0">
            {ticks.map((tick, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={`${tick.date}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex((current) => (current === index ? null : index))}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  aria-label={`${shortDate(tick.date)}: ${tick.lb.toFixed(1)} pounds`}
                  className="absolute top-0 h-full -translate-x-1/2 rounded-md focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  style={{
                    left: `${tick.x}%`,
                    width: `max(1.75rem, ${(100 / points.length).toFixed(2)}%)`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out-soft",
                      isActive
                        ? "h-3 w-3 bg-primary-600 ring-4 ring-primary-500/25"
                        : "h-1.5 w-1.5 bg-primary-500/70"
                    )}
                    style={{ top: `${(tick.y / PLOT_H) * 100}%` }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-1.5 flex justify-between pl-11 text-[10px] font-bold tabular-nums text-ink-faint">
        <span>{shortDate(points[0].date)}</span>
        <span>{shortDate(points[points.length - 1].date)}</span>
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
    <div className="min-w-0 rounded-2xl bg-surface px-2 py-3 text-center shadow-e1 sm:px-3 sm:py-4">
      <span className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-[0.7rem] bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <p className="truncate font-heading text-lg font-black leading-none tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-semibold leading-tight text-ink-subtle sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}
