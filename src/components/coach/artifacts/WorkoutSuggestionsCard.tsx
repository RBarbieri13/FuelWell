"use client";

import { Dumbbell, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type WorkoutSuggestion = {
  focus: string;
  durationMin: number;
  why: string;
  planPreview?: string[];
};

type WorkoutSuggestionsArtifact = ArtifactSpec & {
  suggestions: WorkoutSuggestion[];
};

export function WorkoutSuggestionsCard({
  artifact,
  onAction,
}: ArtifactCardProps<WorkoutSuggestionsArtifact>) {
  const suggestions = artifact.suggestions ?? [];

  if (suggestions.length === 0) {
    return (
      <Card padding="sm" className="min-w-0 max-w-full">
        <EmptyState
          size="inline"
          icon={Dumbbell}
          title="No suggestions right now"
          description="Ask for a focus or a time budget and the coach will build one."
        />
      </Card>
    );
  }

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
        >
          <Dumbbell className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <h3 className="min-w-0 text-base font-black text-ink">Workout ideas</h3>
      </div>

      <ul className="mt-3 space-y-2">
        {suggestions.map((s, i) => {
          const focusLabel = s.focus.replace(/_/g, " ");
          const preview = s.planPreview ?? [];
          return (
            <li
              key={`${s.focus}-${i}`}
              className="rounded-2xl bg-surface-subtle p-3 ring-1 ring-inset ring-hairline"
            >
              <div className="fw-artifact-mobile-stack flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black capitalize text-ink">{focusLabel}</p>
                  <p className="mt-1">
                    <Badge variant="neutral" size="sm" className="tabular-nums">
                      <Timer className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
                      {Math.round(s.durationMin)} min
                    </Badge>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="tonal"
                  size="sm"
                  aria-label={`Plan a ${focusLabel} workout, ${Math.round(s.durationMin)} minutes`}
                  onClick={() =>
                    onAction({
                      kind: "invoke_tool",
                      name: "plan_workout",
                      input: { focus: s.focus, duration_min: s.durationMin },
                    })
                  }
                  className="shrink-0"
                >
                  Plan it
                </Button>
              </div>

              {s.why && (
                <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">{s.why}</p>
              )}

              {preview.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1">
                  {preview.map((move, moveIndex) => (
                    <li
                      key={`${move}-${moveIndex}`}
                      className="max-w-full truncate rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-bold text-ink-muted ring-1 ring-inset ring-hairline"
                    >
                      {move}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
