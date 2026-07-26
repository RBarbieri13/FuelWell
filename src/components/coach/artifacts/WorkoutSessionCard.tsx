"use client";

import { Activity, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
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
  const isActive = artifact.status === "active";

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
          >
            <Activity className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <h3 className="min-w-0 truncate text-base font-black capitalize text-ink">{planName}</h3>
        </div>
        <Badge variant={isActive ? "success" : "neutral"} size="sm" dot className="shrink-0 capitalize">
          {isActive ? "Active" : artifact.status}
        </Badge>
      </div>

      {sets.length === 0 ? (
        <EmptyState
          size="inline"
          icon={Activity}
          title="No sets logged yet"
          description="Type a set below and it lands here."
        />
      ) : (
        <ul className="mt-3 space-y-1">
          {sets.map((s, i) => {
            const latest = i === sets.length - 1;
            return (
              <li
                key={`${s.exercise}-${i}`}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 rounded-xl px-2.5 py-2 text-sm",
                  latest
                    ? "bg-primary-50 ring-1 ring-inset ring-primary-100"
                    : "bg-surface-subtle"
                )}
              >
                <span
                  className={cn(
                    "min-w-0 truncate",
                    latest ? "font-black text-primary-900" : "font-bold text-ink-muted"
                  )}
                >
                  {s.exercise}
                </span>
                <span
                  className={cn(
                    "shrink-0 tabular-nums",
                    latest ? "font-black text-primary-700" : "font-bold text-ink-muted"
                  )}
                >
                  {s.weightKg > 0 ? `${Math.round(s.weightKg * 2.20462)} lb x ` : ""}
                  {s.reps} reps
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs font-semibold text-ink-subtle">
        Log sets by typing e.g. &ldquo;bench 135 lb x 8&rdquo;
      </p>

      <Button
        type="button"
        size="md"
        aria-label="Finish workout and log it"
        onClick={() => onAction({ kind: "invoke_tool", name: "end_workout_session", input: {} })}
        className="mt-3 w-full"
      >
        <Flag className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Finish workout
      </Button>
    </Card>
  );
}
