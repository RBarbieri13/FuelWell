"use client";

import { CornerDownLeft, MessageSquareDashed, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
    <Card padding="sm" className="max-w-full">
      {/* The question is the same icon-plate / title row every other card
          opens with, so it uses the shared header rather than a local copy. */}
      <SectionHeader as="h3" icon={Sparkles} title={artifact.question} />
      {options.length === 0 ? (
        <EmptyState
          size="inline"
          icon={MessageSquareDashed}
          title="Nothing to pick from"
          description="No options to choose from. Type your answer instead."
          className="py-6"
        />
      ) : (
        <div
          role="group"
          aria-label={artifact.question}
          className="fw-artifact-actions mt-3 flex flex-wrap gap-2"
        >
          {options.map((option, i) => (
            <button
              key={`${option}-${i}`}
              type="button"
              aria-label={`Reply: ${option}`}
              onClick={() => onAction({ kind: "send_message", text: option })}
              style={{ animationDelay: `${Math.min(i, 5) * 45}ms` }}
              // Chips are the primary way to answer, so they get real tap
              // affordance: inset ring instead of a border, press feedback, a
              // 44px target on touch, and a send glyph that leans in on hover
              // so the chip reads as "this sends" rather than "this filters".
              className="fw-press group inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-bold text-ink-muted shadow-e1 ring-1 ring-inset ring-hairline-strong duration-300 ease-out-soft animate-in fade-in slide-in-from-bottom-1 hover:bg-primary-50 hover:text-primary-800 hover:shadow-e2 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
            >
              <span className="min-w-0 truncate">{option}</span>
              <CornerDownLeft
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-ink-faint transition-colors duration-200 ease-out-soft group-hover:text-primary-600"
                strokeWidth={2}
              />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
