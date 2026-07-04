"use client";

import { Info } from "lucide-react";
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
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <Info className="h-4 w-4" />
        </span>
        <p className="min-w-0 truncate text-sm font-black text-neutral-900">
          {artifact.title || "Metric"}
        </p>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-neutral-600">
        {artifact.body || "No explanation available"}
      </p>

      {artifact.currentValue && (
        <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-xs">
          <span className="font-black uppercase tracking-wide text-neutral-400">Now</span>
          <span className="min-w-0 truncate font-black text-neutral-900">
            {artifact.currentValue}
          </span>
        </p>
      )}
    </div>
  );
}
