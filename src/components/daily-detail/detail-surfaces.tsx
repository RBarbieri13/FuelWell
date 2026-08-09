"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  Activity,
  ArrowRight,
  Beef,
  Bike,
  Check,
  ChevronDown,
  Copy,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Info,
  Pencil,
  Moon,
  Plus,
  Salad,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Timer,
  Trash2,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalorieBalanceChart,
  type ActivityOutputSignal,
} from "@/components/daily-detail/calorie-balance-chart";
import { FitnessWorkoutManager } from "@/components/daily-detail/fitness-workout-manager";
import { NutritionEditPanel } from "@/components/daily-detail/nutrition-edit-panel";
import { useDayLog } from "@/lib/use-day-log";
import { useWorkoutLog } from "@/lib/use-workout-log";
import {
  formatMealType,
  percentOf,
  remaining,
  sumMealItems,
  sumMeals,
  type MacroTargets,
  type MealRecord,
  type MealType,
} from "@/lib/fuelwell-data";
import type { WorkoutEntry } from "@/lib/coach/types";

type Tone = "primary" | "sky" | "lemon" | "accent" | "teal" | "neutral";

type ActivityRecord = {
  id: string;
  type: "walk" | "workout" | "mobility" | "recovery";
  title: string;
  subtitle: string;
  time: string;
  duration: string;
  calories: number;
  intensity: string;
  source: "Logged" | "Estimated" | "Planned";
  items: { label: string; value: string; tone: Tone }[];
  icon: LucideIcon;
  workoutHref?: string;
};

const baseActivityLog: ActivityRecord[] = [
  {
    id: "morning-walk",
    type: "walk",
    title: "Morning walk",
    subtitle: "Easy neighborhood loop",
    time: "8:10 AM",
    duration: "24 min",
    calories: 118,
    intensity: "Easy",
    source: "Estimated",
    icon: Footprints,
    items: [
      { label: "Steps", value: "2,850", tone: "neutral" },
      { label: "Pace", value: "Easy", tone: "neutral" },
      { label: "Zone", value: "1", tone: "neutral" },
      { label: "Load", value: "Low", tone: "neutral" },
    ],
  },
  {
    id: "zone-2-ride",
    type: "workout",
    title: "Zone 2 ride",
    subtitle: "Conversational aerobic base",
    time: "5:30 PM",
    duration: "42 min",
    calories: 310,
    intensity: "Easy",
    source: "Planned",
    icon: Bike,
    workoutHref: "/app/workouts/zone-2-ride",
    items: [
      { label: "Time", value: "42 min", tone: "neutral" },
      { label: "Burn", value: "310 kcal", tone: "neutral" },
      { label: "Effort", value: "4/10", tone: "neutral" },
      { label: "Fuel", value: "Due", tone: "lemon" },
    ],
  },
  {
    id: "mobility-reset",
    type: "mobility",
    title: "Mobility reset",
    subtitle: "Hips and upper back",
    time: "Tonight",
    duration: "18 min",
    calories: 55,
    intensity: "Light",
    source: "Planned",
    icon: HeartPulse,
    workoutHref: "/app/workouts/mobility-reset",
    items: [
      { label: "Range", value: "Hips", tone: "neutral" },
      { label: "Cost", value: "Low", tone: "neutral" },
      { label: "Sets", value: "3", tone: "neutral" },
      { label: "Ready", value: "Yes", tone: "neutral" },
    ],
  },
];

const fitnessTargets = {
  activeCalories: 500,
  minutes: 90,
  steps: 8500,
  recovery: 100,
};

