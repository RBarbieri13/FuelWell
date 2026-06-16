"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Dumbbell,
  Flame,
  Info,
  Sparkles,
  Timer,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useWorkoutLog } from "@/lib/use-workout-log";

type Category = "upper" | "lower" | "full";

type CategoryFilter = "all" | Category;

interface WorkoutRow {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  focus: string;
  category: Category;
  categoryLabel: string;
  icon: LucideIcon;
  detail: string;
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
    icon: Dumbbell,
    detail: "Keeps leg volume gentle while still keeping your training streak going.",
  },
  {
    id: "zone-2-ride",
    title: "Zone 2 ride",
    duration: "42 min",
    intensity: "Easy",
    focus: "Aerobic base",
    category: "lower",
    categoryLabel: "Lower body",
    icon: Bike,
    detail: "Nice if you want to move without adding soreness before tomorrow.",
  },
  {
    id: "mobility-reset",
    title: "Mobility reset",
    duration: "18 min",
    intensity: "Light",
    focus: "Hips and upper back",
    category: "full",
    categoryLabel: "Full body",
    icon: Waves,
    detail: "A calm reset for the hips and upper back when energy is running low.",
  },
];

const filters: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upper", label: "Upper" },
  { id: "lower", label: "Lower" },
  { id: "full", label: "Full body" },
];

interface DailyVerdict {
  label: string;
  detail: string;
  source: string;
  recommendedId: string;
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-6 py-3 text-base font-bold transition-all",
        active
          ? "bg-primary-500 text-white shadow-[0_12px_24px_rgba(21,145,108,0.18)]"
          : "bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
      )}
    >
      {children}
    </button>
  );
}

function WorkoutCard({ workout }: { workout: WorkoutRow }) {
  const Icon = workout.icon;
  return (
    <Link href={`/app/workouts/${workout.id}`} className="block group">
      <Card className="transition-all group-hover:-translate-y-0.5 group-hover:border-primary-200 group-hover:shadow-[0_22px_55px_rgba(22,48,42,0.12)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-primary-100 text-primary-600 group-hover:bg-primary-200">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-neutral-900">{workout.title}</h3>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700">
                  {workout.categoryLabel}
                </span>
              </div>
              <p className="mt-1 text-base font-semibold leading-relaxed text-neutral-500">{workout.detail}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-neutral-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-50 px-3 py-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  {workout.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-lemon-50 px-3 py-1.5 text-lemon-700">
                  <Flame className="h-3.5 w-3.5" />
                  {workout.intensity}
                </span>
                <span className="rounded-full bg-neutral-50 px-3 py-1.5">{workout.focus}</span>
              </div>
            </div>
          </div>
          <ArrowRight className="hidden sm:block h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
        </div>
      </Card>
    </Link>
  );
}

export function WorkoutsView({ verdict }: { verdict: DailyVerdict }) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [showRecommendation, setShowRecommendation] = useState(false);
  // Shared store: workouts logged from Coach chat show up here too (D-gate).
  const { workouts: loggedWorkouts } = useWorkoutLog();

  const visible =
    filter === "all" ? workouts : workouts.filter((w) => w.category === filter);

  const recommended =
    workouts.find((w) => w.id === verdict.recommendedId) ?? workouts[0];
  const RecommendedIcon = recommended.icon;

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
              Browse the list and filter by what you want to work today.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <FilterButton
                key={f.id}
                active={filter === f.id}
                onClick={() => setFilter(f.id)}
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
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {filter === "all" ? "All workouts" : `${filters.find((f) => f.id === filter)?.label} workouts`}
          </h2>
          <span className="text-xs text-neutral-500">
            {visible.length} {visible.length === 1 ? "option" : "options"}
          </span>
        </div>

        {visible.length === 0 ? (
          <Card className="text-sm text-neutral-500">
            No workouts in this category yet. Try another filter.
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
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
