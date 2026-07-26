"use client";

import { Minus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type WeightTrendArtifact = ArtifactSpec & {
  series: Array<{ date: string; weightKg: number }>;
  delta: number | null;
  insufficient: boolean;
};

const VIEW_W = 280;
const VIEW_H = 64;
const PAD = 8;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function kgToLb(value: number) {
  return Math.round(value * 2.20462 * 10) / 10;
}

/** "2026-07-15" -> "Jul 15". Parsed by hand so SSR and client agree exactly. */
function shortDate(value: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!parts) return value ?? "";
  return `${MONTHS[Number(parts[2]) - 1] ?? ""} ${Number(parts[3])}`.trim();
}

export function WeightTrendSpark({ artifact }: ArtifactCardProps<WeightTrendArtifact>) {
  const series = artifact.series ?? [];

  if (artifact.insufficient || series.length < 2) {
    return (
      <Card padding="sm" className="mt-3">
        <EmptyState
          size="inline"
          icon={Scale}
          title="Not enough weigh-ins yet"
          description="Log one and check back — the trend line needs two readings."
        />
      </Card>
    );
  }

  const weights = series.map((e) => e.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const coords = series.map((entry, i) => ({
    x: PAD + (i / (series.length - 1)) * (VIEW_W - PAD * 2),
    y: PAD + (1 - (entry.weightKg - min) / range) * (VIEW_H - PAD * 2),
  }));
  const points = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `M ${points.split(" ").join(" L ")} L ${(VIEW_W - PAD).toFixed(1)},${VIEW_H} L ${PAD.toFixed(1)},${VIEW_H} Z`;
  const lastPoint = coords[coords.length - 1];

  const delta = artifact.delta ?? 0;
  const first = kgToLb(series[0].weightKg);
  const latest = kgToLb(series[series.length - 1].weightKg);
  const lowLb = kgToLb(min);
  const highLb = kgToLb(max);
  const deltaLb = kgToLb(delta);
  const deltaLabel = `${deltaLb > 0 ? "+" : ""}${deltaLb} lb`;

  const gaining = delta > 0;
  const flat = delta === 0;
  const TrendIcon = flat ? Minus : gaining ? TrendingUp : TrendingDown;
  const lineColor = "var(--color-primary-500)";
  // SVG ids must stay unique when several trend cards share one transcript.
  const fillId = `fw-weight-fill-${String(artifact.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader
        as="h3"
        icon={Scale}
        title="Weight"
        description={`${series.length} weigh-ins · ${lowLb}–${highLb} lb range`}
        action={
          <Badge
            variant={gaining ? "warning" : "success"}
            className={
              gaining
                ? "bg-accent-50 tabular-nums text-accent-700 ring-accent-200"
                : "tabular-nums"
            }
          >
            <TrendIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            {deltaLabel}
          </Badge>
        }
      />

      <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-2xl font-black tabular-nums text-ink">{latest}</span>
        <span className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
          lb latest
        </span>
      </p>

      <div className="relative mt-2 h-16 w-full animate-in fade-in duration-500 ease-out-soft pr-9">
        {/* Right gutter holds the value axis, so the endpoint marker and the
            scale labels can never sit on top of each other. */}
        <div className="relative h-full w-full">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-full w-full"
            role="img"
            aria-label={`Weight trend over ${series.length} weigh-ins, from ${first} lb on ${shortDate(series[0].date)} to ${latest} lb on ${shortDate(series[series.length - 1].date)}, change ${deltaLabel}. Range ${lowLb} to ${highLb} lb.`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.24" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* High / low gridlines — a trend line means nothing without its band. */}
            <line
              x1="0"
              y1={PAD}
              x2={VIEW_W}
              y2={PAD}
              stroke="var(--color-hairline-strong)"
              strokeWidth="1"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1={VIEW_H - PAD}
              x2={VIEW_W}
              y2={VIEW_H - PAD}
              stroke="var(--color-hairline-strong)"
              strokeWidth="1"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />

            <path d={areaPath} fill={`url(#${fillId})`} stroke="none" />
            <polyline
              points={points}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.25"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Latest-reading marker, positioned in HTML: the non-uniform SVG
              scale would squash an in-chart circle into an ellipse. */}
          <span
            aria-hidden="true"
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600 ring-2 ring-surface"
            style={{
              left: `${(lastPoint.x / VIEW_W) * 100}%`,
              top: `${(lastPoint.y / VIEW_H) * 100}%`,
            }}
          />
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 -translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-faint"
          style={{ top: `${(PAD / VIEW_H) * 100}%` }}
        >
          {highLb}
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 -translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-faint"
          style={{ top: `${((VIEW_H - PAD) / VIEW_H) * 100}%` }}
        >
          {lowLb}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-hairline pt-2 text-[0.6875rem] font-bold tabular-nums text-ink-subtle">
        <span className="min-w-0 truncate">{`${first} lb · ${shortDate(series[0].date)}`}</span>
        <span className="min-w-0 truncate text-right text-ink-muted">
          {`${latest} lb · ${shortDate(series[series.length - 1].date)}`}
        </span>
      </div>
    </Card>
  );
}
