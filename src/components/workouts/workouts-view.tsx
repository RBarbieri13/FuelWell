"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
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
  searchWorkouts,
  workouts,
  workoutHref,
  getWorkoutLengthBucket,
  type WorkoutCategory as Category,
  type WorkoutLibraryItem as WorkoutRow,
  type WorkoutLengthBucket,
  type WorkoutType,
} from "@/lib/workout-library";

type BodyPartFilter = "all" | Category;
type WorkoutTypeFilter = "all" | WorkoutType;
type LengthFilter = "all" | WorkoutLengthBucket;
type IntensityFilter = "all" | "Light" | "Easy" | "Moderate" | "Hard";
type QuickFilter = "recent" | "coach" | "low-recovery" | "minimal-equipment";

const WORKOUTS_PER_PAGE = 20;

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

const lengthFilters: { id: LengthFilter; label: string }[] = [
  { id: "all", label: "Any length" },
  { id: "under-20", label: "<20 min" },
  { id: "20-35", label: "20-35 min" },
  { id: "35-50", label: "35-50 min" },
  { id: "50-plus", label: "50+ min" },
];

const intensityFilters: { id: IntensityFilter; label: string }[] = [
  { id: "all", label: "Any intensity" },
  { id: "Light", label: "Light" },
  { id: "Easy", label: "Easy" },
  { id: "Moderate", label: "Moderate" },
  { id: "Hard", label: "Hard" },
];

const quickFilters: { id: QuickFilter; label: string }[] = [
  { id: "coach", label: "Coach recommended" },
  { id: "recent", label: "Recent workouts" },
  { id: "low-recovery", label: "Low recovery cost" },
  { id: "minimal-equipment", label: "Minimal equipment" },
];

