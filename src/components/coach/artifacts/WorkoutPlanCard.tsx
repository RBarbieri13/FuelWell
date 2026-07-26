"use client";

import { Dumbbell, Play, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
    <Card padding="sm" className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
          >
            <Dumbbell className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <h3 className="min-w-0 text-base font-black capitalize text-ink">{focusLabel}</h3>
        </div>
        <Badge variant="neutral" size="sm" className="shrink-0 tabular-nums">
          <Timer className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
          {Math.round(artifact.durationMin)} min
        </Badge>
      </div>

      {exercises.length === 0 ? (
        <EmptyState
          size="inline"
          icon={Dumbbell}
          title="No exercises in this plan"
          description="Ask the coach to rebuild it with a focus and a time budget."
        />
      ) : (
        <>
          <div className="mt-3 grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 px-1 pb-1 text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-subtle">
            <span aria-hidden="true" />
            <span>Exercise</span>
            <span className="text-right">Sets · rest</span>
          </div>
          <ol className="divide-y divide-hairline rounded-2xl bg-surface-subtle px-2 ring-1 ring-inset ring-hairline">
            {exercises.map((e, i) => (
              <li
                key={`${e.name}-${i}`}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 py-2.5 text-sm"
              >
                <span className="text-right text-xs font-black tabular-nums text-ink-faint">
                  {i + 1}
                </span>
                <span className="min-w-0 truncate font-bold text-ink">{e.name}</span>
                <span className="shrink-0 text-right text-xs font-black tabular-nums text-ink-muted">
                  {e.sets}x{e.reps}
                  <span className="ml-1.5 font-bold text-ink-subtle">{e.restSec}s rest</span>
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      <Button
        type="button"
        size="md"
        aria-label={`Start ${focusLabel} workout`}
        onClick={() =>
          onAction({
            kind: "invoke_tool",
            name: "start_workout_session",
            input: { plan_id: artifact.planId },
          })
        }
        className="mt-4 w-full"
      >
        <Play className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Start workout
      </Button>
    </Card>
  );
}
