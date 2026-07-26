"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoachCardAction } from "./contract";

export type ConfirmCardProps = {
  toolName: string;
  input: unknown;
  prompt: string;
  onAction: (action: CoachCardAction) => void;
};

/**
 * The gate in front of a destructive tool call. Styled in the danger role
 * rather than the caution role so it never reads like the constructive
 * receipts it sits next to in the transcript.
 */
export function ConfirmCard({ toolName, input, prompt, onAction }: ConfirmCardProps) {
  const actionLabel = toolName.replaceAll("_", " ");

  return (
    <div className="max-w-full rounded-[24px] border border-red-100 bg-red-50/70 p-4 shadow-e2">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-red-100 text-red-700 ring-1 ring-inset ring-red-200"
        >
          <AlertTriangle className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-red-700">
            Needs your confirmation
          </p>
          <p className="mt-1 text-sm font-bold leading-6 text-ink [overflow-wrap:anywhere]">
            {prompt}
          </p>
          <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[0.6875rem] font-black uppercase tracking-[0.08em] text-red-700 ring-1 ring-inset ring-red-100">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <span className="min-w-0 truncate">{actionLabel}</span>
          </span>
        </div>
      </div>

      <div className="fw-artifact-actions mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="danger"
          aria-label={`Confirm ${actionLabel}`}
          onClick={() => onAction({ kind: "confirm_tool", name: toolName, input })}
          className="w-full bg-red-600 text-white shadow-e2 hover:bg-red-700 active:bg-red-800 sm:w-auto"
        >
          Yes, do it
        </Button>
        <Button
          type="button"
          variant="secondary"
          aria-label="Cancel this action"
          onClick={() => onAction({ kind: "cancel_confirm" })}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
