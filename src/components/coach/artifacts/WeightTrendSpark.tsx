"use client";

import { Scale } from "lucide-react";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type WeightTrendArtifact = ArtifactSpec & {
  series: Array<{ date: string; weightKg: number }>;
  delta: number | null;
  insufficient: boolean;
};

const VIEW_W = 280;
const VIEW_H = 60;
const PAD = 6;

function kgToLb(value: number) {
  return Math.round(value * 2.20462 * 10) / 10;
}

export function WeightTrendSpark({ artifact }: ArtifactCardProps<WeightTrendArtifact>) {
  const series = artifact.series ?? [];

  if (artifact.insufficient || series.length < 2) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
          <Scale className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium text-neutral-500">
          Not enough weigh-ins yet — log one and check back
        </p>
      </div>
    );
  }

  const weights = series.map((e) => e.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const points = series
    .map((e, i) => {
      const x = PAD + (i / (series.length - 1)) * (VIEW_W - PAD * 2);
      const y = PAD + (1 - (e.weightKg - min) / range) * (VIEW_H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const delta = artifact.delta ?? 0;
  const latest = kgToLb(series[series.length - 1].weightKg);
  const deltaLb = kgToLb(delta);
  const deltaLabel = `${deltaLb > 0 ? "+" : ""}${deltaLb} lb`;

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-neutral-900">
          Weight
          <span className="ml-2 font-bold text-neutral-500">{latest} lb</span>
        </p>
        <span
          className={
            delta <= 0
              ? "shrink-0 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-black text-primary-700"
              : "shrink-0 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-black text-accent-700"
          }
        >
          {deltaLabel}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-2 h-16 w-full"
        role="img"
        aria-label={`Weight trend over ${series.length} weigh-ins, from ${kgToLb(series[0].weightKg)} lb to ${latest} lb, change ${deltaLabel}`}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-primary-500)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
