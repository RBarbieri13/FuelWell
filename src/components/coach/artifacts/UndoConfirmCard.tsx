"use client";

import { Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactCardProps } from "./contract";

type UndoConfirmArtifact = {
  id: string;
  type: "undo_confirm";
  label: string;
};

/**
 * A record that no longer stands. The dashed outline plus the struck label are
 * the whole point — a solid receipt here would read as "logged", the exact
 * opposite of what happened.
 */
export function UndoConfirmCard({ artifact }: ArtifactCardProps<UndoConfirmArtifact>) {
  const label = artifact.label || "last action";

  return (
    <div
      role="group"
      aria-label={`Undone: ${label}`}
      className="flex max-w-full items-center gap-3 rounded-[24px] border border-dashed border-hairline-strong bg-surface-subtle px-4 py-3 shadow-e1"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-surface text-ink-subtle ring-1 ring-inset ring-hairline-strong"
      >
        <Undo2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle">
          Undone
        </div>
        <p className="mt-0.5 text-sm font-black leading-5 text-ink-muted line-through decoration-ink-faint decoration-2 [overflow-wrap:anywhere]">
          {label}
        </p>
      </div>

      <Badge variant="neutral" size="sm" className="shrink-0">
        Reverted
      </Badge>
    </div>
  );
}
