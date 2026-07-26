"use client";

import { Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactCardProps } from "./contract";

type UndoConfirmArtifact = {
  id: string;
  type: "undo_confirm";
  label: string;
};

export function UndoConfirmCard({ artifact }: ArtifactCardProps<UndoConfirmArtifact>) {
  return (
    <div className="flex max-w-full items-center gap-3 rounded-[24px] border border-hairline bg-surface-subtle px-4 py-3 shadow-e1">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface-muted text-ink-muted ring-1 ring-inset ring-hairline-strong"
      >
        <Undo2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-muted">
          Undone
        </div>
        <p className="mt-0.5 text-sm font-black leading-5 text-ink [overflow-wrap:anywhere]">
          {artifact.label || "last action"}
        </p>
      </div>

      <Badge variant="neutral" size="sm" className="shrink-0">
        Reverted
      </Badge>
    </div>
  );
}
