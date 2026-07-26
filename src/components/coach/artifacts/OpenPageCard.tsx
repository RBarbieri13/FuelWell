"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="fw-artifact-mobile-stack group flex max-w-full items-center justify-between gap-3 rounded-[24px] border border-hairline bg-surface px-4 py-3 shadow-e1 transition-colors duration-200 ease-out-soft hover:bg-surface-subtle">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
        >
          <ExternalLink className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-5 text-ink [overflow-wrap:anywhere]">
            {artifact.reason || "There is a page for this."}
          </p>
          {artifact.route && (
            <span className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-surface-muted px-2.5 py-1 font-mono text-[0.6875rem] font-bold text-ink-muted ring-1 ring-inset ring-hairline">
              <span className="min-w-0 truncate">{artifact.route}</span>
            </span>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="tonal"
        size="sm"
        aria-label={`Open ${artifact.route}`}
        onClick={() => onAction({ kind: "open_route", route: artifact.route })}
        className="shrink-0 text-xs"
      >
        Open
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 ease-out-soft motion-safe:group-hover:translate-x-0.5"
          strokeWidth={2.25}
        />
      </Button>
    </div>
  );
}
