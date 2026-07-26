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

/** Bands so an 88 and a 41 do not read as the same neutral green. */
function bandColor(score: number): string {
  if (score >= 80) return "var(--color-primary-500)";
  if (score >= 60) return "var(--color-lemon-500)";
  return "var(--color-accent-500)";
}

function bandTextClass(score: number): string {
  if (score >= 80) return "text-primary-700";
  if (score >= 60) return "text-lemon-700";
  return "text-accent-700";
}

/**
 * Deliberately compact — Health Score is de-emphasized in v1.3+.
 * A small tappable plate, with contributor mini-meters only when a score
 * exists. The plate carries a real surface because the artifact scope paints
 * an elevation shadow on every top-level card; a transparent wrapper would
 * leave that shadow floating around nothing.
 */
export function HealthScoreChip({ artifact, onAction }: ArtifactCardProps<HealthScoreArtifact>) {
  const score = artifact.score;
  const all = artifact.contributors ?? [];
  const contributors = all.filter((c) => c.score !== null);
  const unscored = all.filter((c) => c.score === null);

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
          <span
            className={`font-black tabular-nums ${score === null ? "text-ink-muted" : bandTextClass(score)}`}
          >
            {score === null ? "—" : score}
          </span>
          <span className="text-[0.625rem] font-bold text-ink-muted">/100</span>
        </span>
        <span className="min-w-0 truncate font-bold text-ink-muted">Health Score</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
      </button>

      {score === null && (
        <p className="px-3 pb-1 text-xs font-semibold text-ink-muted">
          Nothing scored yet today — log a meal to start it.
        </p>
      )}

      {score !== null && contributors.length > 0 && (
        <ul className="space-y-2 rounded-[1.15rem] bg-surface-muted px-3 py-2.5">
          {contributors.map((c) => {
            const value = c.score ?? 0;
            return (
              <li key={c.key} className="min-w-0">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-ink-muted">
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  <ProgressMeter
                    className="w-14 shrink-0"
                    size="sm"
                    value={value}
                    target={100}
                    color={bandColor(value)}
                    label={`${c.label}: ${value} out of 100. ${c.status}`}
                  />
                  <span
                    className={`w-7 shrink-0 text-right font-black tabular-nums ${bandTextClass(value)}`}
                  >
                    {value}
                  </span>
                </div>
                {c.status && (
                  /* The status sentence is the only thing that says *why* the
                     meter sits where it does. */
                  <p className="mt-0.5 truncate text-[0.625rem] font-semibold text-ink-muted">
                    {c.status}
                  </p>
                )}
              </li>
            );
          })}

          {unscored.length > 0 && (
            <li className="border-t border-hairline pt-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <span className="block truncate">
                {`${unscored.map((c) => c.label).join(" · ")} not scored yet`}
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
