"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Dumbbell,
  Info,
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
        "rounded-full px-6 py-3 text-base font-bold transition-all",
        active
          ? "bg-primary-500 text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)]"
          : "bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </a>
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
        <Card className="space-y-3" data-testid="logged-workouts">
          <h2 className="text-lg font-semibold text-neutral-900">Logged</h2>
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

      <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        {/* Path 1: Pick my own */}
        <Card className="space-y-6 px-8 py-8">
          <div className="flex items-start gap-4">
            <span className="fw-icon-chip">
              <Timer className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-neutral-900">Pick my own</h2>
              <p className="mt-4 text-lg font-semibold leading-7 text-neutral-500">
                Filter the workout database by body part, workout name, and workout type.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
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
        <Card className="fw-dark-panel space-y-6 px-8 py-8">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.15rem] bg-primary-500 text-white">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Coach recommends</h2>
              <p className="mt-4 text-lg font-semibold leading-7 text-white/72">
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
              <div className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4">
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
        </Card>
      </div>

      {/* Workout list (driven by Pick-my-own filter) */}
      <section className="space-y-4">
        <Card className="space-y-5 px-6 py-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black text-neutral-900">
                <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                Workout database
              </h2>
              <p className="mt-1 text-sm font-semibold text-neutral-500">
                {visible.length} of {workouts.length} workouts shown
              </p>
            </div>

            <form action="/app/workouts" className="grid gap-3 md:grid-cols-[1.2fr_0.9fr_0.9fr_auto] xl:min-w-[54rem]">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
                  Workout
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-[1rem] border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <Search className="h-4 w-4 text-neutral-400" />
                  <input
                    name="q"
                    value={workoutQuery}
                    onChange={(event) => setWorkoutQuery(event.target.value)}
                    placeholder="Search rows, pull, ride..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-neutral-800 outline-none placeholder:text-neutral-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
                  Body part
                </span>
                <select
                  name="body"
                  value={bodyPart}
                  onChange={(event) => setBodyPart(event.target.value as BodyPartFilter)}
                  className="mt-2 w-full rounded-[1rem] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
                >
                  {bodyPartFilters.map((filterOption) => (
                    <option key={filterOption.id} value={filterOption.id}>
                      {filterOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
                  Workout type
                </span>
                <select
                  name="type"
                  value={workoutType}
                  onChange={(event) => setWorkoutType(event.target.value as WorkoutTypeFilter)}
                  className="mt-2 w-full rounded-[1rem] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-800 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
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
                className="self-end rounded-[1rem] bg-primary-600 px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)] transition hover:bg-primary-700"
              >
                Apply
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-[1.35rem] border border-primary-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] border-collapse bg-white text-left">
                <thead className="bg-primary-50/80 text-xs font-black uppercase tracking-[0.14em] text-primary-800">
                  <tr>
                    <th className="px-5 py-4">Workout</th>
                    <th className="px-5 py-4">Body part</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Duration</th>
                    <th className="px-5 py-4">Intensity</th>
                    <th className="px-5 py-4">Equipment</th>
                    <th className="px-5 py-4">Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {visible.map((workout) => {
                    const Icon = workout.icon;
                    const title = (
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-black text-neutral-900">{workout.title}</p>
                          <p className="text-xs font-semibold text-neutral-400">{workout.focus}</p>
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
                          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700">
                            {workout.categoryLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-neutral-700">{workout.workoutType}</td>
                        <td className="px-5 py-4 text-sm font-bold tabular-nums text-neutral-700">{workout.duration}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-lemon-50 px-3 py-1 text-xs font-black text-lemon-700">
                            {workout.intensity}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-neutral-500">{workout.equipment}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-neutral-500">{workout.goal}</td>
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

      <Card className="space-y-3 border-lemon-200 bg-lemon-50/75">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-lemon-600" />
          <div>
            <h2 className="text-lg font-black text-lemon-700">How the suggestion is made</h2>
            <p className="mt-1 text-base font-semibold leading-relaxed text-lemon-700/80">{verdict.source}</p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
