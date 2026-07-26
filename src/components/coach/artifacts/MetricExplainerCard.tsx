"use client";

import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
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
  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader as="h3" icon={Info} title={artifact.title || "Metric"} />

      <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">
        {artifact.body || "No explanation available"}
      </p>

      {artifact.currentValue && (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-[1.15rem] bg-surface-muted px-3 py-2.5 ring-1 ring-inset ring-hairline">
          <span className="text-[0.625rem] font-black uppercase text-ink-subtle">Now</span>
          <span className="min-w-0 text-sm font-black tabular-nums text-ink [overflow-wrap:anywhere]">
            {artifact.currentValue}
          </span>
        </div>
      )}
    </Card>
  );
}
