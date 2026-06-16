"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  ChevronRight,
  Dumbbell,
  Flame,
  Info,
  Leaf,
  ListFilter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useWorkoutLog } from "@/lib/use-workout-log";

type Category = "upper" | "lower" | "full" | "core" | "mobility" | "cardio";
type BodyPartFilter = "all" | Category;
type WorkoutTypeFilter =
  | "all"
  | "Strength"
  | "Cardio"
  | "Mobility"
  | "Recovery"
  | "Conditioning";

interface WorkoutRow {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  focus: string;
  category: Category;
  categoryLabel: string;
  workoutType: Exclude<WorkoutTypeFilter, "all">;
  equipment: string;
  goal: string;
  icon: LucideIcon;
  detail: string;
  href?: string;
}

const workouts: WorkoutRow[] = [
  {
    id: "low-impact-strength",
    title: "Low-impact strength",
    duration: "34 min",
    intensity: "Moderate",
    focus: "Full body technique",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Strength",
    equipment: "Dumbbells, bench",
    goal: "Technique and low soreness cost",
    icon: Dumbbell,
    detail: "Keeps leg volume gentle while still keeping your training streak going.",
    href: "/app/workouts/low-impact-strength",
  },
  {
    id: "zone-2-ride",
    title: "Zone 2 ride",
    duration: "42 min",
    intensity: "Easy",
    focus: "Aerobic base",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Cardio",
    equipment: "Bike",
    goal: "Aerobic base",
    icon: Bike,
    detail: "Nice if you want to move without adding soreness before tomorrow.",
    href: "/app/workouts/zone-2-ride",
  },
  {
    id: "mobility-reset",
    title: "Mobility reset",
    duration: "18 min",
    intensity: "Light",
    focus: "Hips and upper back",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Mobility",
    equipment: "Mat",
    goal: "Restore range of motion",
    icon: Waves,
    detail: "A calm reset for the hips and upper back when energy is running low.",
    href: "/app/workouts/mobility-reset",
  },
  {
    id: "upper-push-base",
    title: "Upper push base",
    duration: "38 min",
    intensity: "Moderate",
    focus: "Chest, shoulders, triceps",
    category: "upper",
    categoryLabel: "Upper body",
    workoutType: "Strength",
    equipment: "Dumbbells, cable",
    goal: "Pressing strength",
    icon: Dumbbell,
    detail: "A controlled push session with shoulder-friendly volume.",
  },
  {
    id: "upper-pull-posture",
    title: "Upper pull posture",
    duration: "36 min",
    intensity: "Moderate",
    focus: "Back and rear delts",
    category: "upper",
    categoryLabel: "Upper body",
    workoutType: "Strength",
    equipment: "Cable, bands",
    goal: "Rows and posture",
    icon: Dumbbell,
    detail: "Rows, pulldowns, and scapular control for desk-heavy days.",
  },
  {
    id: "lower-hinge-strength",
    title: "Lower hinge strength",
    duration: "44 min",
    intensity: "Hard",
    focus: "Glutes and hamstrings",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Strength",
    equipment: "Barbell or dumbbells",
    goal: "Posterior chain",
    icon: Dumbbell,
    detail: "Hinge-dominant strength without turning it into a conditioning test.",
  },
  {
    id: "lower-knee-friendly",
    title: "Knee-friendly lower",
    duration: "32 min",
    intensity: "Moderate",
    focus: "Glutes, calves, stability",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Strength",
    equipment: "Mini band, dumbbells",
    goal: "Leg work with less knee stress",
    icon: Dumbbell,
    detail: "A lower-body option when knees need a quieter training day.",
  },
  {
    id: "core-anti-rotation",
    title: "Core anti-rotation",
    duration: "22 min",
    intensity: "Light",
    focus: "Obliques and trunk control",
    category: "core",
    categoryLabel: "Core",
    workoutType: "Strength",
    equipment: "Cable or band",
    goal: "Bracing and rotation control",
    icon: Dumbbell,
    detail: "Pallof presses, carries, and dead bug variations.",
  },
  {
    id: "core-finisher",
    title: "Core finisher",
    duration: "14 min",
    intensity: "Moderate",
    focus: "Abs and carries",
    category: "core",
    categoryLabel: "Core",
    workoutType: "Conditioning",
    equipment: "Kettlebell optional",
    goal: "Short trunk finisher",
    icon: Dumbbell,
    detail: "A compact finisher when the main workout was short.",
  },
  {
    id: "full-body-circuit",
    title: "Full-body circuit",
    duration: "40 min",
    intensity: "Hard",
    focus: "Push, pull, squat, carry",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Conditioning",
    equipment: "Dumbbells",
    goal: "Sweat and strength blend",
    icon: Dumbbell,
    detail: "Circuit work for days when energy is high and soreness is low.",
  },
  {
    id: "full-body-minimal",
    title: "Minimal-equipment full body",
    duration: "28 min",
    intensity: "Moderate",
    focus: "Bodyweight strength",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Strength",
    equipment: "Bodyweight",
    goal: "Travel-friendly training",
    icon: Dumbbell,
    detail: "Push-ups, split squats, hinges, and planks with no gym dependency.",
  },
  {
    id: "walk-run-intervals",
    title: "Walk-run intervals",
    duration: "30 min",
    intensity: "Moderate",
    focus: "Aerobic conditioning",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Cardio",
    equipment: "Treadmill or outdoors",
    goal: "Build running tolerance",
    icon: Bike,
    detail: "Gentle intervals that keep effort repeatable.",
  },
  {
    id: "incline-walk",
    title: "Incline walk",
    duration: "35 min",
    intensity: "Easy",
    focus: "Low-impact cardio",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Cardio",
    equipment: "Treadmill",
    goal: "Steps and steady burn",
    icon: Bike,
    detail: "A low-impact cardio option that pairs well with strength days.",
  },
  {
    id: "hips-ankles-reset",
    title: "Hips and ankles reset",
    duration: "16 min",
    intensity: "Light",
    focus: "Hips, ankles, calves",
    category: "mobility",
    categoryLabel: "Mobility",
    workoutType: "Mobility",
    equipment: "Mat",
    goal: "Lower-body mobility",
    icon: Waves,
    detail: "Mobility prep for squats, rides, and long walks.",
  },
  {
    id: "upper-back-reset",
    title: "Upper back reset",
    duration: "15 min",
    intensity: "Light",
    focus: "Thoracic spine and shoulders",
    category: "mobility",
    categoryLabel: "Mobility",
    workoutType: "Mobility",
    equipment: "Foam roller optional",
    goal: "Undo desk posture",
    icon: Waves,
    detail: "A quick upper-back flow for breathing and overhead comfort.",
  },
  {
    id: "recovery-walk",
    title: "Recovery walk",
    duration: "25 min",
    intensity: "Easy",
    focus: "Steps and downshift",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Recovery",
    equipment: "None",
    goal: "Move without fatigue",
    icon: Bike,
    detail: "A walk that counts as momentum without draining tomorrow.",
  },
];