function activityFromWorkout(workout: WorkoutEntry): ActivityRecord {
  const category = workout.category.toLowerCase();
  const isCardio = /cardio|run|walk|ride|bike|swim|row|hike|elliptical/.test(category);
  const isMobility = /mobility|yoga|pilates|stretch/.test(category);
  const isStrength = /strength|lift|resistance|weight/.test(category);
  const Icon = isMobility ? HeartPulse : isCardio ? Bike : isStrength ? Dumbbell : Activity;
  const time = new Date(workout.loggedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  // Sessions logged from a library workout carry ids like
  // "live-<workout-id>-<timestamp>"; recover the detail-page link from them.
  const libraryId = workout.id.match(/^(?:live|workout)-(.+)-\d+$/)?.[1];

  return {
    id: workout.id,
    type: isMobility ? "mobility" : "workout",
    title: workout.name,
    subtitle: workout.notes || workout.category,
    time,
    duration: `${workout.durationMin} min`,
    calories: Math.round(workout.calories ?? 0),
    intensity: workout.met && workout.met >= 7 ? "Hard" : workout.met && workout.met >= 5 ? "Moderate" : "Easy",
    source: workout.source === "coach" ? "Logged" : workout.source === "database" ? "Logged" : "Estimated",
    icon: Icon,
    workoutHref: libraryId ? `/app/workouts/${libraryId}` : undefined,
    items: [
      { label: "Time", value: `${workout.durationMin} min`, tone: "neutral" },
      {
        label: "Burn",
        value: Math.round(workout.calories ?? 0) > 0 ? `${Math.round(workout.calories ?? 0)} kcal` : "—",
        tone: "neutral",
      },
      { label: workout.distanceMiles ? "Miles" : "Type", value: workout.distanceMiles ? workout.distanceMiles.toFixed(1) : workout.category, tone: "neutral" },
      { label: "Source", value: workout.source === "coach" ? "Coach" : workout.source === "database" ? "Plan" : "Manual", tone: "neutral" },
    ],
  };
}

function buildActivityLog(workouts: WorkoutEntry[]) {
  const logged = workouts.map(activityFromWorkout);
  return [...logged, ...baseActivityLog];
}

/**
 * Planned activities have not happened yet, so they are tallied separately —
 * "Active burn" and net calories only count completed (logged/estimated)
 * movement, with planned burn surfaced as an expected-later figure.
 */
function calculateFitnessTotals(activities: ActivityRecord[]) {
  return activities.reduce(
    (total, activity) => {
      const minutes = Number.parseInt(activity.duration, 10) || 0;
      if (activity.source === "Planned") {
        return {
          ...total,
          plannedCalories: total.plannedCalories + activity.calories,
          plannedMinutes: total.plannedMinutes + minutes,
        };
      }
      return {
        ...total,
        calories: total.calories + activity.calories,
        minutes: total.minutes + minutes,
      };
    },
    { calories: 0, minutes: 0, plannedCalories: 0, plannedMinutes: 0 }
  );
}

function activityOutputSignal(activity: ActivityRecord): ActivityOutputSignal {
  return {
    label: activity.title,
    calories: activity.calories,
    tone:
      activity.type === "walk"
        ? "steps"
        : activity.type === "mobility" || activity.type === "recovery"
          ? "mobility"
          : "training",
    detail: `${activity.duration} · ${activity.subtitle} · ${activity.source.toLowerCase()}`,
  };
}

const estimatedSteps = 6420;
const recoveryReadiness = 72;

/**
 * One tone = one icon plate, one pill, one meter colour, one stat chip. Every
 * variant carries `ring-1 ring-inset` rather than a border so tinted chips read
 * as one family across nutrition and fitness and never add a pixel of layout.
 * (The ring *width* used to be missing here, so the ring colours below were
 * declared but never painted — the plates rendered as flat fills.)
 */
const RING = "ring-1 ring-inset";

const toneStyles = {
  primary: {
    chip: `bg-primary-50 text-primary-700 ${RING} ring-primary-100`,
    pill: `bg-primary-50 text-primary-800 ${RING} ring-primary-100`,
    meter: "var(--color-macro-calories)",
    macro: `bg-primary-50 text-primary-800 ${RING} ring-primary-100`,
  },
  sky: {
    chip: `bg-sky-50 text-sky-700 ${RING} ring-sky-100`,
    pill: `bg-sky-50 text-sky-700 ${RING} ring-sky-100`,
    meter: "var(--color-macro-protein)",
    macro: `bg-sky-50 text-sky-700 ${RING} ring-sky-100`,
  },
  lemon: {
    chip: `bg-lemon-50 text-lemon-700 ${RING} ring-lemon-100`,
    pill: `bg-lemon-50 text-lemon-700 ${RING} ring-lemon-100`,
    meter: "var(--color-macro-carbs)",
    macro: `bg-lemon-50 text-lemon-700 ${RING} ring-lemon-100`,
  },
  accent: {
    chip: `bg-accent-50 text-accent-700 ${RING} ring-accent-100`,
    pill: `bg-accent-50 text-accent-700 ${RING} ring-accent-100`,
    meter: "var(--color-macro-fat)",
    macro: `bg-accent-50 text-accent-700 ${RING} ring-accent-100`,
  },
  teal: {
    chip: `bg-teal-500/10 text-teal-600 ${RING} ring-teal-500/20`,
    pill: `bg-teal-500/10 text-teal-600 ${RING} ring-teal-500/20`,
    meter: "var(--color-teal-500)",
    macro: `bg-teal-500/10 text-teal-600 ${RING} ring-teal-500/20`,
  },
  neutral: {
    chip: `bg-surface-muted text-ink-muted ${RING} ring-hairline-strong`,
    pill: `bg-surface-muted text-ink-muted ${RING} ring-hairline-strong`,
    meter: "var(--color-primary-300)",
    macro: `bg-surface-muted text-ink ${RING} ring-hairline-strong`,
  },
} as const;

/**
 * Single recipe for the pill-shaped links and buttons that repeat across these
 * surfaces. They previously drifted apart on radius, target size, and hover,
 * so every row now shares one size scale, one inset hairline, and one focus
 * treatment.
 */
function pillLinkClass(
  tone: "primary" | "neutral" | "danger" = "primary",
  size: "sm" | "md" = "md"
) {
  return cn(
    "fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0",
    size === "sm" ? "px-3.5 py-2 text-xs" : "px-4 py-2 text-sm",
    tone === "primary" && "bg-primary-50 text-primary-700 ring-primary-100 hover:bg-primary-100",
    tone === "neutral" &&
      "bg-surface-muted text-ink-muted ring-hairline-strong hover:bg-primary-50 hover:text-primary-700",
    tone === "danger" &&
      "bg-surface-muted text-accent-700 ring-hairline-strong hover:bg-accent-50 hover:text-accent-700"
  );
}

export function FitnessDetailSurface() {
  const { workouts } = useWorkoutLog();
  const activityLog = useMemo(() => buildActivityLog(workouts), [workouts]);
  const fitnessTotals = useMemo(() => calculateFitnessTotals(activityLog), [activityLog]);

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-5">
          <h1 className="fw-heading text-2xl md:text-4xl">Activity detail</h1>
          <p className="fw-muted mt-1 text-sm md:text-base">
            Today&apos;s movement · what&apos;s counting toward your activity
          </p>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <DetailHero
          icon={Activity}
          label="Today's movement"
          title="What makes up today's fitness picture"
          copy="Every logged, planned, or estimated activity signal is shown here so the daily recommendation stays readable and honest."
          href="/app/workouts"
          action="Add workout"
        />

        <FitnessSummaryCards totals={fitnessTotals} />

        <section className="space-y-4">
          {activityLog.map((activity) => (
            <ActivityLogCard key={activity.id} activity={activity} />
          ))}
        </section>

        <div id="edit-activity" className="scroll-mt-24">
          <FitnessWorkoutManager />
        </div>

        <Card className="rounded-[1.5rem] px-5 py-5 md:px-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <SectionHeader
              as="h2"
              icon={Info}
              title="Activity source check"
              description={
                workouts.length > 0
                  ? `${workouts.length} logged workout${workouts.length === 1 ? "" : "s"} count first. Planned movement stays visible so you can compare what happened with what the coach expected.`
                  : "Logged workouts count first. Planned movement stays visible so you can compare what happened with what the coach expected."
              }
              className="min-w-0"
            />
            <div className="flex flex-wrap gap-2">
              <Link href="/app/daily-review" className={pillLinkClass("primary")}>
                View full day
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </Link>
              <Link href="/app/activity" className={pillLinkClass("neutral")}>
                Fuel timing verdict
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </Link>
            </div>
          </div>
        </Card>

        <Card
          variant="outlined"
          className="rounded-[1.5rem] border-lemon-200 bg-lemon-50/80 px-5 py-5 md:px-6"
        >
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-lemon-700 ring-1 ring-inset ring-lemon-200">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-lg font-black text-lemon-800">
                Data honesty
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-lemon-700">
                Workout plans and recovery are user-entered examples. Steps and active calories are deterministic estimates until a wearable connection is added.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function NutritionDetailSurface({
  meals: initialMeals,
  targets,
}: {
  meals: MealRecord[];
  targets: MacroTargets;
}) {
  const { meals, totals, duplicateMeal, hydrateDayLog, removeMeal } = useDayLog();

  useEffect(() => {
    hydrateDayLog(initialMeals);
  }, [hydrateDayLog, initialMeals]);

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-5">
          <h1 className="fw-heading text-2xl md:text-4xl">Nutrition detail</h1>
          <p className="fw-muted mt-1 text-sm md:text-base">
            Today&apos;s plate · what&apos;s counting toward your score
          </p>
        </div>
      </header>

      <div className="fw-page-inner pb-28 md:pb-8">
        {/* Grouping tray sits one step *below* the cards it holds (e1 under
            their e2) — a tray at e3 made the cards inside it look sunken. */}
        <div className="space-y-4 rounded-[1.75rem] bg-surface/70 p-3 shadow-e1 md:p-4">
          <DetailHero
            icon={Salad}
            label="Today's plate"
            title="What makes up today's score"
            copy="If a meal isn't logged here, it isn't counted on the dashboard. Keep it honest and the daily decision stays accurate."
            href="/app/log"
            action="Add food"
          />

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <TargetTile label="Calories" current={totals.calories} target={targets.calories} unit="kcal" tone="primary" icon={Flame} />
            <TargetTile label="Protein" current={totals.protein} target={targets.protein} unit="g" tone="sky" icon={Beef} />
            <TargetTile label="Carbs" current={totals.carbs} target={targets.carbs} unit="g" tone="lemon" icon={Wheat} />
            <TargetTile label="Fat" current={totals.fat} target={targets.fat} unit="g" tone="accent" icon={Droplet} />
          </section>

          {meals.length === 0 ? (
            <EmptyLedgerCard
              title="No nutrition inputs yet"
              detail="The dashboard score is blank because there are no meals to inspect. Log one meal and this page becomes the source of truth."
              href="/app/log"
              action="Log first meal"
            />
          ) : (
            <section className="space-y-4">
              {meals.map((meal) => (
                <MealLogCard
                  key={meal.id}
                  meal={meal}
                  onDelete={() => removeMeal(meal.id)}
                  onDuplicate={() => duplicateMeal(meal.id)}
                />
              ))}
              {!meals.some((meal) => meal.mealType === "dinner") && (
                <Card
                  variant="outlined"
                  className="flex flex-col gap-4 rounded-[1.5rem] border-dashed border-primary-300 bg-surface/60 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <MealIcon mealType="dinner" muted />
                    <div className="min-w-0">
                      <h2 className="text-lg font-black text-ink-muted md:text-xl">Dinner</h2>
                      <p className="text-sm font-semibold tabular-nums text-ink-subtle">
                        Not logged yet · {remaining(totals.calories, targets.calories).toLocaleString()} kcal of room left
                      </p>
                    </div>
                  </div>
                  <Link href="/app/log" className="inline-flex shrink-0">
                    <Button variant="tonal" className="rounded-full px-5">
                      <Plus className="h-4 w-4" strokeWidth={2.25} />
                      Add dinner
                    </Button>
                  </Link>
                </Card>
              )}
            </section>
          )}

          <NutritionEditPanel />

          <section className="grid gap-3 md:grid-cols-3">
            <DetailLinkCard
              icon={Sparkles}
              title="Full-day ledger"
              detail="See nutrition beside fitness before asking the coach what to do next."
              href="/app/daily-review"
              action="Open daily review"
            />
            <DetailLinkCard
              icon={Activity}
              title="Activity detail"
              detail="Compare food room against planned and logged activity."
              href="/app/fitness"
              action="Open activity detail"
            />
            <DetailLinkCard
              icon={UtensilsCrossed}
              title="Add missing meal"
              detail="Keep the score honest by filling in anything that is not counted yet."
              href="/app/log"
              action="Log food"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export function DailyReviewSurface({
  meals: initialMeals,
  targets,
}: {
  meals: MealRecord[];
  targets: MacroTargets;
}) {
  const { workouts, persistence: workoutPersistence } = useWorkoutLog();
  const { meals, hydrateDayLog } = useDayLog();
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [nutritionExpanded, setNutritionExpanded] = useState(true);
  const [fitnessExpanded, setFitnessExpanded] = useState(true);

  useEffect(() => {
    hydrateDayLog(initialMeals);
  }, [hydrateDayLog, initialMeals]);

  const activityLog = useMemo(() => buildActivityLog(workouts), [workouts]);
  const fitnessTotals = useMemo(() => calculateFitnessTotals(activityLog), [activityLog]);
  const activityOutputSignals = useMemo(
    () => activityLog.map(activityOutputSignal),
    [activityLog]
  );
  const totals = sumMeals(meals);
  const netCalories = Math.max(0, totals.calories - fitnessTotals.calories);
  const calorieRoom = remaining(totals.calories, targets.calories);

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-5">
          <h1 className="fw-heading text-2xl md:text-4xl">Daily review</h1>
          <p className="fw-muted mt-1 text-sm md:text-base">
            Nutrition + fitness · the full health ledger for today
          </p>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <DailyReviewSection
          icon={Sparkles}
          eyebrow="Overview"
          title="Today's whole picture"
          description="Calories eaten, calories burned, the room left after activity, and protein — today's headline numbers."
          expanded={overviewExpanded}
          onToggle={() => setOverviewExpanded((value) => !value)}
          collapsedText="Overview collapsed. Expand it to review today's headline, calorie room, burn, and protein status."
        >
          <div className="space-y-4">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <TargetTile label="Food in" current={totals.calories} target={targets.calories} unit="kcal" tone="primary" icon={Flame} href="/app/nutrition" />
              <TargetTile
                label="Active burn"
                current={fitnessTotals.calories}
                target={fitnessTargets.activeCalories}
                unit="kcal"
                tone="accent"
                icon={Dumbbell}
                href="/app/fitness"
                footnote={
                  fitnessTotals.plannedCalories > 0
                    ? `Completed only · ${fitnessTotals.plannedCalories.toLocaleString()} kcal still planned`
                    : "Completed activity only"
                }
              />
              <SimpleSummaryCard
                label="Net calories"
                value={netCalories.toLocaleString()}
                detail={`${calorieRoom.toLocaleString()} kcal left of the food target · completed burn adds ${fitnessTotals.calories.toLocaleString()} kcal back`}
                tone="teal"
                icon={Target}
                href="#energy-ledger"
              />
              <TargetTile label="Protein" current={totals.protein} target={targets.protein} unit="g" tone="sky" icon={Beef} href="/app/nutrition" />
            </section>
          </div>
        </DailyReviewSection>

        <DailyReviewSection
          icon={ShieldCheck}
          eyebrow="Daily summary"
          title="What needs attention"
          description="A short read on logged meals, movement signals, and the next place to review."
          expanded={summaryExpanded}
          onToggle={() => setSummaryExpanded((value) => !value)}
          collapsedText="Daily summary collapsed. Expand it to see the meal count, activity count, and next best review."
        >
          <div className="space-y-4">
            <section className="grid gap-3 md:grid-cols-3">
              <SimpleSummaryCard
                label="Logged meals"
                value={`${meals.length}`}
                detail="Meals counted toward today's nutrition."
                tone="primary"
                icon={Salad}
                href="#nutrition-log"
              />
              <SimpleSummaryCard
                label="Activity entries"
                value={`${activityLog.length}`}
                detail="Workouts and movement counted today."
                tone="accent"
                icon={Activity}
                href="#fitness-log"
              />
              <SimpleSummaryCard
                label="Next best review"
                value={calorieRoom > 0 ? "Dinner" : "Coach"}
                detail={
                  calorieRoom > 0
                    ? "Calorie room remains — log or plan dinner next."
                    : "The day is fully spent — ask coach what still fits."
                }
                tone="sky"
                icon={Sparkles}
                href={calorieRoom > 0 ? "/app/log" : "/app/coach"}
              />
            </section>
            {/* The single primary action on Daily review — everything else on
                this page steps down to tonal pills and card links. */}
            <Link href="/app/coach" className="inline-flex w-full sm:w-auto">
              <Button className="w-full rounded-full px-5 sm:w-auto">
                <Sparkles className="h-4 w-4" strokeWidth={2.25} />
                Ask coach what to do next
              </Button>
            </Link>
          </div>
        </DailyReviewSection>

        <section aria-label="Energy ledger" id="energy-ledger" className="min-w-0 scroll-mt-24">
          <CalorieBalanceChart
            meals={meals}
            targets={targets}
            activityOutputSignals={activityOutputSignals}
          />
        </section>

        <DailyReviewSection
          icon={Salad}
          eyebrow="Details"
          title="Nutrition and fitness logs"
          description="Expand only the ledger you need when reviewing or editing the day."
          expanded={detailsExpanded}
          onToggle={() => setDetailsExpanded((value) => !value)}
          collapsedText="Log sections are collapsed. Expand Details when you want to edit meals or activity for this day."
        >
            <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <CollapsibleLogPanel
                id="nutrition-log"
                icon={Salad}
                title="Nutrition log"
                detail={`${meals.length} meal${meals.length === 1 ? "" : "s"} counted today`}
                href="/app/log"
                action="Edit day"
                expanded={nutritionExpanded}
                onToggle={() => setNutritionExpanded((value) => !value)}
              >
                {meals.length === 0 ? (
                  <EmptyLedgerCard
                    title="No meals logged"
                    detail="Log a meal and this side becomes the exact macro ledger."
                    href="/app/log"
                    action="Add food"
                  />
                ) : (
                  meals.map((meal) => <MealLogCard key={meal.id} meal={meal} compact />)
                )}
              </CollapsibleLogPanel>

              <CollapsibleLogPanel
                id="fitness-log"
                icon={Activity}
                title="Fitness log"
                detail={`${activityLog.length} activity signal${activityLog.length === 1 ? "" : "s"} counted today`}
                href="/app/fitness"
                action="Edit day"
                expanded={fitnessExpanded}
                onToggle={() => setFitnessExpanded((value) => !value)}
              >
                {workoutPersistence.mode === "unknown" || workoutPersistence.status === "loading" ? (
                  // Nested inside an already-raised panel, so these status
                  // cards are inset rather than a second floating layer.
                  <Card
                    role="status"
                    variant="tinted"
                    padding="none"
                    className="flex items-start gap-3 rounded-[1.25rem] border-primary-200/70 bg-primary-50/55 px-5 py-4"
                  >
                    <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary-100" />
                    <span className="min-w-0">
                      <p className="text-sm font-black text-primary-800">Loading your activity log...</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-primary-900/65">
                        FuelWell is checking your saved workouts before showing today&apos;s review.
                      </p>
                    </span>
                  </Card>
                ) : workoutPersistence.status === "error" ? (
                  <Card
                    role="alert"
                    variant="tinted"
                    padding="none"
                    className="flex items-start gap-3 rounded-[1.25rem] border-accent-200 bg-accent-100/55 px-5 py-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-accent-700 ring-1 ring-inset ring-accent-200">
                      <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0">
                      <p className="text-sm font-black text-accent-700">Activity log could not load</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-accent-700/80">
                        {workoutPersistence.error || "Refresh to try the saved workout check again."}
                      </p>
                    </span>
                  </Card>
                ) : (
                  <div data-testid="workout-log-ready" className="contents">
                    {activityLog.map((activity) => (
                      <ActivityLogCard key={activity.id} activity={activity} compact />
                    ))}
                  </div>
                )}
              </CollapsibleLogPanel>
            </section>
        </DailyReviewSection>
      </div>
    </div>
  );
}

function DailyReviewSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  expanded,
  onToggle,
  collapsedText,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  collapsedText: string;
  children: ReactNode;
}) {
  const contentId = useId();
  return (
    // Tinted tray at e1; the header plate above it carries the only lift
    // (fw-lift-edge = inset highlight + e2) so the region reads as one depth
    // step rather than two stacked drop shadows.
    <section className="rounded-[2rem] border border-primary-200/90 bg-primary-50/35 p-3 shadow-e1 md:p-4">
      <div className="fw-lift-edge rounded-[1.5rem] border border-white/85 bg-surface/72 px-4 py-3.5 md:px-5">
        {/* The whole header is the disclosure control: it sits at the top of
            the region it collapses, and the chevron points down toward that
            region (rotated while it's open). */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="group relative block w-full rounded-[1rem] pr-12 text-left transition-colors duration-200 ease-out-soft hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:flex sm:items-start sm:justify-between sm:gap-3 sm:pr-0"
        >
          <span className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 sm:items-start sm:gap-x-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100 sm:row-span-3 sm:mt-1 sm:h-10 sm:w-10">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              {eyebrow}
            </span>
            <span className="col-span-2 mt-2 block font-heading text-xl font-black tracking-tight text-ink sm:col-span-1 sm:col-start-2 sm:mt-0.5 md:text-3xl">
              {title}
            </span>
            <span className="col-span-2 mt-1 block max-w-3xl text-sm font-semibold leading-6 text-ink-muted sm:col-span-1 sm:col-start-2 md:text-base">
              {description}
            </span>
          </span>
          <span className="absolute right-0 top-0 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-surface px-3 py-2.5 text-sm font-black text-primary-700 shadow-e1 ring-1 ring-inset ring-primary-100 transition-colors duration-200 ease-out-soft group-hover:bg-primary-50 sm:static sm:mt-1 sm:px-4">
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200 ease-out-soft",
                expanded && "rotate-180"
              )}
              strokeWidth={2.25}
            />
            <span className="hidden sm:inline">{expanded ? "Collapse" : "Expand"}</span>
          </span>
        </button>
      </div>

      {expanded ? (
        <div id={contentId} className="mt-3 md:mt-4">{children}</div>
      ) : (
        <div className="mt-4 rounded-[1.2rem] bg-surface/78 px-4 py-3 text-sm font-bold leading-6 text-ink-muted ring-1 ring-inset ring-primary-100">
          {collapsedText}
        </div>
      )}
    </section>
  );
}

