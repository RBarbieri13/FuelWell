"use client";

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
      <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-500">
        No suggestions right now
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-2">
      <ul>
        {suggestions.map((s, i) => (
          <li
            key={`${s.focus}-${i}`}
            className={i > 0 ? "border-t border-neutral-100" : undefined}
          >
            <div className="fw-artifact-mobile-stack flex items-center gap-3 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black capitalize text-neutral-900">
                  {s.focus.replace(/_/g, " ")}
                  <span className="ml-2 text-xs font-bold text-neutral-400">
                    {Math.round(s.durationMin)} min
                  </span>
                </p>
                <p className="mt-0.5 text-xs font-medium text-neutral-500">{s.why}</p>
                {(s.planPreview?.length ?? 0) > 0 && (
                  <p className="mt-0.5 truncate text-xs font-medium text-neutral-400">
                    {s.planPreview?.join(" · ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={`Plan a ${s.focus.replace(/_/g, " ")} workout, ${Math.round(s.durationMin)} minutes`}
                onClick={() =>
                  onAction({
                    kind: "invoke_tool",
                    name: "plan_workout",
                    input: { focus: s.focus, duration_min: s.durationMin },
                  })
                }
                className="min-h-10 shrink-0 rounded-full bg-primary-50 px-4 py-2.5 text-xs font-black text-primary-700 transition hover:bg-primary-100"
              >
                Plan it
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
