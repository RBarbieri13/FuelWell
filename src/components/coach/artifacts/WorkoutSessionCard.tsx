"use client";

import { Flag } from "lucide-react";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type LoggedSet = { exercise: string; weightKg: number; reps: number };

type WorkoutSessionArtifact = ArtifactSpec & {
  sessionId: string;
  plan?: { focus: string; durationMin: number } | null;
  loggedSets: LoggedSet[];
  status: string;
};

export function WorkoutSessionCard({ artifact, onAction }: ArtifactCardProps<WorkoutSessionArtifact>) {
  const sets = artifact.loggedSets ?? [];
  const planName = artifact.plan
    ? `${artifact.plan.focus.replace(/_/g, " ")} workout`
    : "Workout session";

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-black capitalize text-neutral-900">{planName}</p>
        <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-primary-700">
          {artifact.status === "active" ? "Active" : artifact.status}
        </span>
      </div>

      {sets.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-neutral-500">No sets logged yet</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {sets.map((s, i) => {
            const latest = i === sets.length - 1;
            return (
              <li
                key={`${s.exercise}-${i}`}
                className={
                  latest
                    ? "flex items-baseline justify-between gap-3 rounded-xl bg-primary-50 px-2.5 py-1.5 text-sm"
                    : "flex items-baseline justify-between gap-3 px-2.5 py-1 text-sm"
                }
              >
                <span
                  className={
                    latest
                      ? "min-w-0 truncate font-black text-primary-900"
                      : "min-w-0 truncate font-bold text-neutral-700"
                  }
                >
                  {s.exercise}
                </span>
                <span
                  className={
                    latest
                      ? "shrink-0 font-bold text-primary-700"
                      : "shrink-0 font-medium text-neutral-500"
                  }
                >
                  {s.weightKg > 0 ? `${Math.round(s.weightKg * 2.20462)} lb x ` : ""}
                  {s.reps} reps
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs font-medium text-neutral-400">
        Log sets by typing e.g. &ldquo;bench 135 lb x 8&rdquo;
      </p>

      <button
        type="button"
        aria-label="Finish workout and log it"
        onClick={() => onAction({ kind: "invoke_tool", name: "end_workout_session", input: {} })}
        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800"
      >
        <Flag className="h-4 w-4" />
        Finish workout
      </button>
    </div>
  );
}