function DetailHero({
  icon: Icon,
  label,
  title,
  copy,
  href,
  action,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  copy: string;
  href: string;
  action: string;
}) {
  return (
    <Card padding="none" className="rounded-[1.35rem] px-5 py-4 md:px-6 md:py-5">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start sm:gap-x-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100 sm:row-span-3 sm:mt-0.5">
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <p className="min-w-0 text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
          {label}
        </p>
        <h2 className="col-span-2 font-heading text-xl font-black tracking-tight text-ink sm:col-span-1 sm:col-start-2">
          {title}
        </h2>
        <p className="col-span-2 text-sm font-semibold leading-6 text-ink-muted sm:col-span-1 sm:col-start-2">
          {copy}
        </p>
        <Link href={href} className="col-span-2 mt-1 block sm:col-span-1 sm:col-start-3 sm:row-span-3 sm:row-start-1 sm:mt-0 sm:self-center">
          <Button size="lg" className="w-full whitespace-nowrap rounded-full px-6 sm:w-auto">
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            {action}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function FitnessSummaryCards({
  totals,
}: {
  totals: { calories: number; minutes: number };
}) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <TargetTile label="Active calories" current={totals.calories} target={fitnessTargets.activeCalories} unit="kcal" tone="primary" icon={Flame} />
      <TargetTile label="Training minutes" current={totals.minutes} target={fitnessTargets.minutes} unit="min" tone="sky" icon={Timer} />
      <TargetTile label="Steps" current={estimatedSteps} target={fitnessTargets.steps} unit="steps" tone="lemon" icon={Footprints} />
      <TargetTile label="Readiness" current={recoveryReadiness} target={fitnessTargets.recovery} unit="%" tone="accent" icon={HeartPulse} />
    </section>
  );
}