const bodyPartFilters: { id: BodyPartFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upper", label: "Upper" },
  { id: "lower", label: "Lower" },
  { id: "full", label: "Full body" },
  { id: "core", label: "Core" },
  { id: "mobility", label: "Mobility" },
  { id: "cardio", label: "Cardio" },
];

const workoutTypeFilters: { id: WorkoutTypeFilter; label: string }[] = [
  { id: "all", label: "All types" },
  { id: "Strength", label: "Strength" },
  { id: "Cardio", label: "Cardio" },
  { id: "Mobility", label: "Mobility" },
  { id: "Recovery", label: "Recovery" },
  { id: "Conditioning", label: "Conditioning" },
];

interface DailyVerdict {
  label: string;
  detail: string;
  source: string;
  recommendedId: string;
}

function FilterButton({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: string;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full px-5 py-2.5 text-sm font-bold transition-all",
        active
          ? "bg-primary-500 text-white shadow-[0_10px_22px_rgba(30,174,132,0.24)]"
          : "border border-[#e6efeb] bg-[#f4f8f6] text-[#54635d] hover:bg-white"
      )}
    >
      {children}
    </a>
  );
}

function workoutTone(workout: WorkoutRow) {
  if (workout.id === "zone-2-ride" || workout.category === "cardio") {
    return {
      icon: "bg-sky-100 text-sky-600",
      badge: "bg-sky-100 text-sky-700",
      intensity: "bg-primary-100 text-primary-700",
      intensityIcon: Leaf,
    };
  }

  if (workout.id === "mobility-reset" || workout.category === "mobility") {
    return {
      icon: "bg-accent-100 text-accent-500",
      badge: "bg-primary-100 text-primary-700",
      intensity: "bg-primary-100 text-primary-700",
      intensityIcon: Leaf,
    };
  }

  if (workout.intensity === "Hard") {
    return {
      icon: "bg-accent-100 text-accent-500",
      badge: "bg-primary-100 text-primary-700",
      intensity: "bg-accent-100 text-accent-600",
      intensityIcon: Flame,
    };
  }

  return {
    icon: "bg-primary-100 text-primary-600",
    badge: "bg-primary-100 text-primary-700",
    intensity:
      workout.intensity === "Moderate"
        ? "bg-lemon-50 text-lemon-700"
        : "bg-primary-100 text-primary-700",
    intensityIcon: workout.intensity === "Moderate" ? Flame : Leaf,
  };
}

