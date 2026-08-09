"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoachCardAction } from "./contract";

export type ConfirmCardProps = {
  toolName: string;
  input: unknown;
  prompt: string;
  token: string;
  onAction: (action: CoachCardAction) => void;
};

/**
 * Reads the tool arguments back to the user so the consequence is legible
 * before they commit. Only primitives are surfaced — a nested object would
 * turn the gate into a debug dump.
 */
function summarizeInput(input: unknown): Array<{ key: string; value: string }> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return [];
  return Object.entries(input as Record<string, unknown>)
    .filter(([, value]) => {
      if (typeof value === "string") return value.trim().length > 0;
      return typeof value === "number" || typeof value === "boolean";
    })
    .slice(0, 4)
    .map(([key, value]) => ({
      key: key.replaceAll("_", " "),
      value: typeof value === "boolean" ? (value ? "yes" : "no") : String(value),
    }));
}

/**
 * The gate in front of a destructive tool call. Styled in the danger role
 * rather than the caution role so it never reads like the constructive
 * receipts it sits next to in the transcript.
 */
export function ConfirmCard({ toolName, input, prompt, token, onAction }: ConfirmCardProps) {
  const actionLabel = toolName.replaceAll("_", " ");
  const details = summarizeInput(input);

  return (
    <div
      role="group"
      aria-label={`Confirmation required: ${actionLabel}`}
      className="max-w-full overflow-hidden rounded-[24px] border border-red-200 bg-surface shadow-e2"
    >
      <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-3.5 py-3 sm:px-4">
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
        </div>
      </div>

      <div className="px-3.5 py-3 sm:px-4">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[0.6875rem] font-black uppercase tracking-[0.08em] text-red-700 ring-1 ring-inset ring-red-200">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <span className="min-w-0 truncate">{actionLabel}</span>
        </span>

        {details.length > 0 && (
          <dl className="mt-3 overflow-hidden rounded-[1rem] bg-surface-muted ring-1 ring-inset ring-hairline">
            {details.map((detail) => (
              <div
                key={detail.key}
                className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-baseline gap-3 border-t border-hairline px-3 py-2 first:border-t-0"
              >
                <dt className="min-w-0 truncate text-[10px] font-black uppercase tracking-[0.08em] text-ink-muted">
                  {detail.key}
                </dt>
                <dd className="min-w-0 break-words text-sm font-bold tabular-nums text-ink">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="fw-artifact-actions mt-3.5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="danger"
            aria-label={`Confirm ${actionLabel}`}
            onClick={() => onAction({ kind: "confirm_tool", name: toolName, input, token })}
            className="w-full bg-red-600 text-white shadow-e2 hover:bg-red-700 hover:text-white active:bg-red-800 sm:w-auto"
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
    </div>
  );
}
