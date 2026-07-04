"use client";

import { Undo2 } from "lucide-react";
import type { ArtifactCardProps } from "./contract";

type UndoConfirmArtifact = {
  id: string;
  type: "undo_confirm";
  label: string;
};

export function UndoConfirmCard({ artifact }: ArtifactCardProps<UndoConfirmArtifact>) {
  return (
    <div className="flex max-w-full items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <Undo2 className="h-4 w-4 shrink-0 text-neutral-400" />
      <p className="min-w-0 truncate text-sm font-medium text-neutral-700">
        Undone: <span className="font-black">{artifact.label || "last action"}</span>
      </p>
    </div>
  );
}
