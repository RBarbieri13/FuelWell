"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Beef,
  Bike,
  Check,
  ChevronDown,
  ChevronUp,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

function calculateFitnessTotals(activities: ActivityRecord[]) {
  return activities.reduce(
  (total, activity) => ({
    calories: total.calories + activity.calories,
    minutes: total.minutes + Number.parseInt(activity.duration, 10),
  }),
  { calories: 0, minutes: 0 }
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

const toneStyles = {
  primary: {
    chip: "bg-primary-100 text-primary-600",
    pill: "bg-primary-100 text-primary-700",
    bar: "bg-primary-500",
    macro: "bg-primary-100 text-primary-700",
  },
  sky: {
    chip: "bg-sky-100 text-sky-600",
    pill: "bg-sky-100 text-sky-700",
    bar: "bg-sky-500",
    macro: "bg-sky-100 text-sky-700",
  },
  lemon: {
    chip: "bg-lemon-50 text-lemon-700",
    pill: "bg-lemon-100 text-lemon-700",
    bar: "bg-lemon-500",
    macro: "bg-lemon-100 text-lemon-700",
  },
  accent: {
    chip: "bg-accent-100 text-accent-600",
    pill: "bg-accent-100 text-accent-700",
    bar: "bg-accent-400",
    macro: "bg-accent-100 text-accent-700",
  },
  teal: {
    chip: "bg-teal-500/12 text-teal-600",
    pill: "bg-teal-500/12 text-teal-600",
    bar: "bg-teal-500",
    macro: "bg-teal-500/12 text-teal-600",
  },
  neutral: {
    chip: "bg-[#f4f8f6] text-[#54635d]",
    pill: "bg-[#f4f8f6] text-[#54635d]",
    bar: "bg-primary-300",
    macro: "bg-[#f4f8f6] text-[#16302a]",
  },
} as const;

export function FitnessDetailSurface() {
  const { workouts } = useWorkoutLog();
  const activityLog = useMemo(() => buildActivityLog(workouts), [workouts]);
  const fitnessTotals = useMemo(() => calculateFitnessTotals(activityLog), [activityLog]);

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-5">
          <h1 className="fw-heading text-2xl md:text-4xl">Fitness detail</h1>
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

        <FitnessWorkoutManager />

        <Card className="rounded-[1.5rem] border-primary-100 bg-white/85 px-6 py-5 shadow-[0_10px_26px_rgba(20,90,75,0.05)]">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
                <Info className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-black text-[#16302a]">
                  Activity source check
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">
                  {workouts.length > 0
                    ? `${workouts.length} logged workout${workouts.length === 1 ? "" : "s"} count first. Planned movement stays visible so you can compare what happened with what the coach expected.`
                    : "Logged workouts count first. Planned movement stays visible so you can compare what happened with what the coach expected."}
                </p>
              </div>
            </div>
            <Link
              href="/app/daily-review"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 transition hover:bg-primary-100 md:min-h-0"
            >
              View full day
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-lemon-200 bg-lemon-50/80 px-6 py-5 shadow-none">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lemon-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-black text-lemon-800">
                Data honesty
              </h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-lemon-800/78">
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
        <div className="space-y-4 rounded-[1.75rem] bg-white/68 p-3 shadow-[0_22px_58px_rgba(20,90,75,0.08)] md:p-4">
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
                <Card className="flex flex-col gap-4 rounded-[1.5rem] border-dashed border-primary-200 bg-white px-6 py-6 shadow-none md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <MealIcon mealType="dinner" muted />
                    <div>
                      <h2 className="text-xl font-black text-[#54635d]">Dinner</h2>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Not logged yet · {remaining(totals.calories, targets.calories).toLocaleString()} kcal of room left
                      </p>
                    </div>
                  </div>
                  <Link href="/app/log" className="inline-flex">
                    <Button variant="secondary" className="rounded-full bg-primary-100 px-5 text-primary-700">
                      <Plus className="h-4 w-4" />
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
              action="Open daily detail"
            />
            <DetailLinkCard
              icon={Activity}
              title="Fitness detail"
              detail="Compare food room against planned and logged activity."
              href="/app/fitness"
              action="Open fitness"
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

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-5">
          <h1 className="fw-heading text-2xl md:text-4xl">Daily detail</h1>
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
              <TargetTile label="Food in" current={totals.calories} target={targets.calories} unit="kcal" tone="primary" icon={Flame} />
              <TargetTile label="Active burn" current={fitnessTotals.calories} target={fitnessTargets.activeCalories} unit="kcal" tone="accent" icon={Dumbbell} />
              <SimpleSummaryCard label="Net calories" value={netCalories.toLocaleString()} detail={`${remaining(netCalories, targets.calories).toLocaleString()} kcal room after activity`} tone="teal" icon={Target} />
              <TargetTile label="Protein" current={totals.protein} target={targets.protein} unit="g" tone="sky" icon={Beef} />
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
              />
              <SimpleSummaryCard
                label="Activity entries"
                value={`${activityLog.length}`}
                detail="Workouts and movement counted today."
                tone="accent"
                icon={Activity}
              />
              <SimpleSummaryCard
                label="Next best review"
                value={remaining(netCalories, targets.calories) > 0 ? "Dinner" : "Coach"}
                detail="Where to look next, based on the calorie room you have left."
                tone="sky"
                icon={Sparkles}
              />
            </section>
            <Link
              href="/app/coach"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 transition hover:bg-primary-100 md:min-h-0"
            >
              <Sparkles className="h-4 w-4" />
              Ask coach what to do next
            </Link>
          </div>
        </DailyReviewSection>

        <section aria-label="Energy ledger" className="min-w-0">
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
                icon={Activity}
                title="Fitness log"
                detail={`${activityLog.length} activity signal${activityLog.length === 1 ? "" : "s"} counted today`}
                href="/app/fitness"
                action="Edit day"
                expanded={fitnessExpanded}
                onToggle={() => setFitnessExpanded((value) => !value)}
              >
                {workoutPersistence.mode === "unknown" || workoutPersistence.status === "loading" ? (
                  <Card
                    role="status"
                    className="rounded-[1.25rem] border-primary-100 bg-primary-50/55 px-5 py-4 shadow-none"
                  >
                    <p className="text-sm font-black text-primary-800">Loading your activity log...</p>
                    <p className="mt-1 text-xs font-semibold text-primary-900/65">
                      FuelWell is checking your saved workouts before showing today&apos;s review.
                    </p>
                  </Card>
                ) : workoutPersistence.status === "error" ? (
                  <Card
                    role="alert"
                    className="rounded-[1.25rem] border-accent-200 bg-accent-100/55 px-5 py-4 shadow-none"
                  >
                    <p className="text-sm font-black text-accent-800">Activity log could not load</p>
                    <p className="mt-1 text-xs font-semibold text-accent-900/70">
                      {workoutPersistence.error || "Refresh to try the saved workout check again."}
                    </p>
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
  return (
    <section className="rounded-[2rem] border border-primary-200/90 bg-primary-50/35 p-3 shadow-[0_18px_48px_rgba(20,90,75,0.08)] md:p-4">
      <div className="rounded-[1.5rem] border border-white/85 bg-white/72 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
          <div className="flex gap-3">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">
                {eyebrow}
              </p>
              <h2 className="mt-0.5 font-heading text-xl font-black text-[#16302a] md:text-3xl">
                {title}
              </h2>
              <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#6f8981] md:text-base">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2.5 text-sm font-black text-primary-700 shadow-[0_10px_22px_rgba(20,90,75,0.08)] transition hover:bg-primary-50 sm:w-auto md:min-h-0"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Collapse section" : "Expand section"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 md:mt-4">{children}</div>
      ) : (
        <div className="mt-4 rounded-[1.2rem] border border-primary-100 bg-white/78 px-4 py-3 text-sm font-bold text-primary-900/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
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
    <Card variant="elevated" className="rounded-[1.35rem] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(20,90,75,0.07)] md:px-6 md:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
            <Icon className="h-4 w-4" />
            {label}
          </p>
          <h2 className="mt-1.5 text-lg font-black tracking-normal text-[#16302a] md:text-2xl">
            {title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#54635d] md:text-base">
            {copy}
          </p>
        </div>
        <Link href={href}>
          <Button size="lg" className="whitespace-nowrap rounded-full px-6">
            <Plus className="h-4 w-4" />
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
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  const styles = toneStyles[tone];
  const met = target > 0 && current >= target;
  const unitSuffix = unit === "g" || unit === "%" ? unit : ` ${unit}`;

  return (
    <Card className="min-w-0 space-y-2 rounded-[1.2rem] px-4 py-3.5 shadow-[0_8px_22px_rgba(20,90,75,0.06)] md:space-y-2.5 md:px-5 md:py-4">
      {/* The pill wraps under the label when data widens it (e.g. 3-digit
          percentages); a fixed one-line row overflows 2-up tiles at 320px. */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${styles.chip}`}>
            <Icon className="h-[15px] w-[15px]" />
          </span>
          <p className="min-w-0 text-sm font-black leading-tight text-[#54635d] md:text-base">{label}</p>
        </div>
        <p className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${styles.pill}`}>
          {met ? (
            <>
              <Check className="h-3 w-3" />
              Met
            </>
          ) : (
            `${percentOf(current, target)}%`
          )}
        </p>
      </div>
      <p className="text-2xl font-black leading-none tabular-nums text-[#16302a] md:text-[1.75rem]">
        {current.toLocaleString()}
        <span className="ml-1 text-[13px] font-bold text-muted-foreground">{unit}</span>
      </p>
      <p className="text-xs font-semibold text-muted-foreground">
        {met
          ? `+${Math.round(current - target).toLocaleString()}${unitSuffix} past the ${target.toLocaleString()}${unitSuffix} target`
          : `${remaining(current, target).toLocaleString()}${unitSuffix} left of ${target.toLocaleString()}${unitSuffix}`}
      </p>
      <div className="h-[7px] overflow-hidden rounded-full bg-[#edf3f0]">
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${Math.min(percentOf(current, target), 100)}%` }}
        />
      </div>
    </Card>
  );
}

function SimpleSummaryCard({
  label,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  const styles = toneStyles[tone];

  return (
    <Card className="space-y-2 rounded-[1.2rem] px-4 py-3.5 shadow-[0_8px_22px_rgba(20,90,75,0.06)] md:space-y-2.5 md:px-5 md:py-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${styles.chip}`}>
          <Icon className="h-[15px] w-[15px]" />
        </span>
        <p className="text-sm font-black leading-tight text-[#54635d] md:text-base">{label}</p>
      </div>
      <p className="text-2xl font-black leading-none tabular-nums text-[#16302a] md:text-[1.75rem]">
        {value}
      </p>
      <p className="text-xs font-semibold leading-5 text-muted-foreground">{detail}</p>
    </Card>
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
      className="group rounded-[1.25rem] border border-primary-100 bg-white px-4 py-4 shadow-[0_8px_22px_rgba(20,90,75,0.06)] transition md:px-5 md:py-5 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_14px_32px_rgba(20,90,75,0.09)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-2.5 font-heading text-lg font-black text-[#16302a]">{title}</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">{detail}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-primary-700">
        {action}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
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
    <Card className={`space-y-4 rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)] ${compact ? "px-5 py-5" : ""}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
            <Icon className="h-[21px] w-[21px]" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-[#16302a]">{activity.title}</h2>
              <span className="rounded-full bg-[#f4f8f6] px-2.5 py-1 text-xs font-black text-muted-foreground">
                {activity.source}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              {activity.subtitle} · {activity.time}
            </p>
          </div>
        </div>
        <div className="rounded-[0.9rem] bg-[#f4f8f6] px-4 py-3 text-right">
          <p className="text-xl font-black tabular-nums text-[#16302a]">
            {activity.duration}
          </p>
          <p className="text-xs font-bold text-primary-600">
            {activity.calories > 0 ? `${activity.calories} active kcal` : "burn not estimated"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/fitness"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-100 md:min-h-0"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit routine
        </Link>
        <Link
          href="/app/workouts"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f4f8f6] px-3.5 py-2 text-xs font-black text-[#54635d] transition hover:bg-primary-50 hover:text-primary-700 md:min-h-0"
        >
          Open workouts
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-primary-100/70 pt-4 sm:grid-cols-4">
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
    <Card className={`space-y-4 rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)] ${compact ? "px-5 py-5" : ""}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <MealIcon mealType={meal.mealType} />
          <div>
            <h2 className="text-xl font-black text-[#16302a]">
              {formatMealType(meal.mealType)}
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              {meal.name} · {meal.items.length} item{meal.items.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="rounded-[0.9rem] bg-[#f4f8f6] px-4 py-3 text-right">
          <p className="text-xl font-black tabular-nums text-[#16302a]">
            {mealTotals.calories} kcal
          </p>
          <p className="text-xs font-bold text-primary-600">
            {mealTotals.protein}g protein
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/app/log"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-100 md:min-h-0"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit meal
        </Link>
        <Link
          href="/app/log"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f4f8f6] px-3.5 py-2 text-xs font-black text-[#54635d] transition hover:bg-primary-50 hover:text-primary-700 md:min-h-0"
        >
          Log another
          <Plus className="h-3.5 w-3.5" />
        </Link>
        {onDuplicate && (
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-2 rounded-full bg-[#f4f8f6] px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-full bg-[#f4f8f6] px-3.5 py-2 text-xs font-black text-accent-600 transition hover:bg-accent-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>

      <div className="grid gap-2">
        {meal.items.map((item) => (
          <div key={item.id} className="grid gap-4 border-t border-primary-100/70 py-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-base font-black text-[#16302a]">{item.name}</p>
              <p className="text-sm font-semibold text-muted-foreground">
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
  const config =
    muted
      ? { styles: "bg-[#f4f8f6] text-muted-foreground", Icon: Moon }
      : mealType === "breakfast"
        ? { styles: "bg-lemon-50 text-lemon-600", Icon: Sun }
        : mealType === "lunch"
          ? { styles: "bg-accent-100 text-accent-600", Icon: Salad }
          : mealType === "dinner"
            ? { styles: "bg-primary-100 text-primary-700", Icon: Moon }
            : { styles: "bg-sky-100 text-sky-600", Icon: UtensilsCrossed };
  const Icon = config.Icon;

  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] ${config.styles}`}>
      <Icon className="h-[21px] w-[21px]" />
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
    <div className={`min-w-[50px] rounded-[11px] px-3 py-2 text-center ${toneStyles[tone].macro}`}>
      <p className="text-sm font-black tabular-nums">{value}</p>
      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] opacity-70">
        {label}
      </p>
    </div>
  );
}

function CollapsibleLogPanel({
  icon: Icon,
  title,
  detail,
  href,
  action,
  expanded,
  onToggle,
  children,
}: {
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
    <section className="rounded-[1.4rem] border border-primary-100 bg-white/86 p-4 shadow-[0_10px_26px_rgba(20,90,75,0.06)]">
      <div className="flex flex-col gap-3 border-b border-primary-100/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-black text-[#16302a]">{title}</h2>
            <p className="text-sm font-semibold text-muted-foreground">{detail}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-100 md:min-h-0"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide" : "Show"}
          </button>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-primary-700 shadow-[0_8px_18px_rgba(20,90,75,0.07)] transition hover:bg-primary-50 md:min-h-0"
          >
            <Pencil className="h-3.5 w-3.5" />
            {action}
          </Link>
        </div>
      </div>
      {expanded && <div className="mt-4 space-y-3">{children}</div>}
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
    <Card className="rounded-[1.5rem] border-dashed border-primary-200 bg-white/75 px-6 py-8 text-center">
      <h2 className="text-xl font-black text-[#16302a]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
        {detail}
      </p>
      <Link href={href} className="mt-5 inline-flex">
        <Button size="lg">
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </Card>
  );
}
