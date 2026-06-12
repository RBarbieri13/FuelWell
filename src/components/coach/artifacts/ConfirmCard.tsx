"use client";

import { AlertTriangle } from "lucide-react";
import type { CoachCardAction } from "./contract";

export type ConfirmCardProps = {
  toolName: string;
  input: unknown;
  prompt: string;
  onAction: (action: CoachCardAction) => void;
};

export function ConfirmCard({ toolName, input, prompt, onAction }: ConfirmCardProps) {
  return (
    <div className="max-w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm font-bold leading-5 text-amber-900">{prompt}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label={`Confirm ${toolName.replaceAll("_", " ")}`}
          onClick={() => onAction({ kind: "confirm_tool", name: toolName, input })}
          className="min-h-10 rounded-full bg-amber-600 px-4 py-2 text-xs font-black text-white transition hover:bg-amber-700"
        >
          Yes, do it
        </button>
        <button
          type="button"
          aria-label="Cancel this action"
          onClick={() => onAction({ kind: "cancel_confirm" })}
          className="min-h-10 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-black text-amber-900 transition hover:bg-amber-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
