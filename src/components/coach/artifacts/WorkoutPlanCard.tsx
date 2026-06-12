"use client";

import { Play } from "lucide-react";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type PlanExercise = { name: string; sets: number; reps: number; restSec: number };

type WorkoutPlanArtifact = ArtifactSpec & {
  planId: string;
  focus: string;
  durationMin: number;
  exercises: PlanExercise[];
};

export function WorkoutPlanCard({ artifact, onAction }: ArtifactCardProps<WorkoutPlanArtifact>) {
  const exercises = artifact.exercises ?? [];
  const focusLabel = (artifact.focus ?? "workout").replace(/_/g, " ");

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-black capitalize text-neutral-900">{focusLabel}</p>
        <span className="shrink-0 text-xs font-bold text-neutral-500">
          {Math.round(artifact.durationMin)} min
        </span>
      </div>

      {exercises.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-neutral-500">No exercises in this plan</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {exercises.map((e, i) => (
            <li key={`${e.name}-${i}`} className="flex items-baseline gap-2.5 text-sm">
              <span className="w-4 shrink-0 text-right text-xs font-black text-neutral-300">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-bold text-neutral-700">{e.name}</span>
              <span className="shrink-0 font-medium text-neutral-500">
                {e.sets}x{e.reps} · {e.restSec}s rest
              </span>
            </li>
          ))}
        </ol>
      )}

      <button
        type="button"
        aria-label={`Start ${focusLabel} workout`}
        onClick={() =>
          onAction({
            kind: "invoke_tool",
            name: "start_workout_session",
            input: { plan_id: artifact.planId },
          })
        }
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800"
      >
        <Play className="h-4 w-4" />
        Start workout
      </button>
    </div>
  );
}
