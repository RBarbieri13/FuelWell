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
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary-600 text-white shadow-sm shadow-primary-600/25"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
      <Card className="transition-colors group-hover:border-primary-200 group-hover:bg-primary-50/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 group-hover:bg-white group-hover:text-primary-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-neutral-900">{workout.title}</h3>
                <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                  {workout.categoryLabel}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{workout.detail}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-neutral-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
                  <Timer className="h-3.5 w-3.5" />
                  {workout.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
                  <Flame className="h-3.5 w-3.5" />
                  {workout.intensity}
                </span>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1">{workout.focus}</span>
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Workouts</h1>
        <p className="text-sm text-neutral-500">
          Two easy ways to start: browse on your own, or let your coach suggest today&apos;s pick.
        </p>
      </header>

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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Path 1: Pick my own */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Pick my own</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Browse the list and filter by what you want to work today.
            </p>
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
        <Card className="space-y-4 bg-gradient-to-br from-primary-50/90 via-white to-neutral-50 border-primary-100">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Coach recommends</h2>
              <p className="mt-1 text-sm text-neutral-500">
                One tap and your coach suggests a good fit for today.
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
              <div className="rounded-2xl border border-primary-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                    <RecommendedIcon className="h-4 w-4" />
                  </span>
                  <h3 className="font-semibold text-neutral-900">{recommended.title}</h3>
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                    {recommended.duration}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{verdict.detail}</p>
              </div>
              <Link
                href={`/app/workouts/${recommended.id}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-600/25 transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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

      <Card className="space-y-3 border-amber-200 bg-amber-50/60">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">How the suggestion is made</h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{verdict.source}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
