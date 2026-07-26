"use client";

import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type MacroHistoryDay = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "logged" | "sample";
};

type MacroHistoryArtifact = ArtifactSpec & {
  window: string;
  series: MacroHistoryDay[];
  targets?: { calories: number; protein: number; carbs: number; fat: number };
  sample?: boolean;
};

// Macro colors from the FW.zip Lagoon & Coral design system.
const COLORS = {
  protein: "var(--color-macro-protein)",
  carbs: "var(--color-macro-carbs)",
  fat: "var(--color-macro-fat)",
} as const;

const VIEW_W = 320;
const VIEW_H = 120;

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

/** "2026-07-15" -> "Jul 15". Parsed by hand so SSR and client agree exactly. */
function shortDate(value: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!parts) return value ?? "";
  return `${MONTHS[Number(parts[2]) - 1] ?? ""} ${Number(parts[3])}`.trim();
}

export function MacroHistoryChart({ artifact, onAction }: ArtifactCardProps<MacroHistoryArtifact>) {
  const series = artifact.series ?? [];

  if (series.length === 0) {
    return (
      <Card padding="sm" className="mt-3">
        <EmptyState
          size="inline"
          icon={BarChart3}
          title="No history to chart yet"
          description="Log a day of meals and the macro split starts building here."
        />
      </Card>
    );
  }

  const totalsPerDay = series.map((d) => d.protein + d.carbs + d.fat);
  const maxGrams = Math.max(...totalsPerDay, 1);
  const avgGrams = totalsPerDay.reduce((sum, g) => sum + g, 0) / series.length;
  const gap = series.length > 14 ? 1 : 3;
  const barW = (VIEW_W - gap * (series.length - 1)) / series.length;
  const scaleY = (g: number) => (g / maxGrams) * VIEW_H;
  const avgY = VIEW_H - scaleY(avgGrams);

  const avg = (key: "calories" | "protein") =>
    Math.round(series.reduce((s, d) => s + d[key], 0) / series.length);
  const summary = `Macro history, last ${artifact.window}: average ${avg("calories")} kcal and ${avg("protein")} g protein per day across ${series.length} days, stacked by protein, carbs, and fat grams.`;

  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader
        as="h3"
        icon={BarChart3}
        title="Macro history"
        description={`Avg ${Math.round(avgGrams)} g of macros · ${avg("calories")} kcal per day`}
        action={
          artifact.window ? (
            <Badge variant="neutral" size="sm">
              {artifact.window}
            </Badge>
          ) : undefined
        }
      />

      <button
        type="button"
        aria-label="Explain the macro split"
        onClick={() =>
          onAction({ kind: "invoke_tool", name: "explain_metric", input: { metric: "macro_split" } })
        }
        className="fw-press mt-3 block w-full rounded-2xl px-1 pb-1 pt-2 text-left hover:bg-surface-muted active:bg-surface-sunken"
      >
        <span className="relative block animate-in fade-in duration-500 ease-out-soft">
          {/* Left gutter carries the value axis; without it the bars are decoration. */}
          <span className="block pl-8">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="h-28 w-full"
              role="img"
              aria-label={summary}
              preserveAspectRatio="none"
            >
              {/* Gridlines at max and midpoint, plus the zero baseline. */}
              {[0, VIEW_H / 2].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2={VIEW_W}
                  y2={y}
                  stroke="var(--color-hairline)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {series.map((d, i) => {
                const x = i * (barW + gap);
                const hP = scaleY(d.protein);
                const hC = scaleY(d.carbs);
                const hF = scaleY(d.fat);
                const opacity = d.source === "sample" ? 0.45 : 1;
                return (
                  <g key={d.date} opacity={opacity}>
                    <title>
                      {`${shortDate(d.date)}: ${Math.round(d.protein)} g protein, ${Math.round(d.carbs)} g carbs, ${Math.round(d.fat)} g fat · ${Math.round(d.calories)} kcal${d.source === "sample" ? " (sample)" : ""}`}
                    </title>
                    <rect x={x} y={VIEW_H - hP} width={barW} height={hP} fill={COLORS.protein} />
                    <rect x={x} y={VIEW_H - hP - hC} width={barW} height={hC} fill={COLORS.carbs} />
                    <rect
                      x={x}
                      y={VIEW_H - hP - hC - hF}
                      width={barW}
                      height={hF}
                      fill={COLORS.fat}
                    />
                  </g>
                );
              })}

              {/* Average total across the window — the comparison line. */}
              <line
                x1="0"
                y1={avgY}
                x2={VIEW_W}
                y2={avgY}
                stroke="var(--color-ink-subtle)"
                strokeWidth="1.25"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1={VIEW_H}
                x2={VIEW_W}
                y2={VIEW_H}
                stroke="var(--color-hairline-strong)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 -translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-faint"
          >
            {`${Math.round(maxGrams)}g`}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-faint"
          >
            0
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 -translate-y-1/2 rounded-full bg-surface/85 px-1 text-[0.625rem] font-bold tabular-nums text-ink-subtle"
            style={{ top: `${(avgY / VIEW_H) * 100}%` }}
          >
            {`avg ${Math.round(avgGrams)}g`}
          </span>
        </span>

        <span className="mt-1.5 flex items-baseline justify-between gap-3 pl-8 text-[0.625rem] font-bold text-ink-faint">
          <span className="min-w-0 truncate">{shortDate(series[0].date)}</span>
          <span className="min-w-0 truncate text-right">
            {shortDate(series[series.length - 1].date)}
          </span>
        </span>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-hairline pt-3">
        {(["protein", "carbs", "fat"] as const).map((m) => (
          <span
            key={m}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted"
          >
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
              style={{ backgroundColor: COLORS[m] }}
            />
            <span className="capitalize">{m} (g)</span>
          </span>
        ))}
      </div>

      {artifact.sample && (
        <p className="mt-2 text-xs font-semibold text-ink-subtle">
          Past days are sample data; today is your logged intake.
        </p>
      )}
    </Card>
  );
}
