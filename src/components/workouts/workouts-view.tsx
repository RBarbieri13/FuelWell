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
  Flame,
  Info,
  Leaf,
  ListFilter,
  Pencil,
  Plus,
  Search,
  SearchX,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
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

/**
 * Chips carry a hairline inset ring rather than a border so a dense table row
 * never picks up a second visual weight next to the row divider.
 */
const chipBase =
  "inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full py-1 font-black ring-1 ring-inset";

/** Chip type scale. Two steps only — dense rows and roomy panels. */
const chipSm = "px-2.5 text-[0.6875rem]";
const chipMd = "px-3 text-xs";

/** The two entry-point cards under the coach hero share one shell. */
const pathCardClass =
  "flex min-w-0 flex-col gap-3 rounded-[20px] px-3 py-4 shadow-e2 sm:gap-4 sm:rounded-[24px] sm:px-6 sm:py-6";

const pathPlateClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem] ring-1 ring-inset sm:h-10 sm:w-10 sm:rounded-[0.9rem]";

const filterLabelClass =
  "text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle";

const filterSelectClass =
  "mt-1.5 min-h-11 w-full min-w-0 rounded-[1rem] bg-surface-muted px-3 py-2.5 text-sm font-bold text-ink outline-none ring-1 ring-inset ring-hairline-strong transition focus:bg-surface focus:ring-2 focus:ring-primary-400";

const editFieldClass =
  "min-h-11 w-full min-w-0 rounded-full bg-surface px-3.5 text-xs font-black tabular-nums text-ink outline-none ring-1 ring-inset ring-primary-100 focus:ring-2 focus:ring-primary-400";

function workoutTone(workout: WorkoutRow) {
  if (workout.id === "zone-2-ride" || workout.category === "cardio") {
    return {
      icon: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
      badge: "bg-sky-50 text-sky-700 ring-sky-100",
      intensity: "bg-primary-50 text-primary-800 ring-primary-100",
      intensityIcon: Leaf,
    };
  }

  if (workout.id === "mobility-reset" || workout.category === "mobility") {
    return {
      icon: "bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-200",
      badge: "bg-primary-50 text-primary-800 ring-primary-100",
      intensity: "bg-primary-50 text-primary-800 ring-primary-100",
      intensityIcon: Leaf,
    };
  }

  if (workout.intensity === "Hard") {
    return {
      icon: "bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-200",
      badge: "bg-primary-50 text-primary-800 ring-primary-100",
      intensity: "bg-accent-50 text-accent-700 ring-accent-200",
      intensityIcon: Flame,
    };
  }

  return {
    icon: "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100",
    badge: "bg-primary-50 text-primary-800 ring-primary-100",
    intensity:
      workout.intensity === "Moderate"
        ? "bg-lemon-50 text-lemon-700 ring-lemon-100"
        : "bg-primary-50 text-primary-800 ring-primary-100",
    intensityIcon: workout.intensity === "Moderate" ? Flame : Leaf,
  };
}

/**
 * Every filter pill in the library shares this shape, so selected state is the
 * only thing that changes between the four rows of controls.
 */
