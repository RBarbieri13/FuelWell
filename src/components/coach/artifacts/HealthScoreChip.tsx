"use client";

import { ChevronRight, HeartPulse } from "lucide-react";
import { ProgressMeter } from "@/components/ui/progress-meter";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type Contributor = {
  key: string;
  label: string;
  score: number | null;
  status: string;
};

type HealthScoreArtifact = ArtifactSpec & {
  score: number | null;
  contributors?: Contributor[];
  compact?: boolean;
};

/**
 * Deliberately compact — Health Score is de-emphasized in v1.3+.
 * A small tappable plate, with contributor mini-meters only when a score
 * exists. The plate carries a real surface because the artifact scope paints
 * an elevation shadow on every top-level card; a transparent wrapper would
 * leave that shadow floating around nothing.
 */
export function HealthScoreChip({ artifact, onAction }: ArtifactCardProps<HealthScoreArtifact>) {
  const score = artifact.score;
  const contributors = (artifact.contributors ?? []).filter((c) => c.score !== null);

  return (
    <div className="mt-3 inline-flex max-w-full flex-col items-stretch gap-2 rounded-[1.45rem] border border-hairline bg-surface p-2 shadow-e1">
      <button
        type="button"
        aria-label={
          score === null
            ? "Health score: no data yet. Tap to learn how it works"
            : `Health score ${score} out of 100. Tap to see how it is calculated`
        }
        onClick={() =>
          onAction({
            kind: "invoke_tool",
            name: "explain_metric",
            input: { metric: "health_score" },
          })
        }
        className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-primary-50 active:bg-primary-100"
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
        >
          <HeartPulse className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="flex items-baseline gap-0.5">
          <span className="font-black tabular-nums text-ink">{score === null ? "—" : score}</span>
          <span className="text-[0.625rem] font-bold text-ink-faint">/100</span>
        </span>
        <span className="min-w-0 truncate font-bold text-ink-muted">Health Score</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-faint" />
      </button>

      {score !== null && contributors.length > 0 && (
        <ul className="space-y-1.5 rounded-[1.15rem] bg-surface-muted px-3 py-2.5">
          {contributors.map((c) => (
            <li key={c.key} className="flex items-center gap-2.5 text-xs font-semibold text-ink-muted">
              <span className="min-w-0 flex-1 truncate">{c.label}</span>
              <ProgressMeter
                className="w-14 shrink-0"
                size="sm"
                value={c.score ?? 0}
                target={100}
                color="var(--color-primary-400)"
                label={`${c.label}: ${c.score} out of 100`}
              />
              <span className="w-7 shrink-0 text-right font-black tabular-nums text-ink">
                {c.score}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
