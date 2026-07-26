"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Dumbbell,
  Image as ImageIcon,
  ListChecks,
  PlayCircle,
  Save,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { getExerciseDiagram } from "@/lib/exercise-diagrams";
import { useWorkoutLog } from "@/lib/use-workout-log";
import type { WorkoutExercise, WorkoutType } from "@/lib/workout-library";

type LiveWorkout = {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  summary: string;
  workoutType: WorkoutType;
  estimatedBurn: string;
  equipment: string;
};

function parseMinutes(duration: string) {
  const match = duration.match(/(\d+)/);
  return match ? Number(match[1]) : 30;
}

function parseEstimatedCalories(estimatedBurn: string) {
  const values = Array.from(estimatedBurn.matchAll(/(\d+)/g)).map((match) =>
    Number(match[1])
  );
  if (values.length === 0) return undefined;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

/**
 * Radial meter. `size` is the rendered box in px; `thickness` is in the SVG's
 * own 100-unit space so the ring stays proportionally heavy at every size —
 * a hairline arc is unreadable at arm's length mid-set.
 */
function ProgressRing({
  fraction,
  size,
  label,
  children,
  track = "rgba(255,255,255,0.16)",
  stroke = "var(--color-primary-300)",
  thickness = 8,
  ticks = false,
}: {
  fraction: number;
  size: number;
  label: string;
  children: React.ReactNode;
  track?: string;
  stroke?: string;
  thickness?: number;
  /** Quarter marks, so a glance reads "about half" rather than "some arc". */
  ticks?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke={track} strokeWidth={thickness} />
        {ticks &&
          [0.25, 0.5, 0.75].map((tick) => (
            <circle
              key={tick}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={track}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={`1.5 ${circumference}`}
              strokeDashoffset={-circumference * tick}
              opacity={0.75}
            />
          ))}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-700 ease-out-soft"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {children}
      </div>
    </div>
  );
}

/** One stat plate in the sets / reps / time row. */
function ExerciseStat({
  value,
  label,
  tone,
}: {
  value: string | number;
  label: string;
  tone: "primary" | "sky" | "lemon";
}) {
  const tones = {
    primary: "bg-primary-50 text-primary-800 ring-primary-100",
    sky: "bg-sky-50 text-sky-800 ring-sky-100",
    lemon: "bg-lemon-50 text-lemon-700 ring-lemon-100",
  } as const;

  return (
    <div
      className={cn(
        "min-w-0 rounded-[1rem] px-2 py-3 text-center ring-1 ring-inset",
        tones[tone]
      )}
    >
      <p className="truncate text-2xl font-black tabular-nums leading-none md:text-[1.75rem]">
        {value}
      </p>
      <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
    </div>
  );
}

export function LiveWorkoutSession({
  workout,
  exercises,
}: {
  workout: LiveWorkout;
  exercises: WorkoutExercise[];
}) {
  const { addWorkout } = useWorkoutLog();
  // Mobility, cardio, and recovery plans are timed flows; a "Weight used"
  // field on a stretch or a walk contradicts the session's own copy.
  const tracksWeight = !["Mobility", "Cardio", "Recovery"].includes(workout.workoutType);
  const [started, setStarted] = useState(false);
  const [completedSets, setCompletedSets] = useState<Set<string>>(() => new Set());
  const [expandedGraphics, setExpandedGraphics] = useState<Set<string>>(() => new Set());
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const totalSets = useMemo(
    () => exercises.reduce((sum, exercise) => sum + Math.max(1, exercise.sets), 0),
    [exercises]
  );
  const completedCount = completedSets.size;
  const progress = totalSets === 0 ? 0 : Math.round((completedCount / totalSets) * 100);

  function setKey(exerciseId: string, index: number) {
    return `${exerciseId}-${index}`;
  }

  function toggleSet(exerciseId: string, index: number) {
    const key = setKey(exerciseId, index);
    setCompletedSets((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGraphic(exerciseId: string) {
    setExpandedGraphics((current) => {
      const next = new Set(current);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }

  function saveWorkout() {
    addWorkout({
      id: `live-${workout.id}-${Date.now()}`,
      name: workout.title,
      category: workout.workoutType,
      durationMin: parseMinutes(workout.duration),
      calories: parseEstimatedCalories(workout.estimatedBurn),
      source: "database",
      loggedAt: new Date().toISOString(),
      exercises: exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: Number.parseInt(exercise.reps, 10) || undefined,
        weightKg:
          Number.parseFloat(weights[exercise.id] ?? "") > 0
            ? Math.round((Number.parseFloat(weights[exercise.id] ?? "0") / 2.20462) * 10) / 10
            : undefined,
      })),
      notes: Object.entries(notes)
        .filter(([, value]) => value.trim())
        .map(([id, value]) => `${exercises.find((exercise) => exercise.id === id)?.name}: ${value}`)
        .join("\n"),
    });
    setSaved(true);
  }

  const inputClass =
    "mt-2 w-full rounded-[1rem] border border-hairline-strong bg-surface-muted px-4 py-3 text-base font-bold text-ink outline-none transition placeholder:font-semibold placeholder:text-ink-faint focus:border-primary-300 focus:bg-surface focus:ring-2 focus:ring-primary-200";
  const fieldLabelClass =
    "text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle";

  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner max-w-6xl space-y-5 py-5">
        <Link
          href={`/app/workouts/${workout.id}`}
          className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/75 px-4 py-2 text-sm font-black text-ink-muted shadow-e1 ring-1 ring-inset ring-hairline hover:bg-surface hover:text-primary-700 md:min-h-0"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          Workout preview
        </Link>

        <Card className="fw-dark-panel overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-100 ring-1 ring-inset ring-white/15">
                <ListChecks className="h-4 w-4" strokeWidth={2.25} />
                Live workout
              </p>
              <h1 className="mt-3 font-heading text-2xl font-black tracking-tight text-white md:text-5xl">
                {workout.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72 md:text-base">
                {workout.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {[workout.duration, workout.intensity, workout.equipment].map((chip) => (
                  <span
                    key={chip}
                    className="max-w-full truncate rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-primary-50 ring-1 ring-inset ring-white/12"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-inset ring-white/12">
              <ProgressRing
                fraction={totalSets === 0 ? 0 : completedCount / totalSets}
                size={100}
                thickness={9}
                ticks
                label={`Workout progress: ${completedCount} of ${totalSets} sets complete, ${progress} percent`}
              >
                <span className="font-heading text-[1.75rem] font-black tabular-nums text-white">
                  {progress}
                  <span className="text-sm">%</span>
                </span>
                <span className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
                  done
                </span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="text-2xl font-black tabular-nums leading-none text-white">
                  {completedCount}
                  <span className="text-white/50">/{totalSets}</span>
                </p>
                <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
                  sets checked
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-white/62">
                  {started ? "Tap a set the moment you rack the weight." : "Not started yet."}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {!started && exercises.length > 0 && (
          <Card
            variant="tinted"
            className="grid gap-4 border-primary-100 bg-primary-50/80 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div className="min-w-0">
              <h2 className="font-heading text-xl font-black text-ink md:text-2xl">
                Review the whole workout before you begin
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
                {exercises.length} exercises · {workout.duration} · {workout.equipment}. Open any form graphic once you start, then check off sets as you complete them.
              </p>
            </div>
            <Button type="button" size="lg" onClick={() => setStarted(true)} className="w-full md:w-auto">
              <PlayCircle className="h-5 w-5" strokeWidth={2.25} />
              Begin
            </Button>
          </Card>
        )}

        {exercises.length === 0 ? (
          <Card>
            <EmptyState
              icon={Dumbbell}
              size="inline"
              title="No exercises in this plan yet"
              description="This session has no exercise breakdown to check off. Pick another workout from the library and start there."
              action={{ label: "Browse workouts", href: "/app/workouts" }}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise, exerciseIndex) => {
              const setCount = Math.max(1, exercise.sets);
              const completedForExercise = Array.from({ length: setCount }).filter((_, index) =>
                completedSets.has(setKey(exercise.id, index))
              ).length;
              const exerciseComplete = completedForExercise === setCount;
              const graphicOpen = expandedGraphics.has(exercise.id);
              const diagram = getExerciseDiagram(exercise.name);

              return (
                <Card
                  key={exercise.id}
                  padding="none"
                  className={cn(
                    "relative overflow-hidden px-4 py-4 transition-colors duration-200 ease-out-soft md:px-5",
                    exerciseComplete && "border-primary-200 bg-primary-50/60"
                  )}
                >
                  {/* A finished exercise gets a solid left edge — visible in
                      peripheral vision while scrolling, unlike a tint alone. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 left-0 w-1 transition-colors duration-200 ease-out-soft",
                      exerciseComplete ? "bg-primary-500" : "bg-transparent"
                    )}
                  />
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle">
                            Exercise <span className="tabular-nums">{exerciseIndex + 1}</span>
                            <span className="text-ink-faint tabular-nums"> / {exercises.length}</span>
                          </p>
                          <h2 className="mt-1 font-heading text-xl font-black text-ink md:text-2xl">
                            {exercise.name}
                          </h2>
                          <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                            {exercise.target}
                          </p>
                        </div>
                        <Badge variant={exerciseComplete ? "success" : "neutral"} dot={exerciseComplete}>
                          <span className="tabular-nums">
                            {completedForExercise}/{setCount}
                          </span>
                          <span className="ml-1">done</span>
                        </Badge>
                      </div>

                      {/* Per-exercise completion, drawn from the same counts as
                          the badge — no second source of truth. */}
                      <div
                        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                        role="img"
                        aria-label={`${exercise.name}: ${completedForExercise} of ${setCount} sets complete`}
                      >
                        <div
                          className="h-full rounded-full bg-primary-500 transition-[width] duration-500 ease-out-soft"
                          style={{ width: `${(completedForExercise / setCount) * 100}%` }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
                        <ExerciseStat value={exercise.sets} label="sets" tone="primary" />
                        <ExerciseStat value={exercise.reps} label="reps" tone="sky" />
                        <ExerciseStat value={exercise.time} label="time" tone="lemon" />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          aria-expanded={graphicOpen}
                          onClick={() => toggleGraphic(exercise.id)}
                          className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-muted px-3.5 py-2 text-xs font-black text-ink-muted ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-800 md:min-h-0"
                        >
                          <ImageIcon className="h-4 w-4" strokeWidth={2.25} />
                          {graphicOpen ? "Hide form graphic" : "Show form graphic"}
                        </button>
                        {exercise.rest && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-bold text-ink-subtle ring-1 ring-inset ring-hairline">
                            <Timer className="h-3.5 w-3.5" strokeWidth={2.25} />
                            <span className="tabular-nums">{exercise.rest}</span> rest
                          </span>
                        )}
                      </div>

                      {graphicOpen && (
                        <div className="mt-3 rounded-[1.15rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
                          <div className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                            <div className="overflow-hidden rounded-[1rem] bg-gradient-to-br from-primary-50 to-sky-100 ring-1 ring-inset ring-primary-100">
                              {diagram.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={diagram.imageUrl}
                                  alt={`${diagram.displayName} exercise diagram`}
                                  className="h-32 w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-32 items-center justify-center p-3 text-center text-xs font-black leading-5 text-primary-900">
                                  {exercise.graphicHint}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-ink">{diagram.displayName}</p>
                              <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">
                                {diagram.primaryMuscles.join(", ")}
                              </p>
                              <ul className="mt-2 grid gap-1.5 text-xs font-semibold leading-5 text-ink-muted">
                                {diagram.cues.slice(0, 2).map((cue) => (
                                  <li key={cue} className="flex gap-2">
                                    <span
                                      aria-hidden="true"
                                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400"
                                    />
                                    <span className="min-w-0">{cue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: setCount }).map((_, index) => {
                          const done = completedSets.has(setKey(exercise.id, index));
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => toggleSet(exercise.id, index)}
                              disabled={!started}
                              aria-pressed={done}
                              aria-label={`${exercise.name} set ${index + 1}${done ? ", completed" : ", not completed"}`}
                              className={cn(
                                "fw-press flex min-h-14 items-center justify-between gap-2 rounded-[1rem] px-3.5 py-3 text-left text-base font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500",
                                done
                                  ? "bg-primary-600 text-white shadow-e2 ring-primary-700"
                                  : "bg-surface text-ink-muted ring-hairline-strong hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200",
                                !started && "cursor-not-allowed opacity-50"
                              )}
                            >
                              <span className="truncate tabular-nums">Set {index + 1}</span>
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ease-out-soft",
                                  done
                                    ? "bg-white text-primary-700 ring-1 ring-inset ring-white"
                                    : "bg-surface-sunken text-ink-faint ring-1 ring-inset ring-hairline-strong"
                                )}
                              >
                                {done ? (
                                  <Check className="h-4 w-4" strokeWidth={3.5} />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-current" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {tracksWeight && (
                        <label className="block">
                          <span className={fieldLabelClass}>Weight used</span>
                          <input
                            value={weights[exercise.id] ?? ""}
                            onChange={(event) =>
                              setWeights((current) => ({ ...current, [exercise.id]: event.target.value }))
                            }
                            inputMode="decimal"
                            placeholder="Optional lb"
                            className={cn(inputClass, "tabular-nums")}
                          />
                        </label>
                      )}

                      <label className="block">
                        <span className={fieldLabelClass}>Notes</span>
                        <textarea
                          value={notes[exercise.id] ?? ""}
                          onChange={(event) =>
                            setNotes((current) => ({ ...current, [exercise.id]: event.target.value }))
                          }
                          placeholder="Form, reps, substitutions..."
                          rows={2}
                          className={cn(inputClass, "resize-none")}
                        />
                      </label>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="safe-area-bottom sticky bottom-3 z-10 rounded-[1.35rem] bg-surface/95 p-3 shadow-e4 ring-1 ring-inset ring-primary-100 backdrop-blur">
          {saved ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-[1.15rem] bg-primary-50 px-3 py-3 ring-1 ring-inset ring-primary-100">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-e1 ring-1 ring-inset ring-primary-700">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black text-ink">Workout logged</p>
                  <p className="text-xs font-semibold leading-5 text-ink-muted">
                    <span className="tabular-nums">
                      {completedCount}/{totalSets}
                    </span>{" "}
                    sets saved to today&apos;s activity.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/app/fitness"
                  className="fw-press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-b from-primary-500 to-teal-600 px-5 py-3 text-sm font-black text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  Review in Activity
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
                <Link
                  href="/app/log"
                  className="fw-press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[1.15rem] bg-primary-50 px-5 py-3 text-sm font-black text-primary-800 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <UtensilsCrossed className="h-4 w-4" strokeWidth={2.25} />
                  Log post-workout protein
                </Link>
                <Link
                  href="/app/workouts"
                  className="fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[1.15rem] px-5 py-3 text-sm font-black text-ink-muted hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  Done
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <ProgressRing
                  fraction={totalSets === 0 ? 0 : completedCount / totalSets}
                  size={48}
                  thickness={10}
                  label={`${completedCount} of ${totalSets} sets checked`}
                  track="var(--color-surface-sunken)"
                  stroke="var(--color-primary-500)"
                >
                  <Timer className="h-4 w-4 text-primary-700" strokeWidth={2.5} aria-hidden="true" />
                </ProgressRing>
                <div className="min-w-0">
                  <p className="text-base font-black text-ink">
                    <span className="tabular-nums">
                      {completedCount}/{totalSets}
                    </span>{" "}
                    sets checked
                  </p>
                  <p className="text-xs font-semibold leading-5 text-ink-muted">
                    {!started
                      ? "Tap Begin to start checking off sets."
                      : completedCount === 0
                        ? "Check off at least one set to log this workout."
                        : "Progress saves when you log the workout."}
                  </p>
                </div>
              </div>
              {started ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={saveWorkout}
                  disabled={completedCount === 0}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  Log completed workout
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setStarted(true)}
                  className="w-full sm:w-auto"
                  disabled={exercises.length === 0}
                >
                  <PlayCircle className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                  Begin
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