function WorkoutFeatureCard({ workout }: { workout: WorkoutRow }) {
  const Icon = workout.icon;
  const tone = workoutTone(workout);
  const IntensityIcon = tone.intensityIcon;
  const content = (
    <div className="flex items-center gap-5 rounded-[22px] border border-[#e6efeb] bg-white px-6 py-5 shadow-[0_8px_22px_rgba(20,90,75,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(20,90,75,0.1)]">
      <span
        className={cn(
          "inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl",
          tone.icon
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
          <h3 className="font-heading text-lg font-black tracking-tight text-[#16302a]">
            {workout.title}
          </h3>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-black", tone.badge)}>
            {workout.categoryLabel}
          </span>
        </div>
        <p className="mb-3 text-sm font-semibold leading-6 text-[#54635d]">{workout.detail}</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f8f6] px-3 py-1.5 text-xs font-bold text-[#54635d]">
            <Timer className="h-3.5 w-3.5 text-[#9db0aa]" />
            {workout.duration}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              tone.intensity
            )}
          >
            <IntensityIcon className="h-3.5 w-3.5" />
            {workout.intensity}
          </span>
          <span className="rounded-full bg-[#f4f8f6] px-3 py-1.5 text-xs font-bold text-[#54635d]">
            {workout.focus}
          </span>
        </div>
      </div>
      <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f8f6] text-[#7c968f] sm:inline-flex">
        <ChevronRight className="h-4 w-4" />
      </span>
    </div>
  );

  if (!workout.href) {
    return content;
  }

  return (
    <Link href={workout.href} className="block">
      {content}
    </Link>
  );
}

function parseBodyPart(value?: string): BodyPartFilter {
  return bodyPartFilters.some((filter) => filter.id === value)
    ? (value as BodyPartFilter)
    : "all";
}

function parseWorkoutType(value?: string): WorkoutTypeFilter {
  return workoutTypeFilters.some((filter) => filter.id === value)
    ? (value as WorkoutTypeFilter)
    : "all";
}

