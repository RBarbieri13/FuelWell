"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  ListChecks,
  PlayCircle,
  Save,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export function LiveWorkoutSession({
  workout,
  exercises,
}: {
  workout: LiveWorkout;
  exercises: WorkoutExercise[];
}) {
  const { addWorkout } = useWorkoutLog();
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

  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner max-w-6xl space-y-5 py-5">
        <Link
          href={`/app/workouts/${workout.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-black text-muted-foreground shadow-sm transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Workout preview
        </Link>

        <Card className="fw-dark-panel overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-100">
                <ListChecks className="h-4 w-4" />
                Live workout
              </p>
              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-white md:text-5xl">
                {workout.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72 md:text-base">
                {workout.summary}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-black text-white">{progress}%</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                    Complete
                  </p>
                </div>
                <p className="text-sm font-black text-primary-100">
                  {completedCount}/{totalSets} sets
                </p>
              </div>
              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-400 to-teal-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {!started && (
          <Card className="grid gap-4 border-primary-100 bg-primary-50/80 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-heading text-2xl font-black text-[#16302a]">
                Review the whole workout before you begin
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#60776f]">
                {exercises.length} exercises · {workout.duration} · {workout.equipment}. Open any form graphic once you start, then check off sets as you complete them.
              </p>
            </div>
            <Button type="button" size="lg" onClick={() => setStarted(true)}>
              <PlayCircle className="h-5 w-5" />
              Begin
            </Button>
          </Card>
        )}

        <div className="space-y-3">
          {exercises.map((exercise, exerciseIndex) => {
            const setCount = Math.max(1, exercise.sets);
            const completedForExercise = Array.from({ length: setCount }).filter((_, index) =>
              completedSets.has(setKey(exercise.id, index))
            ).length;
            const graphicOpen = expandedGraphics.has(exercise.id);
            const diagram = getExerciseDiagram(exercise.name);

            return (
              <Card
                key={exercise.id}
                className={cn(
                  "rounded-[1.35rem] px-4 py-4 shadow-[0_8px_22px_rgba(20,90,75,0.05)] md:px-5",
                  completedForExercise === setCount && "border-primary-200 bg-primary-50/60"
                )}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                          Exercise {exerciseIndex + 1}
                        </p>
                        <h2 className="mt-1 font-heading text-xl font-black text-[#16302a]">
                          {exercise.name}
                        </h2>
                        <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                          {exercise.target}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700">
                        {completedForExercise}/{setCount} done
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:max-w-md">
                      <div className="rounded-[1rem] bg-[#f4f8f6] px-3 py-2">
                        <p className="text-sm font-black text-[#16302a]">{exercise.sets}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">sets</p>
                      </div>
                      <div className="rounded-[1rem] bg-sky-100 px-3 py-2">
                        <p className="text-sm font-black text-sky-800">{exercise.reps}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-700/70">reps</p>
                      </div>
                      <div className="rounded-[1rem] bg-lemon-50 px-3 py-2">
                        <p className="text-sm font-black text-lemon-800">{exercise.time}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-lemon-700/70">time</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleGraphic(exercise.id)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f4f8f6] px-3 py-2 text-xs font-black text-[#54635d] transition hover:bg-primary-50 hover:text-primary-800"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {graphicOpen ? "Hide form graphic" : "Show form graphic"}
                    </button>

                    {graphicOpen && (
                      <div className="mt-3 rounded-[1.15rem] border border-primary-100 bg-white p-4">
                        <div className="grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                          <div className="overflow-hidden rounded-[1rem] border border-primary-100 bg-gradient-to-br from-primary-50 to-sky-100">
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
                          <div>
                            <p className="text-sm font-black text-[#16302a]">{diagram.displayName}</p>
                            <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                              {diagram.primaryMuscles.join(", ")}
                            </p>
                            <ul className="mt-2 grid gap-1 text-xs font-semibold leading-5 text-muted-foreground">
                              {diagram.cues.slice(0, 2).map((cue) => (
                                <li key={cue}>- {cue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: setCount }).map((_, index) => {
                        const done = completedSets.has(setKey(exercise.id, index));
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleSet(exercise.id, index)}
                            disabled={!started}
                            className={cn(
                              "flex items-center justify-between rounded-[1rem] border px-3 py-3 text-left text-sm font-black transition",
                              done
                                ? "border-primary-200 bg-primary-100 text-primary-800"
                                : "border-border bg-white text-[#54635d] hover:border-primary-200",
                              !started && "opacity-55"
                            )}
                          >
                            Set {index + 1}
                            {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>

                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                        Weight used
                      </span>
                      <input
                        value={weights[exercise.id] ?? ""}
                        onChange={(event) =>
                          setWeights((current) => ({ ...current, [exercise.id]: event.target.value }))
                        }
                        inputMode="decimal"
                        placeholder="Optional lb"
                        className="mt-2 w-full rounded-[1rem] border border-border bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa] focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                        Notes
                      </span>
                      <textarea
                        value={notes[exercise.id] ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({ ...current, [exercise.id]: event.target.value }))
                        }
                        placeholder="Form, reps, substitutions..."
                        rows={2}
                        className="mt-2 w-full resize-none rounded-[1rem] border border-border bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-[#16302a] outline-none placeholder:text-[#9db0aa] focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
                      />
                    </label>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-3 z-10 rounded-[1.35rem] border border-primary-100 bg-white/95 p-3 shadow-[0_18px_44px_rgba(22,48,42,0.16)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Timer className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-black text-[#16302a]">
                  {completedCount}/{totalSets} sets checked
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  Progress saves when you log the workout.
                </p>
              </div>
            </div>
            <Button type="button" onClick={saveWorkout} disabled={saved || completedCount === 0}>
              <Save className="h-4 w-4" />
              {saved ? "Saved to Fitness" : "Log completed workout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
