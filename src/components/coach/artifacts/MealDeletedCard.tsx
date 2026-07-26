"use client";

import { Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArtifactCardProps } from "./contract";

type MealDeletedArtifact = {
  id: string;
  type: "meal_deleted";
  mealId: string;
  name: string;
};

/**
 * A removal receipt, not a success receipt. The red plate, the struck name and
 * the always-present undo are what keep it from reading like "logged".
 */
export function MealDeletedCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealDeletedArtifact>) {
  const name = artifact.name || "meal";

  return (
    <div
      role="group"
      aria-label={`Deleted: ${name}`}
      className="fw-artifact-mobile-stack flex max-w-full items-center justify-between gap-3 rounded-[24px] border border-hairline bg-surface px-4 py-3 shadow-e1"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-red-50 text-red-600 ring-1 ring-inset ring-red-100"
        >
          <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-red-700">
            Deleted
          </div>
          <p className="mt-0.5 text-sm font-black leading-5 text-ink-muted line-through decoration-red-300 decoration-2 [overflow-wrap:anywhere]">
            {name}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label={`Undo deleting ${name}`}
        onClick={() =>
          onAction({ kind: "invoke_tool", name: "undo_last_action", input: {} })
        }
        className="shrink-0 text-xs"
      >
        <Undo2 className="h-3.5 w-3.5" strokeWidth={2.25} />
        Undo
      </Button>
    </div>
  );
}