export function WorkoutsView({
  verdict,
  initialBodyPart,
  initialWorkoutType,
  initialQuery,
}: {
  verdict: DailyVerdict;
  initialBodyPart?: string;
  initialWorkoutType?: string;
  initialQuery?: string;
}) {
  const [bodyPart, setBodyPart] = useState<BodyPartFilter>(parseBodyPart(initialBodyPart));
  const [workoutType, setWorkoutType] = useState<WorkoutTypeFilter>(
    parseWorkoutType(initialWorkoutType)
  );
  const [workoutQuery, setWorkoutQuery] = useState(initialQuery ?? "");
  const [showRecommendation, setShowRecommendation] = useState(false);
  // Shared store: workouts logged from Coach chat show up here too (D-gate).
  const { workouts: loggedWorkouts } = useWorkoutLog();

  const visible = useMemo(() => {
    const query = workoutQuery.trim().toLowerCase();
    return workouts.filter((workout) => {
      const matchesBodyPart = bodyPart === "all" || workout.category === bodyPart;
      const matchesType = workoutType === "all" || workout.workoutType === workoutType;
      const matchesQuery =
        query.length === 0 ||
        workout.title.toLowerCase().includes(query) ||
        workout.focus.toLowerCase().includes(query) ||
        workout.goal.toLowerCase().includes(query);

      return matchesBodyPart && matchesType && matchesQuery;
    });
  }, [bodyPart, workoutQuery, workoutType]);

  const recommended =
    workouts.find((w) => w.id === verdict.recommendedId) ?? workouts[0];
  const RecommendedIcon = recommended.icon;
  const featuredWorkouts = workouts.slice(0, 3);

  function filterHref(nextBodyPart: BodyPartFilter) {
    const params = new URLSearchParams();
    if (workoutQuery.trim()) params.set("q", workoutQuery.trim());
    if (nextBodyPart !== "all") params.set("body", nextBodyPart);
    if (workoutType !== "all") params.set("type", workoutType);
    const query = params.toString();
    return query ? `/app/workouts?${query}` : "/app/workouts";
  }

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner py-7">
          <h1 className="fw-heading text-3xl md:text-4xl">Workouts</h1>
          <p className="fw-muted mt-1 text-base">
            Browse on your own, or let your coach pick today.
          </p>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">

      {loggedWorkouts.length > 0 && (
        <Card className="space-y-3 rounded-[22px] border-[#e6efeb] px-6 py-5 shadow-[0_8px_22px_rgba(20,90,75,0.06)]" data-testid="logged-workouts">
          <h2 className="font-heading text-lg font-black text-[#16302a]">Logged</h2>
          <ul className="divide-y divide-neutral-100">
            {loggedWorkouts
              .slice(-5)
              .reverse()
              .map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">{w.name}</p>
                    <p className="text-xs text-neutral-500">
                      {w.category} · {w.durationMin} min
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-neutral-500">
                    {new Date(w.loggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Path 1: Pick my own */}
        <Card className="space-y-5 rounded-[24px] border-[#e6efeb] px-7 py-7 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-100 text-primary-600">
              <ListFilter className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-[22px] font-black tracking-tight text-[#16302a]">
                Pick my own
              </h2>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-[#54635d]">
                Browse the list and filter by what you want to work today.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {bodyPartFilters.slice(0, 4).map((f) => (
              <FilterButton
                key={f.id}
                active={bodyPart === f.id}
                href={filterHref(f.id)}
              >
                {f.label}
              </FilterButton>
            ))}
          </div>
        </Card>

        {/* Path 2: Coach recommends */}
        <Card className="fw-dark-panel relative overflow-hidden rounded-[24px] px-7 py-7 shadow-[0_20px_44px_rgba(16,48,40,0.3)]">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary-500/25 blur-2xl" />
          <div className="relative space-y-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary-500 to-[#1592a0] text-white shadow-[0_8px_18px_rgba(30,174,132,0.4)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-[22px] font-black tracking-tight text-white">
                Coach recommends
              </h2>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-white/72">
                One tap and your coach suggests a good fit for today — built from your meals and readiness.
              </p>
            </div>
          </div>

          {!showRecommendation ? (
            <Button onClick={() => setShowRecommendation(true)} className="w-full">
              Show today&apos;s pick
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[20px] border border-white/10 bg-white/10 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white">
                    <RecommendedIcon className="h-4 w-4" />
                  </span>
                  <h3 className="font-black text-white">{recommended.title}</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-primary-100">
                    {recommended.duration}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/72">{verdict.detail}</p>
              </div>
              <Link
                href={`/app/workouts/${recommended.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-r from-primary-500 to-[#159aa2] px-4 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition-colors hover:from-primary-600 hover:to-[#138893] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Start this workout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="mt-1 flex items-center justify-between">
          <h2 className="font-heading text-sm font-black uppercase tracking-[0.16em] text-[#9db0aa]">
            All workouts
          </h2>
          <span className="text-sm font-semibold text-[#7c968f]">
            {visible.length} options
          </span>
        </div>

        <div className="space-y-4">
          {featuredWorkouts.map((workout) => (
            <WorkoutFeatureCard key={workout.id} workout={workout} />
          ))}
        </div>

        <Card className="space-y-5 rounded-[24px] border-[#e6efeb] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)] md:px-7 md:py-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="flex items-center gap-3 font-heading text-2xl font-black tracking-tight text-[#16302a]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary-100 text-primary-600">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                Workout database
              </h2>
              <p className="rounded-full bg-primary-100 px-3.5 py-1.5 text-sm font-black text-primary-700">
                {visible.length} of {workouts.length} workouts shown
              </p>
            </div>

            <form action="/app/workouts" className="grid gap-3 lg:grid-cols-[minmax(14rem,1.35fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto]">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
                  Workout
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3">
                  <Search className="h-4 w-4 text-[#9db0aa]" />
                  <input
                    name="q"
                    value={workoutQuery}
                    onChange={(event) => setWorkoutQuery(event.target.value)}
                    placeholder="Search rows, pull, ride..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
                  Body part
                </span>
                <select
                  name="body"
                  value={bodyPart}
                  onChange={(event) => setBodyPart(event.target.value as BodyPartFilter)}
                  className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
                >
                  {bodyPartFilters.map((filterOption) => (
                    <option key={filterOption.id} value={filterOption.id}>
                      {filterOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
                  Workout type
                </span>
                <select
                  name="type"
                  value={workoutType}
                  onChange={(event) => setWorkoutType(event.target.value as WorkoutTypeFilter)}
                  className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
                >
                  {workoutTypeFilters.map((filterOption) => (
                    <option key={filterOption.id} value={filterOption.id}>
                      {filterOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="self-end rounded-2xl bg-gradient-to-r from-primary-500 to-[#159aa0] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(21,145,108,0.22)] transition hover:from-primary-600 hover:to-primary-600"
              >
                Apply
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-[#dce8e3]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[64rem] border-collapse bg-white text-left">
                <thead className="bg-[#f4f8f6] text-xs font-black uppercase tracking-[0.14em] text-[#7c968f]">
                  <tr>
                    <th className="px-5 py-4">Workout</th>
                    <th className="whitespace-nowrap px-5 py-4">Body part</th>
                    <th className="whitespace-nowrap px-5 py-4">Type</th>
                    <th className="whitespace-nowrap px-5 py-4">Duration</th>
                    <th className="whitespace-nowrap px-5 py-4">Intensity</th>
                    <th className="px-5 py-4">Equipment</th>
                    <th className="px-5 py-4">Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {visible.map((workout) => {
                    const Icon = workout.icon;
                    const tone = workoutTone(workout);
                    const title = (
                      <div className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-[0.9rem]", tone.icon)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-black text-[#16302a]">{workout.title}</p>
                          <p className="text-xs font-semibold text-[#9db0aa]">{workout.focus}</p>
                        </div>
                      </div>
                    );

                    return (
                      <tr key={workout.id} className="transition hover:bg-primary-50/45">
                        <td className="px-5 py-4">
                          {workout.href ? (
                            <Link href={workout.href} className="group inline-flex items-center gap-2">
                              {title}
                              <ArrowRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                            </Link>
                          ) : (
                            title
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("whitespace-nowrap rounded-full px-3 py-1 text-xs font-black", tone.badge)}>
                            {workout.categoryLabel}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-[#54635d]">{workout.workoutType}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-bold tabular-nums text-[#54635d]">{workout.duration}</td>
                        <td className="px-5 py-4">
                          <span className={cn("whitespace-nowrap rounded-full px-3 py-1 text-xs font-black", tone.intensity)}>
                            {workout.intensity}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#7c968f]">{workout.equipment}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#7c968f]">{workout.goal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visible.length === 0 && (
              <div className="bg-white px-5 py-8 text-center text-sm font-semibold text-neutral-500">
                No workouts match those filters yet.
              </div>
            )}
          </div>
        </Card>
      </section>

      <Card className="rounded-[20px] border-lemon-200 bg-lemon-50/80 px-6 py-5 shadow-none">
        <div className="flex gap-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lemon-600">
            <Info className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-black text-lemon-700">
              How the suggestion is made
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-lemon-700/85">
              {verdict.source}
            </p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
