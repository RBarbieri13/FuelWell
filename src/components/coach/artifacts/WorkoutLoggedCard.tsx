"use client";

import { Dumbbell, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    parts.push(`@ ${Math.round(e.weightKg * 2.20462)} lb`);
  }
  return parts.join(" ");
}

export function WorkoutLoggedCard({ artifact, onAction }: ArtifactCardProps<WorkoutLoggedArtifact>) {
  const { workout } = artifact;

  if (!workout) {
    return (
      <div className="max-w-full rounded-[24px] border border-hairline bg-surface p-2 shadow-e1">
        <EmptyState
          size="inline"
          icon={Dumbbell}
          title="No workout data"
          description="This message arrived without the workout details attached."
        />
      </div>
    );
  }

  const exercises = workout.exercises ?? [];
  const burned = workout.calories && workout.calories > 0 ? Math.round(workout.calories) : null;
  const distance =
    workout.distanceMiles && workout.distanceMiles > 0
      ? Math.round(workout.distanceMiles * 10) / 10
      : null;

  return (
    <div
      role="group"
      aria-label={`Workout logged: ${workout.name}`}
      className="max-w-full rounded-[24px] border border-hairline bg-surface p-4 shadow-e2"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
        >
          <Dumbbell className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
            Workout logged
          </div>
          <p className="mt-0.5 text-sm font-black leading-5 text-ink [overflow-wrap:anywhere]">
            {workout.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="neutral" size="sm" className="capitalize">
              {workout.category}
            </Badge>
            {artifact.fromSession && (
              <Badge variant="success" size="sm">
                from session
              </Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        <Stat label="Duration" value={`${Math.round(workout.durationMin)}`} unit="min" emphasis />
        {burned !== null && (
          <Stat
            label="Burned"
            value={`${burned}`}
            unit="kcal"
            tint="var(--color-macro-calories)"
          />
        )}
        {distance !== null && <Stat label="Distance" value={`${distance}`} unit="mi" />}
      </dl>

      {exercises.length > 0 && (
        <div className="mt-3 border-t border-dashed border-hairline-strong pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-muted">
              Exercises
            </div>
            <span className="shrink-0 text-[0.6875rem] font-black tabular-nums text-ink-subtle">
              {exercises.length}
            </span>
          </div>
          <ul className="mt-2 overflow-hidden rounded-[1rem] bg-surface-muted ring-1 ring-inset ring-hairline">
            {exercises.map((e, i) => {
              const detail = formatExercise(e);
              return (
                <li
                  key={`${e.name}-${i}`}
                  className="flex items-baseline gap-2.5 border-t border-hairline px-3 py-2 text-sm first:border-t-0"
                >
                  <span
                    aria-hidden="true"
                    className="w-4 shrink-0 text-right text-[0.6875rem] font-black tabular-nums text-ink-faint"
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-bold text-ink">{e.name}</span>
                  {detail && (
                    <span className="shrink-0 font-bold tabular-nums text-ink-muted">{detail}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {workout.notes && (
        <p className="mt-3 rounded-[1rem] bg-surface-subtle px-3 py-2 text-xs font-semibold leading-5 text-ink-muted ring-1 ring-inset ring-hairline">
          {workout.notes}
        </p>
      )}

      {artifact.undoable && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-label="Undo logging this workout"
          onClick={() => onAction({ kind: "invoke_tool", name: "undo_last_action", input: {} })}
          className="mt-3 w-full text-xs sm:w-auto"
        >
          <Undo2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          Undo
        </Button>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tint,
  emphasis = false,
}: {
  label: string;
  value: string;
  unit: string;
  tint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-[0.9rem] px-3 py-2 ring-1 ring-inset ${
        emphasis ? "bg-primary-50 ring-primary-100" : "bg-surface-muted ring-hairline"
      }`}
    >
      <dt className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] text-ink-muted">
        {tint && (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: tint }}
          />
        )}
        <span className="min-w-0 truncate">{label}</span>
      </dt>
      <dd className="mt-0.5 flex items-baseline gap-1">
        <span
          className={`text-base font-black tabular-nums ${
            emphasis ? "text-primary-800" : "text-ink"
          }`}
        >
          {value}
        </span>
        <span className="text-[0.6875rem] font-bold text-ink-muted">{unit}</span>
      </dd>
    </div>
  );
}
