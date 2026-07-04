"use client";

import { Trash2, Undo2 } from "lucide-react";
import type { ArtifactCardProps } from "./contract";

type MealDeletedArtifact = {
  id: string;
  type: "meal_deleted";
  mealId: string;
  name: string;
};

export function MealDeletedCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealDeletedArtifact>) {
  return (
    <div className="flex max-w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Trash2 className="h-4 w-4 shrink-0 text-neutral-400" />
        <p className="truncate text-sm font-medium text-neutral-700">
          Deleted <span className="font-black">{artifact.name || "meal"}</span>
        </p>
      </div>
      <button
        type="button"
        aria-label={`Undo deleting ${artifact.name || "meal"}`}
        onClick={() =>
          onAction({ kind: "invoke_tool", name: "undo_last_action", input: {} })
        }
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-black text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        <Undo2 className="h-3.5 w-3.5" />
        Undo
      </button>
    </div>
  );
}