interface DailyVerdict {
  label: string;
  detail: string;
  source: string;
  recommendedId: string;
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

function compactCategory(category: string): Category | null {
  const lower = category.toLowerCase();
  if (lower.includes("upper") || lower.includes("strength")) return "upper";
  if (lower.includes("lower") || lower.includes("ride") || lower.includes("run")) return "lower";
  if (lower.includes("core")) return "core";
  if (lower.includes("mobility") || lower.includes("recovery")) return "mobility";
  if (lower.includes("cardio") || lower.includes("walk") || lower.includes("bike")) return "cardio";
  if (lower.includes("full")) return "full";
  return null;
}

function buildCoachRecommendation(logged: ReturnType<typeof useWorkoutLog>["workouts"]) {
  const recent = logged.slice(-6);
  const counts = new Map<Category, number>();
  for (const entry of recent) {
    const category = compactCategory(`${entry.category} ${entry.name}`);
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const preferredOrder: Category[] = ["full", "upper", "lower", "mobility", "core", "cardio"];
  const undertrained = preferredOrder
    .map((category) => ({ category, count: counts.get(category) ?? 0 }))
    .sort((a, b) => a.count - b.count)[0]?.category ?? "full";
  const recentNames = new Set(recent.map((entry) => entry.name.toLowerCase()));
  const pool = workouts.filter((workout) => {
    if (recentNames.has(workout.title.toLowerCase())) return false;
    if (undertrained === "lower" && workout.intensity === "Hard") return false;
    return workout.category === undertrained || workout.category === "full";
  });
  const pick =
    pool.find((workout) => workout.recoveryCost.toLowerCase().includes("low")) ??
    pool.find((workout) => workout.intensity !== "Hard") ??
    workouts[0];
  const options = workouts
    .filter((workout) => workout.id !== pick.id && (workout.category === pick.category || workout.workoutType === pick.workoutType))
    .slice(0, 3);
  const reason =
    recent.length === 0
      ? "No recent logged workout pattern yet, so FuelWell starts with a balanced, low-risk session."
      : `${undertrained === "full" ? "Full-body" : pick.categoryLabel} is least represented in your last ${recent.length} logged workouts, so this keeps the week balanced without repeating the same stress.`;
  return { pick, options, reason, undertrained };
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
    <Card className="space-y-4 rounded-[24px] border-[#e6efeb] px-5 py-5 shadow-[0_12px_30px_rgba(20,90,75,0.07)] sm:px-6 sm:py-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-sky-100 text-sky-700">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading text-[22px] font-black tracking-tight text-[#16302a]">
            Custom activity details
          </h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#54635d]">
            Log any activity with minutes, distance, and an estimated burn.
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

      <div className="rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-2.5">
        <p className="text-lg font-black tabular-nums text-primary-800">
          {calories} active kcal
        </p>
        <p className="mt-0.5 text-xs font-semibold leading-5 text-primary-900/70">
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
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("all");
  const [intensityFilter, setIntensityFilter] = useState<IntensityFilter>("all");
  const [activeQuickFilters, setActiveQuickFilters] = useState<QuickFilter[]>([]);
  const [workoutQuery, setWorkoutQuery] = useState(initialQuery ?? "");
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showActivityPlanner, setShowActivityPlanner] = useState(false);
  const [showWorkoutLibrary, setShowWorkoutLibrary] = useState(
    () =>
      Boolean(initialQuery?.trim()) ||
      parseBodyPart(initialBodyPart) !== "all" ||
      parseWorkoutType(initialWorkoutType) !== "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllMobileColumns, setShowAllMobileColumns] = useState(false);
  const libraryRef = useRef<HTMLElement>(null);
  const libraryHeadingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocusLibraryRef = useRef(false);
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
  const coachRecommendation = useMemo(
    () => buildCoachRecommendation(loggedWorkouts),
    [loggedWorkouts]
  );
  const coachRecommendedIds = useMemo(
    () => new Set([coachRecommendation.pick.id, ...coachRecommendation.options.map((workout) => workout.id)]),
    [coachRecommendation.options, coachRecommendation.pick.id]
  );
  const recentWorkoutNames = useMemo(
    () => new Set(loggedWorkouts.slice(-8).map((workout) => workout.name.toLowerCase())),
    [loggedWorkouts]
  );

  const visible = useMemo(() => {
    const base = workoutQuery.trim() ? searchWorkouts(workoutQuery) : workouts;
    return base.filter((workout) => {
      const matchesBodyPart = bodyPart === "all" || workout.category === bodyPart;
      const matchesType = workoutType === "all" || workout.workoutType === workoutType;
      const matchesLength = lengthFilter === "all" || getWorkoutLengthBucket(workout) === lengthFilter;
      const matchesIntensity =
        intensityFilter === "all" || workout.intensity === intensityFilter;
      const matchesQuickFilters = activeQuickFilters.every((filter) => {
        if (filter === "coach") return coachRecommendedIds.has(workout.id);
        if (filter === "recent") {
          return (
            recentWorkoutNames.has(workout.title.toLowerCase()) ||
            loggedWorkouts.some((entry) => compactCategory(`${entry.category} ${entry.name}`) === workout.category)
          );
        }
        if (filter === "low-recovery") return workout.recoveryCost.toLowerCase().includes("low");
        if (filter === "minimal-equipment") {
          return /bodyweight|minimal|none|mat|outdoors/i.test(workout.equipment);
        }
        return true;
      });
      return (
        matchesBodyPart &&
        matchesType &&
        matchesLength &&
        matchesIntensity &&
        matchesQuickFilters
      );
    });
  }, [
    activeQuickFilters,
    bodyPart,
    coachRecommendedIds,
    intensityFilter,
    lengthFilter,
    loggedWorkouts,
    recentWorkoutNames,
    workoutQuery,
    workoutType,
  ]);
  const totalPages = Math.max(1, Math.ceil(visible.length / WORKOUTS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedWorkouts = useMemo(
    () => visible.slice((activePage - 1) * WORKOUTS_PER_PAGE, activePage * WORKOUTS_PER_PAGE),
    [activePage, visible]
  );

  useEffect(() => {
    if (!showWorkoutLibrary || !shouldFocusLibraryRef.current) return;
    shouldFocusLibraryRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      libraryHeadingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showWorkoutLibrary]);

  const recommended = coachRecommendation.pick;
  const RecommendedIcon = recommended.icon;
  const hasActiveFilters =
    bodyPart !== "all" ||
    workoutType !== "all" ||
    lengthFilter !== "all" ||
    intensityFilter !== "all" ||
    activeQuickFilters.length > 0 ||
    workoutQuery.trim().length > 0;

  function toggleQuickFilter(filter: QuickFilter) {
    setCurrentPage(1);
    setActiveQuickFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  }

  function openWorkoutLibrary() {
    shouldFocusLibraryRef.current = true;
    if (showWorkoutLibrary) {
      libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      libraryHeadingRef.current?.focus({ preventScroll: true });
      shouldFocusLibraryRef.current = false;
      return;
    }
    setShowWorkoutLibrary(true);
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

      <div className="grid min-w-0 grid-cols-2 items-stretch gap-3 sm:gap-5">
        {/* Path 1: Coach recommends */}
        <Card className="fw-dark-panel relative col-span-2 overflow-hidden rounded-[24px] border-primary-500/30 px-5 py-6 shadow-[0_22px_46px_rgba(16,48,40,0.34)] ring-2 ring-primary-300/25 sm:px-7 sm:py-7">
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
                Built from your recent workout pattern, current goals, soreness cost, and available body context.
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
                <p className="mt-2 text-sm leading-relaxed text-white/72">
                  {coachRecommendation.reason}
                </p>
                <div className="mt-3 grid gap-2">
                  {coachRecommendation.options.slice(0, 2).map((option) => (
                    <Link
                      key={option.id}
                      href={workoutHref(option.id)}
                      className="flex items-center justify-between rounded-[0.95rem] bg-white/10 px-3 py-2 text-xs font-black text-primary-50 transition hover:bg-white/15"
                    >
                      <span>{option.title}</span>
                      <span>{option.duration}</span>
                    </Link>
                  ))}
                </div>
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
          <Link
            href="/app/coach?prompt=Help%20me%20customize%20today%27s%20workout%20recommendation."
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-primary-50 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Customize with Coach
            <ArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </Card>

        {/* Path 2: Pick my own */}
        <Card className="flex min-w-0 flex-col gap-3 rounded-[20px] border-[#e6efeb] px-3 py-4 shadow-[0_12px_30px_rgba(20,90,75,0.07)] sm:gap-4 sm:rounded-[24px] sm:px-6 sm:py-6">
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:gap-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-primary-100 text-primary-600 sm:h-10 sm:w-10 sm:rounded-[13px]">
              <ListFilter className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-black tracking-tight text-[#16302a] sm:text-[22px]">
                Pick my own
              </h2>
              <p className="mt-1 hidden text-sm font-semibold leading-5 text-[#54635d] sm:block">
                Search and filter the full library when you want to choose the session yourself.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            aria-label={showWorkoutLibrary ? "Hide workout library" : "Browse workout library"}
            aria-expanded={showWorkoutLibrary}
            aria-controls="workout-library"
            onClick={showWorkoutLibrary ? () => setShowWorkoutLibrary(false) : openWorkoutLibrary}
            className="mt-auto min-h-11 w-full px-2 text-xs sm:px-4 sm:text-sm"
          >
            {showWorkoutLibrary ? "Hide library" : "Browse library"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showWorkoutLibrary && "rotate-180"
              )}
            />
          </Button>
        </Card>

        <Card className="flex min-w-0 flex-col gap-3 rounded-[20px] border-[#e6efeb] px-3 py-4 shadow-[0_12px_30px_rgba(20,90,75,0.07)] sm:gap-4 sm:rounded-[24px] sm:px-6 sm:py-6">
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:gap-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-sky-100 text-sky-700 sm:h-10 sm:w-10 sm:rounded-[13px]">
              <Activity className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-black tracking-tight text-[#16302a] sm:text-[22px]">
                Activity
              </h2>
              <p className="mt-1 hidden text-sm font-semibold leading-5 text-[#54635d] sm:block">
                Log minutes or distance for walking, running, sports, and more.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            aria-expanded={showActivityPlanner}
            aria-controls="custom-activity-planner"
            onClick={() => setShowActivityPlanner((current) => !current)}
            className="mt-auto min-h-11 w-full px-2 text-xs sm:px-4 sm:text-sm"
          >
            {showActivityPlanner ? "Hide activity" : "Log activity"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showActivityPlanner && "rotate-180"
              )}
            />
          </Button>
        </Card>

        {showActivityPlanner && (
          <div id="custom-activity-planner" className="col-span-2 min-w-0">
            <ManualActivityPlanner onAdd={addWorkout} />
          </div>
        )}
      </div>

      {loggedWorkouts.length > 0 && (
        <Card className="space-y-3 rounded-[22px] border-[#e6efeb] px-6 py-5 shadow-[0_8px_22px_rgba(20,90,75,0.06)]" data-testid="logged-workouts">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-black text-[#16302a]">Recent activity</h2>
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
                      {w.category} · {w.durationMin} min · {w.calories ?? 0} active kcal
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

      {showWorkoutLibrary && (
      <section ref={libraryRef} id="workout-library" className="min-w-0 scroll-mt-4 space-y-4">
        <div className="mt-1 flex items-center justify-between">
          <h2 className="font-heading text-sm font-black uppercase tracking-[0.16em] text-[#9db0aa]">
            Workout library
          </h2>
          <button
            type="button"
            onClick={() => setShowWorkoutLibrary(false)}
            className="text-sm font-black text-primary-700 transition hover:text-primary-800"
          >
            Close library
          </button>
        </div>

        <Card className="space-y-5 rounded-[24px] border-[#e6efeb] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)] md:px-7 md:py-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2
                ref={libraryHeadingRef}
                tabIndex={-1}
                className="flex min-w-0 items-center gap-3 font-heading text-xl font-black tracking-tight text-[#16302a] outline-none sm:text-2xl"
              >
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
                      setCurrentPage(1);
                      setBodyPart("all");
                    setWorkoutType("all");
                    setLengthFilter("all");
                    setIntensityFilter("all");
                    setActiveQuickFilters([]);
                    setWorkoutQuery("");
                  }}
                  className="self-start rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-100 sm:self-center"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="space-y-3 rounded-[1.35rem] border border-[#e6efeb] bg-white px-4 py-4">
              <div className="grid gap-3 md:hidden">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#7c968f]">Body part</span>
                  <select
                    aria-label="Body part"
                    value={bodyPart}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setBodyPart(event.target.value as BodyPartFilter);
                    }}
                    className="mt-1.5 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-3 py-2.5 text-sm font-bold text-[#16302a]"
                  >
                    {bodyPartFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="min-w-0">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#7c968f]">Length</span>
                    <select
                      aria-label="Workout length"
                      value={lengthFilter}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setLengthFilter(event.target.value as LengthFilter);
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-3 py-2.5 text-sm font-bold text-[#16302a]"
                    >
                      {lengthFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                  <label className="min-w-0">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#7c968f]">Intensity</span>
                    <select
                      aria-label="Intensity"
                      value={intensityFilter}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setIntensityFilter(event.target.value as IntensityFilter);
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-3 py-2.5 text-sm font-bold text-[#16302a]"
                    >
                      {intensityFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="min-w-0">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#7c968f]">Type</span>
                    <select
                      aria-label="Workout type"
                      value={workoutType}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setWorkoutType(event.target.value as WorkoutTypeFilter);
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-3 py-2.5 text-sm font-bold text-[#16302a]"
                    >
                      {workoutTypeFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                  <label className="min-w-0">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#7c968f]">Smart filter</span>
                    <select
                      aria-label="Smart filter"
                      value={activeQuickFilters[0] ?? "all"}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setActiveQuickFilters(event.target.value === "all" ? [] : [event.target.value as QuickFilter]);
                      }}
                      className="mt-1.5 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-3 py-2.5 text-sm font-bold text-[#16302a]"
                    >
                      <option value="all">All workouts</option>
                      {quickFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="hidden flex-wrap gap-2 md:flex">
                {bodyPartFilters.map((filterOption) => (
                  <button
                    key={filterOption.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setBodyPart(filterOption.id);
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-black transition",
                      bodyPart === filterOption.id
                        ? "bg-primary-600 text-white shadow-[0_10px_22px_rgba(30,174,132,0.22)]"
                        : "bg-[#f4f8f6] text-[#54635d] hover:bg-primary-50"
                    )}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
              <div className="hidden flex-wrap gap-2 md:flex">
                {lengthFilters.map((filterOption) => (
                  <button
                    key={filterOption.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setLengthFilter(filterOption.id);
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-black transition",
                      lengthFilter === filterOption.id
                        ? "bg-primary-600 text-white"
                        : "bg-[#f4f8f6] text-[#54635d] hover:bg-primary-50"
                    )}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
              <div className="hidden flex-wrap gap-2 md:flex">
                {intensityFilters.map((filterOption) => (
                  <button
                    key={filterOption.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setIntensityFilter(filterOption.id);
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-black transition",
                      intensityFilter === filterOption.id
                        ? "bg-primary-600 text-white"
                        : "bg-[#f4f8f6] text-[#54635d] hover:bg-primary-50"
                    )}
                  >
                    {filterOption.label}
                  </button>
                ))}
                {workoutTypeFilters.map((filterOption) => (
                  <button
                    key={filterOption.id}
                    type="button"
                    onClick={() => {
                      setCurrentPage(1);
                      setWorkoutType(filterOption.id);
                    }}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-black transition",
                      workoutType === filterOption.id
                        ? "bg-primary-600 text-white"
                        : "bg-[#f4f8f6] text-[#54635d] hover:bg-primary-50"
                    )}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
              <div className="hidden flex-wrap gap-2 border-t border-primary-100/70 pt-3 md:flex">
                {quickFilters.map((filterOption) => {
                  const active = activeQuickFilters.includes(filterOption.id);
                  return (
                    <button
                      key={filterOption.id}
                      type="button"
                      onClick={() => toggleQuickFilter(filterOption.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-black transition",
                        active
                          ? "bg-[#16302a] text-white"
                          : "bg-[#f4f8f6] text-[#54635d] hover:bg-primary-50"
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {filterOption.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <form action="/app/workouts" className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_auto]">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
                  Workout
                </span>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3">
                  <Search className="h-4 w-4 text-[#9db0aa]" />
                  <input
                    name="q"
                    value={workoutQuery}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setWorkoutQuery(event.target.value);
                    }}
                    placeholder="Search rows, pull, ride..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa]"
                  />
                </div>
              </label>

              <button
                type="submit"
                className="self-end rounded-2xl bg-gradient-to-r from-primary-500 to-[#159aa0] px-5 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(21,145,108,0.22)] transition hover:from-primary-600 hover:to-primary-600"
              >
                Apply
              </button>
            </form>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[22px] border border-[#dce8e3]">
            <div className="flex items-center justify-between gap-3 border-b border-[#dce8e3] bg-primary-50/70 px-3 py-2.5 md:hidden">
              <p className="min-w-0 text-xs font-semibold text-primary-900/70">
                {showAllMobileColumns ? "Swipe within the table for every detail." : "Tap a workout to preview it; time is shown."}
              </p>
              <button
                type="button"
                aria-expanded={showAllMobileColumns}
                aria-controls="workout-results-table"
                onClick={() => setShowAllMobileColumns((current) => !current)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary-100 bg-white px-3 py-2 text-xs font-black text-primary-700"
              >
                <Columns3 className="h-3.5 w-3.5" />
                {showAllMobileColumns ? "Essential only" : "Show all columns"}
              </button>
            </div>
            <div
              id="workout-results-table"
              data-testid="workout-results-scroll"
              className="max-w-full overflow-x-auto overscroll-x-contain"
            >
              <table
                className={cn(
                  "w-full border-collapse bg-white text-left",
                  showAllMobileColumns ? "min-w-[72rem]" : "min-w-0 md:min-w-[72rem]"
                )}
              >
                <thead className="bg-[#f4f8f6] text-xs font-black uppercase tracking-[0.14em] text-[#7c968f]">
                  <tr>
                    <th className="px-4 py-3">Workout</th>
                    <th className={cn("whitespace-nowrap px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Body part</th>
                    <th className={cn("whitespace-nowrap px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Type</th>
                    <th className={cn("px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Muscles</th>
                    <th className="whitespace-nowrap px-4 py-3">Duration</th>
                    <th className={cn("whitespace-nowrap px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Intensity</th>
                    <th className={cn("px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Equipment</th>
                    <th className={cn("px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Goal</th>
                    <th className={cn("px-4 py-3 text-right", !showAllMobileColumns && "hidden md:table-cell")}>Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paginatedWorkouts.map((workout) => {
                    const Icon = workout.icon;
                    const tone = workoutTone(workout);
                    const muscles = workout.targetMuscles ?? workout.bestFor.slice(0, 3);
                    const title = (
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-[0.75rem]", tone.icon)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="break-words text-sm font-black leading-5 text-[#16302a]">{workout.title}</p>
                          <p className="hidden text-xs font-semibold text-[#9db0aa] sm:block">{workout.focus}</p>
                        </div>
                      </div>
                    );

                    return (
                      <tr key={workout.id} className="transition hover:bg-primary-50/45">
                        <td className="min-w-0 px-3 py-2.5 sm:px-4">
                          <Link href={workoutHref(workout.id)} className="group inline-flex items-center gap-2">
                            {title}
                            <ArrowRight className="hidden h-3.5 w-3.5 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600 sm:block" />
                          </Link>
                        </td>
                        <td className={cn("px-4 py-2.5", !showAllMobileColumns && "hidden md:table-cell")}>
                          <span className={cn("whitespace-nowrap rounded-full px-3 py-1 text-xs font-black", tone.badge)}>
                            {workout.categoryLabel}
                          </span>
                        </td>
                        <td className={cn("whitespace-nowrap px-4 py-2.5 text-sm font-bold text-[#54635d]", !showAllMobileColumns && "hidden md:table-cell")}>{workout.workoutType}</td>
                        <td className={cn("max-w-[12rem] px-4 py-2.5 text-xs font-semibold text-[#7c968f]", !showAllMobileColumns && "hidden md:table-cell")}>
                          {muscles.slice(0, 3).join(", ")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-sm font-bold tabular-nums text-[#54635d]">{workout.duration}</td>
                        <td className={cn("px-4 py-2.5", !showAllMobileColumns && "hidden md:table-cell")}>
                          <span className={cn("whitespace-nowrap rounded-full px-3 py-1 text-xs font-black", tone.intensity)}>
                            {workout.intensity}
                          </span>
                        </td>
                        <td className={cn("max-w-[11rem] px-4 py-2.5 text-xs font-semibold text-[#7c968f]", !showAllMobileColumns && "hidden md:table-cell")}>{workout.equipment}</td>
                        <td className={cn("max-w-[12rem] px-4 py-2.5 text-xs font-semibold text-[#7c968f]", !showAllMobileColumns && "hidden md:table-cell")}>{workout.goal}</td>
                        <td className={cn("px-3 py-2.5 text-right sm:px-4", !showAllMobileColumns && "hidden md:table-cell")}>
                          <Link
                            href={workoutHref(workout.id)}
                            aria-label={`Preview ${workout.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-700 transition hover:border-primary-200 hover:bg-primary-100"
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
            {visible.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-[#dce8e3] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs font-bold text-[#7c968f] sm:text-left" aria-live="polite">
                  Page {activePage} of {totalPages} · Showing {(activePage - 1) * WORKOUTS_PER_PAGE + 1}-{Math.min(activePage * WORKOUTS_PER_PAGE, visible.length)} of {visible.length}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={activePage === 1}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-black text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={activePage === totalPages}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>
      )}

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
