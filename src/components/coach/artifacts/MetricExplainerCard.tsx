"use client";

import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type MetricExplainerArtifact = ArtifactSpec & {
  metric: string;
  title: string;
  body: string;
  currentValue: string;
};

export function MetricExplainerCard({ artifact }: ArtifactCardProps<MetricExplainerArtifact>) {
  const body = artifact.body?.trim();

  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader
        as="h3"
        icon={Info}
        eyebrow="How it works"
        title={artifact.title || "Metric"}
      />

      {body ? (
        <p className="mt-3 max-w-prose text-sm font-semibold leading-6 text-ink-muted">{body}</p>
      ) : (
        <EmptyState
          size="inline"
          icon={Info}
          title="No explanation available"
          description="Ask the coach to explain this metric and the write-up appears here."
        />
      )}

      {artifact.currentValue && (
        /* The live figure is the point of the card, so it gets a stat plate of
           its own rather than trailing the paragraph as body copy. */
        <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-[1.15rem] bg-surface-muted px-3 py-2.5 ring-1 ring-inset ring-hairline">
          <span className="text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-muted">
            Now
          </span>
          <span className="min-w-0 text-base font-black tabular-nums text-ink [overflow-wrap:anywhere]">
            {artifact.currentValue}
          </span>
        </div>
      )}
    </Card>
  );
}