function TargetTile({
  label,
  current,
  target,
  unit,
  tone,
  icon: Icon,
  href,
  footnote,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  tone: Tone;
  icon: LucideIcon;
  href?: string;
  footnote?: string;
}) {
  const styles = toneStyles[tone];
  const met = target > 0 && current >= target;
  const unitSuffix = unit === "g" || unit === "%" ? unit : ` ${unit}`;

  const card = (
    <Card
      padding="none"
      className="h-full min-w-0 space-y-2 rounded-[1.2rem] px-4 py-3.5 md:space-y-2.5 md:px-5 md:py-4"
    >
      {/* The pill wraps under the label when data widens it (e.g. 3-digit
          percentages); a fixed one-line row overflows 2-up tiles at 320px. */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${styles.chip}`}>
            <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
          </span>
          <p className="min-w-0 text-sm font-black leading-tight text-ink-muted md:text-base">{label}</p>
        </div>
        {/* Over-target is a different state, not a clamped one: it swaps to a
            check + "Met" instead of a percentage that would read as 100%. */}
        <p className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black tabular-nums ${styles.pill}`}>
          {met ? (
            <>
              <Check className="h-3 w-3" strokeWidth={3} />
              Met
            </>
          ) : (
            `${percentOf(current, target)}%`
          )}
        </p>
      </div>
      <p className="text-2xl font-black leading-none tabular-nums text-ink md:text-[1.75rem]">
        {current.toLocaleString()}
        <span className="ml-1 text-[13px] font-bold text-ink-subtle">{unit}</span>
      </p>
      <p className="text-xs font-semibold leading-5 text-ink-muted">
        {met
          ? `+${Math.round(current - target).toLocaleString()}${unitSuffix} past the ${target.toLocaleString()}${unitSuffix} target`
          : `${remaining(current, target).toLocaleString()}${unitSuffix} left of ${target.toLocaleString()}${unitSuffix}`}
      </p>
      {footnote ? (
        <p className="text-xs font-semibold leading-5 text-ink-subtle">{footnote}</p>
      ) : null}
      <ProgressMeter
        value={current}
        target={target}
        color={styles.meter}
        size="sm"
        label={`${label}: ${current.toLocaleString()}${unitSuffix} of ${target.toLocaleString()}${unitSuffix}`}
      />
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link
      href={href}
      aria-label={`${label} — open detail`}
      className="fw-press block min-w-0 rounded-[1.2rem] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}

function SimpleSummaryCard({
  label,
  value,
  detail,
  tone,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: LucideIcon;
  href?: string;
}) {
  const styles = toneStyles[tone];

  const card = (
    <Card
      padding="none"
      className="h-full min-w-0 space-y-2 rounded-[1.2rem] px-4 py-3.5 md:space-y-2.5 md:px-5 md:py-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${styles.chip}`}>
          <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
        </span>
        <p className="min-w-0 text-sm font-black leading-tight text-ink-muted md:text-base">{label}</p>
      </div>
      <p className="text-2xl font-black leading-none tabular-nums text-ink md:text-[1.75rem]">
        {value}
      </p>
      <p className="text-xs font-semibold leading-5 text-ink-muted">{detail}</p>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link
      href={href}
      aria-label={`${label} — open detail`}
      className="fw-press block min-w-0 rounded-[1.2rem] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}

function DetailLinkCard({
  icon: Icon,
  title,
  detail,
  href,
  action,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="fw-press group flex min-h-[9.5rem] min-w-0 flex-col rounded-[1.25rem] border border-hairline bg-surface px-4 py-4 shadow-e1 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:px-5 md:py-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <h2 className="mt-2.5 font-heading text-lg font-black text-ink">{title}</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-black text-primary-700">
        {action}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </span>
    </Link>
  );
}

function ActivityLogCard({
  activity,
  compact = false,
}: {
  activity: ActivityRecord;
  compact?: boolean;
}) {
  const Icon = activity.icon;

  return (
    <Card
      padding="none"
      className={cn(
        "min-w-0 space-y-4 rounded-[1.5rem]",
        compact ? "px-5 py-5" : "px-5 py-5 md:px-6 md:py-6"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Icon className="h-[21px] w-[21px]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 break-words text-lg font-black text-ink md:text-xl">
                {activity.title}
              </h2>
              <Badge
                variant={activity.source === "Logged" ? "success" : "neutral"}
                size="sm"
                dot={activity.source === "Logged"}
              >
                {activity.source}
              </Badge>
            </div>
            <p className="text-sm font-semibold leading-6 text-ink-muted">
              {activity.subtitle} · {activity.time}
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-[0.9rem] bg-surface-muted px-4 py-3 text-right ring-1 ring-inset ring-hairline">
          <p className="text-xl font-black tabular-nums text-ink">
            {activity.duration}
          </p>
          <p className="text-xs font-bold tabular-nums text-primary-700">
            {activity.calories > 0
              ? `${activity.calories.toLocaleString()} active kcal`
              : "burn not estimated"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/app/fitness#edit-activity" className={pillLinkClass("primary", "sm")}>
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
          Edit routine
        </Link>
        {activity.workoutHref && (
          <Link href={activity.workoutHref} className={pillLinkClass("neutral", "sm")}>
            Open workout
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-hairline pt-4 sm:grid-cols-4">
        {activity.items.map((item) => (
          <SmallStat key={`${activity.id}-${item.label}`} {...item} />
        ))}
      </div>
    </Card>
  );
}

function MealLogCard({
  meal,
  compact = false,
  onDelete,
  onDuplicate,
}: {
  meal: MealRecord;
  compact?: boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  const mealTotals = sumMealItems(meal.items);

  return (
    <Card
      padding="none"
      className={cn(
        "min-w-0 space-y-4 rounded-[1.5rem]",
        compact ? "px-5 py-5" : "px-5 py-5 md:px-6 md:py-6"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <MealIcon mealType={meal.mealType} />
          <div className="min-w-0">
            <h2 className="text-lg font-black text-ink md:text-xl">
              {formatMealType(meal.mealType)}
            </h2>
            <p className="break-words text-sm font-semibold leading-6 text-ink-muted">
              {meal.name} · {meal.items.length} item{meal.items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="shrink-0 rounded-[0.9rem] bg-surface-muted px-4 py-3 text-right ring-1 ring-inset ring-hairline">
          <p className="text-xl font-black tabular-nums text-ink">
            {mealTotals.calories.toLocaleString()} kcal
          </p>
          <p className="text-xs font-bold tabular-nums text-primary-700">
            {mealTotals.protein}g protein
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/app/log" className={pillLinkClass("primary", "sm")}>
          <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
          Edit meal
        </Link>
        <Link href="/app/log" className={pillLinkClass("neutral", "sm")}>
          Log another
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
        </Link>
        {onDuplicate && (
          <button type="button" onClick={onDuplicate} className={pillLinkClass("neutral", "sm")}>
            <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
            Duplicate
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className={pillLinkClass("danger", "sm")}>
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
            Delete
          </button>
        )}
      </div>

      <div className="grid gap-2">
        {meal.items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 border-t border-hairline py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <p className="break-words text-base font-black text-ink">{item.name}</p>
              <p className="text-sm font-semibold tabular-nums text-ink-muted">
                {item.servings} serving{item.servings === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <SmallStat label="kcal" value={item.calories.toLocaleString()} tone="primary" />
              <SmallStat label="Pro" value={`${item.protein}`} tone="sky" />
              <SmallStat label="Carb" value={`${item.carbs}`} tone="lemon" />
              <SmallStat label="Fat" value={`${item.fat}`} tone="accent" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MealIcon({ mealType, muted = false }: { mealType: MealType; muted?: boolean }) {
  // One plate recipe per meal slot: 50-weight tint, 100-weight inset ring,
  // 600/700-weight glyph — the same construction as every other icon plate on
  // these surfaces, so a row of them reads as one set.
  const config =
    muted
      ? { styles: "bg-surface-muted text-ink-subtle ring-hairline-strong", Icon: Moon }
      : mealType === "breakfast"
        ? { styles: "bg-lemon-50 text-lemon-700 ring-lemon-100", Icon: Sun }
        : mealType === "lunch"
          ? { styles: "bg-accent-50 text-accent-600 ring-accent-100", Icon: Salad }
          : mealType === "dinner"
            ? { styles: "bg-primary-50 text-primary-700 ring-primary-100", Icon: Moon }
            : { styles: "bg-sky-50 text-sky-700 ring-sky-100", Icon: UtensilsCrossed };
  const Icon = config.Icon;

  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] ring-1 ring-inset ${config.styles}`}
    >
      <Icon className="h-[21px] w-[21px]" strokeWidth={2} />
    </span>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    // min-w-0 (not a pixel floor): four of these sit in a row inside a 2-up
    // grid at 320px, and any fixed minimum pushes the row past the card.
    <div className={`min-w-0 rounded-[11px] px-2 py-2 text-center sm:px-3 ${toneStyles[tone].macro}`}>
      <p className="truncate text-sm font-black tabular-nums">{value}</p>
      <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70">
        {label}
      </p>
    </div>
  );
}

function CollapsibleLogPanel({
  id,
  icon: Icon,
  title,
  detail,
  href,
  action,
  expanded,
  onToggle,
  children,
}: {
  id?: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  href: string;
  action: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="min-w-0 scroll-mt-24 rounded-[1.4rem] border border-hairline bg-surface/86 p-4 shadow-e1"
    >
      <div className="flex flex-col gap-3 border-b border-hairline pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-black text-ink md:text-xl">{title}</h2>
            <p className="text-sm font-semibold tabular-nums text-ink-muted">{detail}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggle}
            className={pillLinkClass("primary", "sm")}
            aria-expanded={expanded}
            aria-controls={id ? `${id}-content` : undefined}
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200 ease-out-soft",
                expanded && "rotate-180"
              )}
              strokeWidth={2.25}
            />
            {expanded ? "Hide" : "Show"}
          </button>
          <Link href={href} className={pillLinkClass("neutral", "sm")}>
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
            {action}
          </Link>
        </div>
      </div>
      {expanded && (
        <div id={id ? `${id}-content` : undefined} className="mt-4 space-y-3">
          {children}
        </div>
      )}
    </section>
  );
}

function EmptyLedgerCard({
  title,
  detail,
  href,
  action,
}: {
  title: string;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <Card
      variant="outlined"
      padding="none"
      className="rounded-[1.5rem] border-dashed border-primary-200 bg-surface/75"
    >
      <EmptyState
        size="inline"
        icon={UtensilsCrossed}
        title={title}
        description={detail}
        action={{ label: action, href }}
      />
    </Card>
  );
}
