"use client";

import type { ArtifactCardProps } from "./contract";

type QuickRepliesArtifact = {
  id: string;
  type: "quick_replies";
  question: string;
  options: string[];
};

export function QuickReplyChips({
  artifact,
  onAction,
}: ArtifactCardProps<QuickRepliesArtifact>) {
  const options = artifact.options ?? [];

  return (
    <div className="max-w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-bold text-neutral-900">{artifact.question}</p>
      {options.length === 0 ? (
        <p className="mt-2 text-sm font-medium text-neutral-500">
          No options to choose from. Type your answer instead.
        </p>
      ) : (
        <div className="fw-artifact-actions mt-3 flex flex-wrap gap-2">
          {options.map((option, i) => (
            <button
              key={`${option}-${i}`}
              type="button"
              aria-label={`Reply: ${option}`}
              onClick={() => onAction({ kind: "send_message", text: option })}
              className="min-h-10 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition hover:border-primary-300 hover:bg-primary-50/70 hover:text-primary-700"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
