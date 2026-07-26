"use client";

import { Dumbbell, Play, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
      {/* `capitalize` is applied in CSS, not by rewriting the string — the
          focus label stays lowercase in the DOM. */}
      <SectionHeader
        as="h3"
        icon={Dumbbell}
        eyebrow="Workout plan"
        title={focusLabel}
        description={
          exercises.length > 0
            ? `${exercises.length} exercise${exercises.length === 1 ? "" : "s"}`
            : undefined
        }
        action={
          <Badge variant="neutral" size="sm" className="tabular-nums">
            <Timer className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
            {Math.round(artifact.durationMin)} min
          </Badge>
        }
        className="[&_h3]:capitalize"
      />

      {exercises.length === 0 ? (
        <EmptyState
          size="inline"
          icon={Dumbbell}
          title="No exercises in this plan"
          description="Ask the coach to rebuild it with a focus and a time budget."
        />
      ) : (
        <>
          <div className="mt-3 grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 px-2 pb-1 text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-muted">
            <span aria-hidden="true" />
            <span>Exercise</span>
            <span className="text-right">Sets · rest</span>
          </div>
          <ol className="divide-y divide-hairline rounded-2xl bg-surface-muted px-2 ring-1 ring-inset ring-hairline">
            {exercises.map((e, i) => (
              <li
                key={`${e.name}-${i}`}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 py-2.5 text-sm"
              >
                <span className="text-right text-xs font-black tabular-nums text-ink-faint">
                  {i + 1}
                </span>
                <span className="min-w-0 truncate font-bold text-ink">{e.name}</span>
                {/* Sets and rest never truncate — the whole point of the row. */}
                <span className="shrink-0 text-right text-xs font-black tabular-nums text-ink-muted">
                  {e.sets}x{e.reps}
                  <span className="ml-1.5 font-bold text-ink-muted">{e.restSec}s rest</span>
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
