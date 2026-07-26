"use client";

import { Activity, Flag, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
      {/* `capitalize` stays a CSS concern so the underlying focus string is
          untouched; only the heading is transformed. */}
      <SectionHeader
        as="h3"
        icon={Activity}
        eyebrow="Session"
        title={planName}
        description={
          sets.length > 0
            ? `${sets.length} set${sets.length === 1 ? "" : "s"} logged`
            : undefined
        }
        action={
          <Badge
            variant={isActive ? "success" : "neutral"}
            size="sm"
            dot
            className="capitalize"
          >
            {isActive ? "Active" : artifact.status}
          </Badge>
        }
        className="[&_h3]:capitalize"
      />

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
                  "grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-baseline gap-x-2.5 rounded-xl px-2.5 py-2 text-sm",
                  latest
                    ? "bg-primary-50 ring-1 ring-inset ring-primary-100"
                    : "bg-surface-muted"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-right text-[0.625rem] font-black tabular-nums",
                    latest ? "text-primary-600" : "text-ink-faint"
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "min-w-0 truncate",
                    latest ? "font-black text-primary-900" : "font-bold text-ink-muted"
                  )}
                >
                  {s.exercise}
                </span>
                {/* Load and reps are the payload of the row — shrink-0 so they
                    are never the thing that gets cut. */}
                <span
                  className={cn(
                    "shrink-0 text-right tabular-nums",
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

      <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface-subtle px-2.5 py-2 text-xs font-semibold leading-5 text-ink-muted ring-1 ring-inset ring-hairline">
        <Info
          aria-hidden="true"
          strokeWidth={2.25}
          className="mt-px h-3.5 w-3.5 shrink-0 text-ink-faint"
        />
        <span className="min-w-0">
          Log sets by typing e.g. &ldquo;bench 135 lb x 8&rdquo;
        </span>
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
