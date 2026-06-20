"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Eye,
  Flame,
  Info,
  Leaf,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Save,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useWorkoutLog } from "@/lib/use-workout-log";
import {
  MANUAL_ACTIVITY_OPTIONS,
  PROFILE_WEIGHT_LB,
  PROFILE_AGE,
  buildManualWorkoutEntry,
  estimateMinutesFromDistance,
  estimateWorkoutCalories,
} from "@/lib/workout-estimates";
import {
  workouts,
  workoutHref,
  type WorkoutCategory as Category,
  type WorkoutLibraryItem as WorkoutRow,
  type WorkoutType,
} from "@/lib/workout-library";

type BodyPartFilter = "all" | Category;
type WorkoutTypeFilter = "all" | WorkoutType;

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

function WorkoutFeatureCard({ workout, expanded }: { workout: WorkoutRow; expanded: boolean }) {
  const Icon = workout.icon;
  const tone = workoutTone(workout);
  const IntensityIcon = tone.intensityIcon;
  return (
    <Link href={workoutHref(workout.id)} className="block">
      <div className="flex items-center gap-5 rounded-[22px] border border-[#e6efeb] bg-white px-6 py-5 shadow-[0_8px_22px_rgba(20,90,75,0.06)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_16px_34px_rgba(20,90,75,0.1)]">
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
          {expanded && (
            <p className="mb-3 text-sm font-semibold leading-6 text-[#54635d]">{workout.detail}</p>
          )}
          <div className={cn("flex flex-wrap gap-2", !expanded && "mt-2")}>
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
            {!expanded && (
              <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
                Tap to preview
              </span>
            )}
          </div>
        </div>
        <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f8f6] text-[#7c968f] sm:inline-flex">
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
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

function ManualActivityPlanner({
  onAdd,
}: {
  onAdd: ReturnType<typeof useWorkoutLog>["addWorkout"];
}) {
  const [activityId, setActivityId] = useState(MANUAL_ACTIVITY_OPTIONS[0].id);
  const [minutes, setMinutes] = useState(30);
  const [distance, setDistance] = useState("");
  const option =
    MANUAL_ACTIVITY_OPTIONS.find((activity) => activity.id === activityId) ??
    MANUAL_ACTIVITY_OPTIONS[0];
  const distanceNumber = Number.parseFloat(distance);
  const distanceMinutes = estimateMinutesFromDistance(option, Number.isFinite(distanceNumber) ? distanceNumber : 0);
  const resolvedMinutes = distanceMinutes > 0 ? distanceMinutes : minutes;
  const calories = estimateWorkoutCalories({ met: option.met, minutes: resolvedMinutes });

  return (
    <Card className="space-y-5 rounded-[24px] border-[#e6efeb] px-7 py-7 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-sky-100 text-sky-700">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading text-[22px] font-black tracking-tight text-[#16302a]">
            Add any activity
          </h2>
          <p className="mt-2 text-[15px] font-semibold leading-6 text-[#54635d]">
            Walking, hiking, running, biking, swimming, rowing, sports, lifting, intervals, and more.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <label>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
            Activity type
          </span>
          <select
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
          >
            {MANUAL_ACTIVITY_OPTIONS.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
              Minutes
            </span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
            />
          </label>
          <label>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
              Distance
            </span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              placeholder="Optional mi"
              className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa] focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
            />
          </label>
        </div>
      </div>

      <div className="rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3">
        <p className="text-xl font-black tabular-nums text-primary-800">
          {calories} active cal
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-primary-900/70">
          Estimate uses {resolvedMinutes} min, {option.label.toLowerCase()} intensity, preview age {PROFILE_AGE}, and profile weight {PROFILE_WEIGHT_LB} lb.
        </p>
      </div>

      <Button
        type="button"
        onClick={() => {
          if (resolvedMinutes <= 0) return;
          onAdd(
            buildManualWorkoutEntry({
              option,
              minutes: resolvedMinutes,
              distanceMiles:
                Number.isFinite(distanceNumber) && distanceNumber > 0 ? distanceNumber : undefined,
              calories,
            })
          );
          setMinutes(30);
          setDistance("");
        }}
        className="w-full"
      >
        <Plus className="h-4 w-4" />
        Add activity
      </Button>
    </Card>
  );
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
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  // Shared store: workouts logged from Coach chat show up here too (D-gate).
  const {
    workouts: loggedWorkouts,
    addWorkout,
    removeWorkout,
    updateWorkout,
  } = useWorkoutLog();
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editCalories, setEditCalories] = useState(0);

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
  const hasActiveFilters =
    bodyPart !== "all" || workoutType !== "all" || workoutQuery.trim().length > 0;

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
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-black text-[#16302a]">Logged</h2>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">
              Editable today
            </span>
          </div>
          <ul className="divide-y divide-neutral-100">
            {loggedWorkouts
              .slice(-5)
              .reverse()
              .map((w) => (
                <li key={w.id} className="grid gap-3 py-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">{w.name}</p>
                    <p className="text-xs text-neutral-500">
                      {w.category} · {w.durationMin} min · {w.calories ?? 0} active cal
                    </p>
                  </div>
                  {editingWorkoutId === w.id ? (
                    <div className="grid gap-2 sm:grid-cols-[5.5rem_6.5rem_auto]">
                      <input
                        type="number"
                        min={1}
                        value={editMinutes}
                        onChange={(event) => setEditMinutes(Number(event.target.value))}
                        className="rounded-full border border-primary-100 bg-white px-3 py-2 text-xs font-black text-[#16302a]"
                        aria-label="Edit workout minutes"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editCalories}
                        onChange={(event) => setEditCalories(Number(event.target.value))}
                        className="rounded-full border border-primary-100 bg-white px-3 py-2 text-xs font-black text-[#16302a]"
                        aria-label="Edit workout calories"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateWorkout(w.id, {
                            durationMin: Math.max(1, editMinutes),
                            calories: Math.max(0, editCalories),
                            source: "manual_edit",
                          });
                          setEditingWorkoutId(null);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary-600 px-3 py-2 text-xs font-black text-white"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <span className="shrink-0 text-xs font-medium text-neutral-500">
                        {new Date(w.loggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWorkoutId(w.id);
                          setEditMinutes(w.durationMin);
                          setEditCalories(w.calories ?? 0);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 hover:bg-primary-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWorkout(w.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1.5 text-xs font-black text-accent-700 hover:bg-accent-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Path 1: Coach recommends */}
        <Card className="fw-dark-panel relative overflow-hidden rounded-[24px] border-primary-500/30 px-7 py-7 shadow-[0_22px_46px_rgba(16,48,40,0.34)] ring-2 ring-primary-300/25">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary-500/25 blur-2xl" />
          <div className="relative space-y-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary-500 to-[#1592a0] text-white shadow-[0_8px_18px_rgba(30,174,132,0.4)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-[22px] font-black tracking-tight text-white">
                  Coach recommends
                </h2>
                <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-primary-100">
                  Start here
                </span>
              </div>
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
                href={workoutHref(recommended.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-r from-primary-500 to-[#159aa2] px-4 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition-colors hover:from-primary-600 hover:to-[#138893] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Preview this workout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          </div>
        </Card>

        {/* Path 2: Pick my own */}
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

        <ManualActivityPlanner onAdd={addWorkout} />
      </div>

      <section className="space-y-4">
        <div className="mt-1 flex items-center justify-between">
          <h2 className="font-heading text-sm font-black uppercase tracking-[0.16em] text-[#9db0aa]">
            All workouts
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowWorkoutDetails((current) => !current)}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 shadow-sm shadow-primary-900/5 transition hover:bg-primary-50"
              aria-expanded={showWorkoutDetails}
            >
              {showWorkoutDetails ? "Collapse detail" : "Expand detail"}
            </button>
            <span className="text-sm font-semibold text-[#7c968f]">
              {visible.length} options
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {featuredWorkouts.map((workout) => (
            <WorkoutFeatureCard key={workout.id} workout={workout} expanded={showWorkoutDetails} />
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
            <div className="flex flex-col gap-2 rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-primary-900/70">
                {hasActiveFilters
                  ? `Filtering by ${bodyPart === "all" ? "all body parts" : bodyPart}, ${workoutType === "all" ? "all types" : workoutType}${workoutQuery.trim() ? `, and "${workoutQuery.trim()}"` : ""}.`
                  : "Use filters to narrow by body part, workout type, or search term before previewing."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setBodyPart("all");
                    setWorkoutType("all");
                    setWorkoutQuery("");
                  }}
                  className="self-start rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-100 sm:self-center"
                >
                  Clear filters
                </button>
              )}
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
                    <th className="px-5 py-4 text-right">Preview</th>
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
                          <Link href={workoutHref(workout.id)} className="group inline-flex items-center gap-2">
                            {title}
                            <ArrowRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                          </Link>
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
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={workoutHref(workout.id)}
                            aria-label={`Preview ${workout.title}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-700 transition hover:border-primary-200 hover:bg-primary-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
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
        <details>
          <summary className="flex cursor-pointer list-none gap-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lemon-600">
            <Info className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-black text-lemon-700">
              How the suggestion is made
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-lemon-700/85">
              Tap to review the signals behind Coach.
            </p>
          </div>
          </summary>
          <p className="mt-4 pl-12 text-sm font-semibold leading-6 text-lemon-700/85">
              {verdict.source}
            </p>
        </details>
      </Card>
      </div>
    </div>
  );
}
