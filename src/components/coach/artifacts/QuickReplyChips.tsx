"use client";

import { MessageSquareDashed, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
    <Card padding="none" className="max-w-full p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
        >
          <Sparkles className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <p className="min-w-0 pt-1 text-sm font-black leading-6 text-ink [overflow-wrap:anywhere]">
          {artifact.question}
        </p>
      </div>
      {options.length === 0 ? (
        <EmptyState
          size="inline"
          icon={MessageSquareDashed}
          title="Nothing to pick from"
          description="No options to choose from. Type your answer instead."
          className="py-6"
        />
      ) : (
        <div className="fw-artifact-actions mt-3 flex flex-wrap gap-2">
          {options.map((option, i) => (
            <button
              key={`${option}-${i}`}
              type="button"
              aria-label={`Reply: ${option}`}
              onClick={() => onAction({ kind: "send_message", text: option })}
              // Chips are the primary way to answer, so they get real tap
              // affordance: inset ring instead of a border, press feedback,
              // and a 44px target on touch.
              className="fw-press inline-flex min-h-11 max-w-full items-center rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink-muted shadow-e1 ring-1 ring-inset ring-hairline-strong hover:bg-primary-50 hover:text-primary-800 hover:shadow-e2 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
            >
              <span className="truncate">{option}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
