"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWorkoutLog } from "@/lib/use-workout-log";
import {
  MANUAL_ACTIVITY_OPTIONS,
  PROFILE_WEIGHT_LB,
  buildManualWorkoutEntry,
  estimateMinutesFromDistance,
  estimateWorkoutCalories,
} from "@/lib/workout-estimates";

export function FitnessWorkoutManager() {
  const { workouts, addWorkout, removeWorkout, updateWorkout } = useWorkoutLog();
  const [activityId, setActivityId] = useState(MANUAL_ACTIVITY_OPTIONS[0].id);
  const [minutes, setMinutes] = useState(30);
  const [distance, setDistance] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editCalories, setEditCalories] = useState(0);

  const option =
    MANUAL_ACTIVITY_OPTIONS.find((activity) => activity.id === activityId) ??
    MANUAL_ACTIVITY_OPTIONS[0];
  const distanceNumber = Number.parseFloat(distance);
  const distanceMinutes = estimateMinutesFromDistance(option, Number.isFinite(distanceNumber) ? distanceNumber : 0);
  const resolvedMinutes = distanceMinutes > 0 ? distanceMinutes : minutes;
  const calories = estimateWorkoutCalories({ met: option.met, minutes: resolvedMinutes });
  const latestWorkouts = useMemo(() => workouts.slice(-4).reverse(), [workouts]);

  function addManualActivity() {
    if (resolvedMinutes <= 0) return;
    addWorkout(
      buildManualWorkoutEntry({
        option,
        minutes: resolvedMinutes,
        distanceMiles: Number.isFinite(distanceNumber) && distanceNumber > 0 ? distanceNumber : undefined,
        calories,
      })
    );
    setDistance("");
    setMinutes(30);
  }

  function beginEdit(workoutId: string, durationMin: number, currentCalories?: number) {
    setEditingId(workoutId);
    setEditMinutes(durationMin);
    setEditCalories(currentCalories ?? 0);
  }

  function saveEdit(workoutId: string) {
    updateWorkout(workoutId, {
      durationMin: Math.max(1, editMinutes),
      calories: Math.max(0, editCalories),
      source: "manual_edit",
    });
    setEditingId(null);
  }

  return (
    <Card className="space-y-5 rounded-[1.5rem] border-primary-100 bg-white px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-black text-[#16302a]">
              Edit today&apos;s activity
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">
              Add real-life movement, adjust minutes or calories, or remove a workout from today&apos;s log.
            </p>
          </div>
        </div>
        <Link
          href="/app/workouts"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 transition hover:bg-primary-100 md:min-h-0"
        >
          Workout page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.65fr_0.65fr_auto]">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9db0aa]">
            Activity
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

        <label className="block">
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

        <label className="block">
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

        <div className="flex flex-col justify-end gap-2">
          <p className="rounded-[1rem] bg-primary-50 px-4 py-2 text-center text-sm font-black text-primary-800">
            {calories} cal
          </p>
          <Button type="button" onClick={addManualActivity} className="rounded-2xl">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <p className="rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm font-semibold leading-6 text-primary-900/70">
        Estimate uses {option.label.toLowerCase()} intensity, {resolvedMinutes} minutes, and the preview profile weight of {PROFILE_WEIGHT_LB} lb. Calories can be corrected after logging.
      </p>

      {latestWorkouts.length > 0 && (
        <div className="divide-y divide-primary-100/70 rounded-[1.25rem] border border-primary-100 bg-[#f8fbf9] px-4">
          {latestWorkouts.map((workout) => (
            <div key={workout.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-base font-black text-[#16302a]">{workout.name}</p>
                <p className="text-sm font-semibold text-[#7c968f]">
                  {workout.category} · {workout.durationMin} min · {workout.calories ?? 0} active cal
                </p>
              </div>
              {editingId === workout.id ? (
                <div className="grid gap-2 sm:grid-cols-[6rem_7rem_auto]">
                  <input
                    type="number"
                    min={1}
                    value={editMinutes}
                    onChange={(event) => setEditMinutes(Number(event.target.value))}
                    className="rounded-full border border-primary-100 bg-white px-3 py-2 text-sm font-black text-[#16302a]"
                    aria-label="Edit minutes"
                  />
                  <input
                    type="number"
                    min={0}
                    value={editCalories}
                    onChange={(event) => setEditCalories(Number(event.target.value))}
                    className="rounded-full border border-primary-100 bg-white px-3 py-2 text-sm font-black text-[#16302a]"
                    aria-label="Edit calories"
                  />
                  <Button type="button" size="sm" onClick={() => saveEdit(workout.id)} className="rounded-full">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => beginEdit(workout.id, workout.durationMin, workout.calories)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWorkout(workout.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-black text-accent-600 transition hover:bg-accent-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