function FilterChip({
  active,
  onClick,
  children,
  tone = "primary",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "primary" | "ink";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "fw-press inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500",
        active
          ? tone === "ink"
            ? "bg-ink text-white shadow-e1 ring-ink"
            : "bg-primary-600 text-white shadow-e1 ring-primary-700"
          : "bg-surface-muted text-ink-muted ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200"
      )}
    >
      {children}
    </button>
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const option =
    MANUAL_ACTIVITY_OPTIONS.find((activity) => activity.id === activityId) ??
    MANUAL_ACTIVITY_OPTIONS[0];
  const distanceNumber = Number.parseFloat(distance);
  const distanceMinutes = estimateMinutesFromDistance(option, Number.isFinite(distanceNumber) ? distanceNumber : 0);
  const resolvedMinutes = distanceMinutes > 0 ? distanceMinutes : minutes;
  const calories = estimateWorkoutCalories({ met: option.met, minutes: resolvedMinutes });

  const fieldLabelClass =
    "text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle";
  const fieldClass =
    "mt-2 min-h-11 w-full rounded-[1rem] bg-surface-muted px-4 py-3 text-sm font-bold text-ink outline-none ring-1 ring-inset ring-hairline-strong transition placeholder:font-semibold placeholder:text-ink-faint focus:bg-surface focus:ring-2 focus:ring-primary-400";

  return (
    <Card className="space-y-4 shadow-e2">
      <SectionHeader
        icon={Activity}
        title="Custom activity details"
        description="Log any activity with minutes, distance, and an estimated burn."
      />

      <div className="grid gap-3">
        <label className="block">
          <span className={fieldLabelClass}>Activity type</span>
          <select
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
            className={fieldClass}
          >
            {MANUAL_ACTIVITY_OPTIONS.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className={fieldLabelClass}>Minutes</span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className={cn(fieldClass, "tabular-nums")}
            />
          </label>
          <label className="block min-w-0">
            <span className={fieldLabelClass}>Distance</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
              placeholder="Optional mi"
              className={cn(fieldClass, "tabular-nums")}
            />
          </label>
        </div>
      </div>

      <div className="rounded-[1.15rem] bg-primary-50/70 px-4 py-3 ring-1 ring-inset ring-primary-100">
        <p className="flex flex-wrap items-baseline gap-x-1.5 text-primary-800">
          <span className="text-2xl font-black tabular-nums leading-none">{calories}</span>
          <span className="text-xs font-black uppercase tracking-[0.12em] text-primary-700">
            active kcal
          </span>
        </p>
        <p className="mt-1.5 text-xs font-semibold leading-5 text-primary-900/70">
          Estimate uses <span className="tabular-nums">{resolvedMinutes}</span> min, {option.label.toLowerCase()} intensity, preview age <span className="tabular-nums">{PROFILE_AGE}</span>, and profile weight <span className="tabular-nums">{PROFILE_WEIGHT_LB}</span> lb.
        </p>
      </div>

      <Button
        type="button"
        loading={isSaving}
        onClick={async () => {
          if (resolvedMinutes <= 0 || isSaving) return;
          setIsSaving(true);
          setSaveError(null);
          const result = await onAdd(
            buildManualWorkoutEntry({
              option,
              minutes: resolvedMinutes,
              distanceMiles:
                Number.isFinite(distanceNumber) && distanceNumber > 0 ? distanceNumber : undefined,
              calories,
            })
          );
          setIsSaving(false);
          if (!result.ok) {
            setSaveError(result.error);
            return;
          }
          setMinutes(30);
          setDistance("");
        }}
        className="w-full"
      >
        {!isSaving && <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
        {isSaving ? "Saving activity..." : "Add activity"}
      </Button>
      {saveError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[1rem] bg-accent-50 px-3.5 py-2.5 text-sm font-semibold leading-5 text-accent-700 ring-1 ring-inset ring-accent-200"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
          <span className="min-w-0">{saveError}</span>
        </p>
      )}
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
  // Auto-expanded: a first-time visitor should see the coach pick, not a
  // page of collapsed accordions (audit W7).
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [showActivityPlanner, setShowActivityPlanner] = useState(false);
  const [showWorkoutLibrary, setShowWorkoutLibrary] = useState(
    () =>
      Boolean(initialQuery?.trim()) ||
      parseBodyPart(initialBodyPart) !== "all" ||
      parseWorkoutType(initialWorkoutType) !== "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllMobileColumns, setShowAllMobileColumns] = useState(false);
  const [tableScrollable, setTableScrollable] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);
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
    const filtered = base.filter((workout) => {
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
    if (!workoutQuery.trim()) return filtered;
    // Curated workouts surface before the generated permutations so a search
    // like "core" leads with the hand-built sessions instead of variant rows.
    return [
      ...filtered.filter((workout) => !workout.id.startsWith("generated-")),
      ...filtered.filter((workout) => workout.id.startsWith("generated-")),
    ];
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
    const scroller = tableScrollRef.current;
    if (!showWorkoutLibrary || !scroller) return;
    // ResizeObserver fires once on observe, covering the initial measure.
    const observer = new ResizeObserver(() =>
      setTableScrollable(scroller.scrollWidth > scroller.clientWidth + 1)
    );
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [showWorkoutLibrary, showAllMobileColumns, paginatedWorkouts]);

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
        <div className="fw-page-inner py-5 md:py-7">
          <h1 className="fw-heading text-2xl md:text-4xl">Workouts</h1>
          <p className="fw-muted mt-1 text-sm md:text-base">
            Browse on your own, or let your coach pick today.
          </p>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">

      <div className="grid min-w-0 grid-cols-2 items-stretch gap-3 sm:gap-5">
        {/* Path 1: Coach recommends */}
        <Card
          variant="elevated"
          padding="none"
          className="fw-dark-panel relative col-span-2 overflow-hidden border-primary-500/30 px-5 py-6 shadow-e4 ring-1 ring-inset ring-primary-300/25 sm:px-7 sm:py-7"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary-500/25 blur-2xl" />
          <div className="relative space-y-4 sm:space-y-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-gradient-to-br from-primary-500 to-teal-500 text-white shadow-e2 ring-1 ring-inset ring-white/20">
              <Sparkles className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-[22px] font-black tracking-tight text-white">
                  Coach recommends
                </h2>
                <span className="hidden rounded-full bg-white/12 px-2.5 py-1 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-100 ring-1 ring-inset ring-white/15 sm:inline-flex">
                  Start here
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-5 text-white/72 sm:hidden">
                Built from recent workouts, goals, and recovery.
              </p>
              <p className="mt-2 hidden text-[15px] font-semibold leading-6 text-white/72 sm:block">
                Built from your recent workout pattern, current goals, soreness cost, and available body context.
              </p>
            </div>
          </div>

          {!showRecommendation ? (
            <Button onClick={() => setShowRecommendation(true)} className="w-full">
              Show today&apos;s pick
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[20px] bg-white/10 p-4 ring-1 ring-inset ring-white/12">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-500 text-white ring-1 ring-inset ring-white/20">
                    <RecommendedIcon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-black leading-tight text-white">
                      {recommended.title}
                    </h3>
                    {/* Aligned metadata row: length, effort, kit — the three
                        questions asked before committing to a session. */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className={cn(chipBase, chipSm, "bg-white/12 text-primary-50 ring-white/15 tabular-nums")}>
                        {recommended.duration}
                      </span>
                      <span className={cn(chipBase, chipSm, "bg-white/12 text-primary-50 ring-white/15")}>
                        {recommended.intensity}
                      </span>
                      <span
                        className={cn(chipBase, chipSm, "min-w-0 bg-white/12 text-primary-50 ring-white/15")}
                        title={recommended.equipment}
                      >
                        <span className="truncate">{recommended.equipment}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-white/72 sm:line-clamp-none sm:leading-6">
                  {coachRecommendation.reason}
                </p>
                <div className="mt-3 hidden gap-2 sm:grid">
                  {coachRecommendation.options.slice(0, 2).map((option) => (
                    <Link
                      key={option.id}
                      href={workoutHref(option.id)}
                      className="fw-press flex min-h-11 items-center justify-between gap-3 rounded-[0.95rem] bg-white/10 px-3 py-2 text-xs font-black text-primary-50 ring-1 ring-inset ring-white/10 hover:bg-white/18 hover:ring-white/25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300"
                    >
                      <span className="min-w-0 truncate">{option.title}</span>
                      <span className="shrink-0 tabular-nums text-primary-100/80">
                        {option.duration}
                      </span>
                    </Link>
                  ))}
                </div>
                <details className="group mt-3 sm:hidden">
                  <summary className="fw-press flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-[0.95rem] bg-white/10 px-3 py-2 text-xs font-black text-primary-50 ring-1 ring-inset ring-white/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300">
                    Other options
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out-soft group-open:rotate-180" strokeWidth={2.25} />
                  </summary>
                  <div className="mt-2 grid gap-2">
                    {coachRecommendation.options.slice(0, 2).map((option) => (
                      <Link
                        key={option.id}
                        href={workoutHref(option.id)}
                        className="fw-press flex min-h-11 items-center justify-between gap-3 rounded-[0.95rem] bg-white/10 px-3 py-2 text-xs font-black text-primary-50 ring-1 ring-inset ring-white/10 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300"
                      >
                        <span className="min-w-0 truncate">{option.title}</span>
                        <span className="shrink-0 tabular-nums text-primary-100/80">{option.duration}</span>
                      </Link>
                    ))}
                  </div>
                </details>
              </div>
              <Link
                href={workoutHref(recommended.id)}
                className="fw-press inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-b from-primary-500 to-teal-500 px-4 py-3 text-sm font-black text-white shadow-glow hover:from-primary-400 hover:to-teal-400 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
              >
                Preview this workout
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              </Link>
            </div>
          )}
          <Link
            href="/app/coach?prompt=Help%20me%20customize%20today%27s%20workout%20recommendation."
            className="fw-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[1.15rem] bg-white/10 px-4 py-3 text-sm font-bold text-primary-50 ring-1 ring-inset ring-white/15 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-300"
          >
            <span className="sm:hidden">Customize</span>
            <span className="hidden sm:inline">Customize with Coach</span>
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          </Link>
          </div>
        </Card>

        {/* Path 2: Pick my own */}
        <Card padding="none" className={pathCardClass}>
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:gap-4">
            <span className={cn(pathPlateClass, "bg-primary-50 text-primary-700 ring-primary-100")}>
              <ListFilter className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-black tracking-tight text-ink sm:text-[22px]">
                Pick my own
              </h2>
              <p className="mt-1 hidden text-sm font-semibold leading-6 text-ink-muted sm:block">
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
                "h-4 w-4 shrink-0 transition-transform duration-200 ease-out-soft",
                showWorkoutLibrary && "rotate-180"
              )}
              strokeWidth={2.5}
            />
          </Button>
        </Card>

        <Card padding="none" className={pathCardClass}>
          <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:gap-4">
            <span className={cn(pathPlateClass, "bg-sky-50 text-sky-700 ring-sky-100")}>
              <Activity className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 className="font-heading text-base font-black tracking-tight text-ink sm:text-[22px]">
                Activity
              </h2>
              <p className="mt-1 hidden text-sm font-semibold leading-6 text-ink-muted sm:block">
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
                "h-4 w-4 shrink-0 transition-transform duration-200 ease-out-soft",
                showActivityPlanner && "rotate-180"
              )}
              strokeWidth={2.5}
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
        <Card className="space-y-3 shadow-e1" data-testid="logged-workouts">
          <SectionHeader
            as="h2"
            title="Recent activity"
            action={<Badge variant="default">Editable today</Badge>}
          />
          <ul className="divide-y divide-hairline">
            {loggedWorkouts
              .slice(-5)
              .reverse()
              .map((w) => (
                <li key={w.id} className="grid gap-3 py-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ink">{w.name}</p>
                    <p className="mt-0.5 text-xs font-semibold leading-5 text-ink-muted">
                      {w.category} · <span className="tabular-nums">{w.durationMin}</span> min ·{" "}
                      {w.calories ? (
                        <>
                          <span className="tabular-nums">{w.calories}</span> active kcal
                        </>
                      ) : (
                        "burn not estimated"
                      )}
                    </p>
                  </div>
                  {editingWorkoutId === w.id ? (
                    <div className="grid gap-2 sm:grid-cols-[6rem_7rem_auto]">
                      <input
                        type="number"
                        min={1}
                        value={editMinutes}
                        onChange={(event) => setEditMinutes(Number(event.target.value))}
                        className={editFieldClass}
                        aria-label="Edit workout minutes"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editCalories}
                        onChange={(event) => setEditCalories(Number(event.target.value))}
                        className={editFieldClass}
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
                        className="fw-press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary-600 px-4 text-xs font-black text-white shadow-e1 ring-1 ring-inset ring-primary-700 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                      >
                        <Save className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <span className="shrink-0 text-xs font-bold tabular-nums text-ink-subtle">
                        {new Date(w.loggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWorkoutId(w.id);
                          setEditMinutes(w.durationMin);
                          setEditCalories(w.calories ?? 0);
                        }}
                        className="fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary-50 px-3.5 text-xs font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 md:min-h-9"
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWorkout(w.id)}
                        className="fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent-50 px-3.5 text-xs font-black text-accent-700 ring-1 ring-inset ring-accent-200 hover:bg-accent-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-500 md:min-h-9"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
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
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="font-heading text-sm font-black uppercase tracking-[0.16em] text-ink-subtle">
            Workout library
          </h2>
          <button
            type="button"
            onClick={() => setShowWorkoutLibrary(false)}
            className="fw-press -mr-2 inline-flex min-h-11 items-center rounded-full px-2 text-sm font-black text-primary-700 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 md:min-h-9"
          >
            Close library
          </button>
        </div>

        <Card padding="none" className="space-y-5 px-4 py-5 shadow-e2 sm:px-6 sm:py-6 md:px-7 md:py-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2
                ref={libraryHeadingRef}
                tabIndex={-1}
                className="flex min-w-0 items-center gap-3 font-heading text-xl font-black tracking-tight text-ink outline-none sm:text-2xl"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
                  <SlidersHorizontal className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                Workout database
              </h2>
              <p
                aria-live="polite"
                className="rounded-full bg-primary-50 px-3.5 py-1.5 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-100"
              >
                <span className="tabular-nums">{visible.length}</span> of{" "}
                <span className="tabular-nums">{workouts.length}</span> workouts shown
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-[1.15rem] bg-primary-50/70 px-4 py-3 ring-1 ring-inset ring-primary-100 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-sm font-semibold leading-6 text-primary-900/70">
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
                  className="fw-press inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-full bg-surface px-4 text-xs font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 sm:min-h-9 sm:self-center"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="space-y-3 rounded-[1.35rem] bg-surface px-4 py-4 ring-1 ring-inset ring-hairline">
              <div className="grid gap-3 md:hidden">
                <label>
                  <span className={filterLabelClass}>Body part</span>
                  <select
                    aria-label="Body part"
                    value={bodyPart}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setBodyPart(event.target.value as BodyPartFilter);
                    }}
                    className={filterSelectClass}
                  >
                    {bodyPartFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="min-w-0">
                    <span className={filterLabelClass}>Length</span>
                    <select
                      aria-label="Workout length"
                      value={lengthFilter}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setLengthFilter(event.target.value as LengthFilter);
                      }}
                      className={filterSelectClass}
                    >
                      {lengthFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                  <label className="min-w-0">
                    <span className={filterLabelClass}>Intensity</span>
                    <select
                      aria-label="Intensity"
                      value={intensityFilter}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setIntensityFilter(event.target.value as IntensityFilter);
                      }}
                      className={filterSelectClass}
                    >
                      {intensityFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="min-w-0">
                    <span className={filterLabelClass}>Type</span>
                    <select
                      aria-label="Workout type"
                      value={workoutType}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setWorkoutType(event.target.value as WorkoutTypeFilter);
                      }}
                      className={filterSelectClass}
                    >
                      {workoutTypeFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                  <label className="min-w-0">
                    <span className={filterLabelClass}>Smart filter</span>
                    <select
                      aria-label="Smart filter"
                      value={activeQuickFilters[0] ?? "all"}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setActiveQuickFilters(event.target.value === "all" ? [] : [event.target.value as QuickFilter]);
                      }}
                      className={filterSelectClass}
                    >
                      <option value="all">All workouts</option>
                      {quickFilters.map((filterOption) => <option key={filterOption.id} value={filterOption.id}>{filterOption.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <span className={cn(filterLabelClass, "w-20 shrink-0 leading-4")}>Body part</span>
                {bodyPartFilters.map((filterOption) => (
                  <FilterChip
                    key={filterOption.id}
                    active={bodyPart === filterOption.id}
                    onClick={() => {
                      setCurrentPage(1);
                      setBodyPart(filterOption.id);
                    }}
                  >
                    {filterOption.label}
                  </FilterChip>
                ))}
              </div>
              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <span className={cn(filterLabelClass, "w-20 shrink-0 leading-4")}>Length</span>
                {lengthFilters.map((filterOption) => (
                  <FilterChip
                    key={filterOption.id}
                    active={lengthFilter === filterOption.id}
                    onClick={() => {
                      setCurrentPage(1);
                      setLengthFilter(filterOption.id);
                    }}
                  >
                    {filterOption.label}
                  </FilterChip>
                ))}
              </div>
              <div className="hidden flex-wrap items-center gap-2 md:flex">
                <span className={cn(filterLabelClass, "w-20 shrink-0 leading-4")}>Intensity</span>
                {intensityFilters.map((filterOption) => (
                  <FilterChip
                    key={filterOption.id}
                    active={intensityFilter === filterOption.id}
                    onClick={() => {
                      setCurrentPage(1);
                      setIntensityFilter(filterOption.id);
                    }}
                  >
                    {filterOption.label}
                  </FilterChip>
                ))}
                {workoutTypeFilters.map((filterOption) => (
                  <FilterChip
                    key={filterOption.id}
                    active={workoutType === filterOption.id}
                    onClick={() => {
                      setCurrentPage(1);
                      setWorkoutType(filterOption.id);
                    }}
                  >
                    {filterOption.label}
                  </FilterChip>
                ))}
              </div>
              <div className="hidden flex-wrap items-center gap-2 border-t border-hairline pt-3 md:flex">
                <span className={cn(filterLabelClass, "w-20 shrink-0 leading-4")}>Smart</span>
                {quickFilters.map((filterOption) => {
                  const active = activeQuickFilters.includes(filterOption.id);
                  return (
                    <FilterChip
                      key={filterOption.id}
                      tone="ink"
                      active={active}
                      onClick={() => toggleQuickFilter(filterOption.id)}
                    >
                      {active && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
                      {filterOption.label}
                    </FilterChip>
                  );
                })}
              </div>
            </div>

            {/* Filtering is fully client-side; submitting must never navigate
                (a GET to /app/workouts reloads the page and wipes every
                selected filter). Enter/Apply just re-confirm the live results. */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setCurrentPage(1);
              }}
              className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_auto]"
            >
              <label className="block min-w-0">
                <span className={filterLabelClass}>Workout</span>
                <div className="mt-2 flex min-h-12 items-center gap-2 rounded-[1rem] bg-surface-muted px-4 py-3 ring-1 ring-inset ring-hairline-strong transition focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary-400">
                  <Search className="h-4 w-4 shrink-0 text-ink-subtle" strokeWidth={2.25} />
                  <input
                    name="q"
                    value={workoutQuery}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setWorkoutQuery(event.target.value);
                    }}
                    placeholder="Search rows, pull, ride..."
                    className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:font-semibold placeholder:text-ink-faint"
                  />
                </div>
              </label>

              <Button type="submit" variant="tonal" className="self-end">
                Apply
              </Button>
            </form>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[24px] ring-1 ring-inset ring-hairline">
            <div
              className={cn(
                "flex items-center justify-between gap-3 border-b border-hairline bg-primary-50/70 px-3 py-2.5",
                !tableScrollable && "md:hidden"
              )}
            >
              <p className="min-w-0 text-xs font-semibold leading-5 text-primary-900/70 md:hidden">
                {showAllMobileColumns ? "Swipe within the table for every detail." : "Tap a workout to preview it; time is shown."}
              </p>
              <p className="hidden min-w-0 text-xs font-semibold leading-5 text-primary-900/70 md:block">
                Scroll the table sideways for the equipment and goal columns.
              </p>
              <button
                type="button"
                aria-expanded={showAllMobileColumns}
                aria-controls="workout-results-table"
                onClick={() => setShowAllMobileColumns((current) => !current)}
                className="fw-press inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-surface px-3.5 text-xs font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 md:hidden"
              >
                <Columns3 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                {showAllMobileColumns ? "Essential only" : "Show all columns"}
              </button>
            </div>
            <div
              id="workout-results-table"
              data-testid="workout-results-scroll"
              ref={tableScrollRef}
              className="max-w-full overflow-x-auto overscroll-x-contain"
            >
              <table
                className={cn(
                  "w-full border-collapse bg-surface text-left",
                  showAllMobileColumns ? "min-w-[64rem]" : "min-w-0 md:min-w-[64rem]"
                )}
              >
                <thead className="bg-surface-muted text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle">
                  <tr>
                    <th className="px-4 py-3">Workout</th>
                    <th className={cn("whitespace-nowrap px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Body part</th>
                    <th className={cn("whitespace-nowrap px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Type</th>
                    <th className={cn("px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Muscles</th>
                    <th className="whitespace-nowrap px-4 py-3">Duration</th>
                    <th className={cn("whitespace-nowrap px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Intensity</th>
                    <th className={cn("px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Equipment</th>
                    <th className={cn("px-4 py-3", !showAllMobileColumns && "hidden md:table-cell")}>Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {paginatedWorkouts.map((workout) => {
                    const Icon = workout.icon;
                    const tone = workoutTone(workout);
                    const muscles = workout.targetMuscles ?? workout.bestFor.slice(0, 3);
                    const title = (
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.8rem]",
                            tone.icon
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <p className="break-words text-sm font-black leading-5 text-ink">{workout.title}</p>
                          <p className="hidden text-xs font-semibold leading-5 text-ink-muted sm:block">
                            {workout.focus}
                          </p>
                          {/* On phones the body-part and intensity columns are
                              hidden, so the same two facts ride along with the
                              title as an aligned chip row instead of vanishing. */}
                          <div
                            className={cn(
                              "mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden",
                              showAllMobileColumns && "hidden"
                            )}
                          >
                            <span className={cn(chipBase, chipSm, tone.badge)}>{workout.categoryLabel}</span>
                            <span className={cn(chipBase, chipSm, tone.intensity)}>{workout.intensity}</span>
                          </div>
                        </div>
                      </div>
                    );

                    return (
                      <tr
                        key={workout.id}
                        className="transition-colors duration-200 ease-out-soft hover:bg-primary-50/45"
                      >
                        <td className="min-w-0 px-3 py-2.5 align-top sm:px-4">
                          <Link
                            href={workoutHref(workout.id)}
                            className="group flex min-h-11 items-center gap-2 rounded-[1rem] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                          >
                            {title}
                            <ArrowRight
                              className="hidden h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600 sm:block"
                              strokeWidth={2.5}
                            />
                          </Link>
                        </td>
                        <td className={cn("px-4 py-2.5 align-top", !showAllMobileColumns && "hidden md:table-cell")}>
                          <span className={cn(chipBase, chipMd, tone.badge)}>
                            {workout.categoryLabel}
                          </span>
                        </td>
                        <td className={cn("whitespace-nowrap px-4 py-2.5 align-top text-sm font-bold text-ink-muted", !showAllMobileColumns && "hidden md:table-cell")}>{workout.workoutType}</td>
                        <td className={cn("max-w-[12rem] px-4 py-2.5 align-top text-xs font-semibold leading-5 text-ink-muted", !showAllMobileColumns && "hidden md:table-cell")}>
                          {muscles.slice(0, 3).join(", ")}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 align-top text-sm font-black tabular-nums text-ink">{workout.duration}</td>
                        <td className={cn("px-4 py-2.5 align-top", !showAllMobileColumns && "hidden md:table-cell")}>
                          <span className={cn(chipBase, chipMd, tone.intensity)}>
                            {workout.intensity}
                          </span>
                        </td>
                        <td className={cn("max-w-[11rem] px-4 py-2.5 align-top text-xs font-semibold leading-5 text-ink-muted", !showAllMobileColumns && "hidden md:table-cell")}>{workout.equipment}</td>
                        <td className={cn("max-w-[12rem] px-4 py-2.5 align-top text-xs font-semibold leading-5 text-ink-muted", !showAllMobileColumns && "hidden md:table-cell")}>{workout.goal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {visible.length === 0 && (
              <div role="status" aria-live="polite" className="bg-surface px-5 py-8">
                <div className="mx-auto max-w-md rounded-[1.35rem] bg-accent-50 px-5 py-6 text-center ring-1 ring-inset ring-accent-200">
                  <span
                    aria-hidden="true"
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-surface text-accent-600 shadow-e1 ring-1 ring-inset ring-accent-200"
                  >
                    <SearchX className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="text-base font-black text-accent-700">Found 0 workouts</p>
                  <p className="mt-1.5 text-sm font-semibold leading-6 text-ink-muted">
                    Nothing in the library matches
                    {workoutQuery.trim() ? ` "${workoutQuery.trim()}" with` : ""} the
                    filters you selected. Try removing a filter or broadening the search.
                  </p>
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
                    className="fw-press mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-accent-500 px-5 text-sm font-black text-white shadow-e1 hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
            {visible.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-hairline bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-xs font-bold tabular-nums text-ink-muted sm:text-left" aria-live="polite">
                  Page {activePage} of {totalPages} · Showing {(activePage - 1) * WORKOUTS_PER_PAGE + 1}-{Math.min(activePage * WORKOUTS_PER_PAGE, visible.length)} of {visible.length}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={activePage === 1}
                    className="fw-press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-surface px-4 text-sm font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={activePage === totalPages}
                    className="fw-press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-primary-600 px-4 text-sm font-black text-white shadow-e1 ring-1 ring-inset ring-primary-700 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>
      )}

      <Card
        variant="tinted"
        padding="none"
        className="rounded-[20px] border-lemon-200 bg-lemon-50/80 px-5 py-5 shadow-none sm:px-6"
      >
        <div className="flex gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-surface text-lemon-600 ring-1 ring-inset ring-lemon-200">
            <Info className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
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
