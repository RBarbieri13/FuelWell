"use client";

import { Dumbbell, Undo2 } from "lucide-react";
import type { ArtifactSpec, WorkoutEntry } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type WorkoutLoggedArtifact = ArtifactSpec & {
  workout: WorkoutEntry;
  undoable?: boolean;
  fromSession?: boolean;
};

function formatExercise(e: NonNullable<WorkoutEntry["exercises"]>[number]): string {
  const parts: string[] = [];
  if (e.sets !== undefined && e.reps !== undefined) parts.push(`${e.sets}x${e.reps}`);
  else if (e.sets !== undefined) parts.push(`${e.sets} sets`);
  else if (e.reps !== undefined) parts.push(`${e.reps} reps`);
  if (e.weightKg !== undefined && e.weightKg > 0) {
    parts.push(`@ ${Math.round(e.weightKg * 10) / 10} kg`);
  }
  return parts.join(" ");
}

export function WorkoutLoggedCard({ artifact, onAction }: ArtifactCardProps<WorkoutLoggedArtifact>) {
  const { workout } = artifact;
  if (!workout) {
    return (
      <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-500">
        No workout data
      </div>
    );
  }
  const exercises = workout.exercises ?? [];

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
          <Dumbbell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-neutral-900">{workout.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-neutral-500">
              {workout.category}
            </span>
            <span className="text-xs font-bold text-neutral-500">
              {Math.round(workout.durationMin)} min
            </span>
            {artifact.fromSession && (
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary-700">
                from session
              </span>
            )}
          </div>
        </div>
      </div>

      {exercises.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
          {exercises.map((e, i) => (
            <li key={`${e.name}-${i}`} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-bold text-neutral-700">{e.name}</span>
              <span className="shrink-0 font-medium text-neutral-500">{formatExercise(e)}</span>
            </li>
          ))}
        </ul>
      )}

      {workout.notes && (
        <p className="mt-2 text-xs font-medium text-neutral-500">{workout.notes}</p>
      )}

      {artifact.undoable && (
        <button
          type="button"
          aria-label="Undo logging this workout"
          onClick={() => onAction({ kind: "invoke_tool", name: "undo_last_action", input: {} })}
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-black text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Undo
        </button>
      )}
    </div>
  );
}
