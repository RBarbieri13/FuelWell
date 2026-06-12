"use client";

import { HeartPulse } from "lucide-react";
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
 * A small tappable chip, with contributor mini-rows only when a score exists.
 */
export function HealthScoreChip({ artifact, onAction }: ArtifactCardProps<HealthScoreArtifact>) {
  const score = artifact.score;
  const contributors = (artifact.contributors ?? []).filter((c) => c.score !== null);

  return (
    <div className="mt-3 inline-flex max-w-full flex-col items-start">
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
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm transition hover:border-primary-300 hover:bg-primary-50/70"
      >
        <HeartPulse className="h-4 w-4 text-primary-700" />
        <span className="font-black text-neutral-900">{score === null ? "—" : score}</span>
        <span className="font-bold text-neutral-500">Health Score</span>
      </button>

      {score !== null && contributors.length > 0 && (
        <ul className="mt-2 w-full space-y-0.5 pl-1">
          {contributors.map((c) => (
            <li
              key={c.key}
              className="flex items-baseline justify-between gap-3 text-xs font-medium text-neutral-500"
            >
              <span className="min-w-0 truncate">{c.label}</span>
              <span className="shrink-0 font-bold text-neutral-700">{c.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
