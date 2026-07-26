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
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import { useWorkoutLog } from "@/lib/use-workout-log";
import {
  MANUAL_ACTIVITY_OPTIONS,
  PROFILE_WEIGHT_LB,
  buildManualWorkoutEntry,
  estimateMinutesFromDistance,
  estimateWorkoutCalories,
} from "@/lib/workout-estimates";

/** One field recipe for every control in this panel — sunken well, hairline
 *  ring, one focus treatment. */
const FIELD_CLASS =
  "mt-2 w-full min-w-0 rounded-2xl bg-surface-muted px-4 py-3 text-sm font-bold tabular-nums text-ink ring-1 ring-inset ring-hairline-strong outline-none transition-shadow duration-200 ease-out-soft placeholder:font-semibold placeholder:text-ink-faint focus-visible:ring-[3px] focus-visible:ring-primary-600";

const FIELD_LABEL_CLASS =
  "text-[11px] font-black uppercase tracking-[0.12em] text-ink-subtle";

const ROW_ACTION_CLASS =
  "fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface px-3.5 py-2 text-xs font-black shadow-e1 ring-1 ring-inset ring-hairline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0";

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
    <Card padding="none" className="min-w-0 space-y-5 rounded-[1.5rem] px-5 py-5 md:px-6 md:py-6">
      <SectionHeader
        as="h2"
        icon={Activity}
        title="Edit today's activity"
        description="Add real-life movement, adjust minutes or calories, or remove a workout from today's log."
        action={
          <Link
            href="/app/workouts"
            className="fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0"
          >
            Workout page
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </Link>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.65fr_0.65fr_auto]">
        <label className="block min-w-0">
          <span className={FIELD_LABEL_CLASS}>Activity</span>
          <select
            value={activityId}
            onChange={(event) => setActivityId(event.target.value)}
            className={FIELD_CLASS}
          >
            {MANUAL_ACTIVITY_OPTIONS.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className={FIELD_LABEL_CLASS}>Minutes</span>
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
            className={FIELD_CLASS}
          />
        </label>

        <label className="block min-w-0">
          <span className={FIELD_LABEL_CLASS}>Distance</span>
          <input
            type="number"
            min={0}
            step="0.1"
            value={distance}
            onChange={(event) => setDistance(event.target.value)}
            placeholder="Optional mi"
            className={FIELD_CLASS}
          />
        </label>

        <div className="flex min-w-0 flex-col justify-end gap-2">
          {/* The live estimate is a readout, not a control — it is labelled so
              the bare number never reads as another button. */}
          <p
            className="rounded-[1rem] bg-primary-50 px-4 py-2 text-center ring-1 ring-inset ring-primary-100"
            aria-live="polite"
          >
            <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-primary-700/75">
              Estimated burn
            </span>
            <span className="block text-sm font-black tabular-nums text-primary-800">
              {calories.toLocaleString()} kcal
            </span>
          </p>
          <Button
            type="button"
            onClick={addManualActivity}
            disabled={resolvedMinutes <= 0}
            className="rounded-2xl"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Add
          </Button>
        </div>
      </div>

      <p className="rounded-[1.15rem] bg-primary-50/70 px-4 py-3 text-sm font-semibold leading-6 text-ink-muted ring-1 ring-inset ring-primary-100">
        Estimate uses {option.label.toLowerCase()} intensity,{" "}
        <span className="tabular-nums">{resolvedMinutes}</span> minutes, and the preview profile
        weight of <span className="tabular-nums">{PROFILE_WEIGHT_LB}</span> lb. Calories can be
        corrected after logging.
      </p>

      {latestWorkouts.length > 0 ? (
        // Inset well inside an already-raised card — one hairline, no second
        // drop shadow.
        <div className="min-w-0 divide-y divide-hairline rounded-[1.25rem] bg-surface-subtle px-4 ring-1 ring-inset ring-hairline">
          {latestWorkouts.map((workout) => {
            const isEditing = editingId === workout.id;
            return (
              <div
                key={workout.id}
                className="grid min-w-0 gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="break-words text-base font-black text-ink">{workout.name}</p>
                  <p className="text-sm font-semibold tabular-nums text-ink-muted">
                    {workout.category} · {workout.durationMin} min ·{" "}
                    {workout.calories
                      ? `${workout.calories.toLocaleString()} active kcal`
                      : "burn not estimated"}
                  </p>
                </div>
                {isEditing ? (
                  <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,6rem)_minmax(0,7rem)_auto]">
                    <input
                      type="number"
                      min={1}
                      value={editMinutes}
                      onChange={(event) => setEditMinutes(Number(event.target.value))}
                      className="min-w-0 rounded-full bg-surface px-3 py-2 text-sm font-black tabular-nums text-ink ring-1 ring-inset ring-primary-200 outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                      aria-label="Edit minutes"
                    />
                    <input
                      type="number"
                      min={0}
                      value={editCalories}
                      onChange={(event) => setEditCalories(Number(event.target.value))}
                      className="min-w-0 rounded-full bg-surface px-3 py-2 text-sm font-black tabular-nums text-ink ring-1 ring-inset ring-primary-200 outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                      aria-label="Edit calories"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => saveEdit(workout.id)}
                      className="rounded-full"
                    >
                      <Save className="h-4 w-4" strokeWidth={2.25} />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => beginEdit(workout.id, workout.durationMin, workout.calories)}
                      aria-label={`Edit ${workout.name}`}
                      className={cn(ROW_ACTION_CLASS, "text-primary-700 hover:bg-primary-50")}
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWorkout(workout.id)}
                      aria-label={`Delete ${workout.name}`}
                      className={cn(ROW_ACTION_CLASS, "text-accent-700 hover:bg-accent-50")}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // An honest empty well beats an invisible one: the panel used to render
        // nothing at all before the first manual entry.
        <div className="rounded-[1.25rem] bg-surface-subtle ring-1 ring-inset ring-hairline">
          <EmptyState
            size="inline"
            icon={Activity}
            title="No manual activity logged yet"
            description="Anything you add above lands here, where minutes and calories can be corrected or removed."
          />
        </div>
      )}
    </Card>
  );
}
