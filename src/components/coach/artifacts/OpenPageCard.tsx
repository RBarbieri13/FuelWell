"use client";

import { ArrowRight } from "lucide-react";
import type { ArtifactCardProps } from "./contract";

type OpenPageArtifact = {
  id: string;
  type: "open_page";
  route: string;
  reason: string;
};

export function OpenPageCard({
  artifact,
  onAction,
}: ArtifactCardProps<OpenPageArtifact>) {
  return (
    <div className="flex max-w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <p className="min-w-0 text-sm font-medium leading-5 text-neutral-700">
        {artifact.reason || "There is a page for this."}
      </p>
      <button
        type="button"
        aria-label={`Open ${artifact.route}`}
        onClick={() => onAction({ kind: "open_route", route: artifact.route })}
        className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full bg-primary-50 px-4 py-2 text-xs font-black text-primary-700 transition hover:bg-primary-100"
      >
        Open
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
