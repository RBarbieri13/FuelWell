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

const MACROS = ["protein", "carbs", "fat"] as const;

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
        <SectionHeader as="h3" icon={BarChart3} title="Macro history" />
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
  const gap = series.length > 14 ? 1 : 3;
  const barW = (VIEW_W - gap * (series.length - 1)) / series.length;
  const columnW = barW + gap;
  const scaleY = (g: number) => (g / maxGrams) * VIEW_H;

  // Every average is computed from logged days only. Sample days stay on the
  // chart (hatched and faded) but folding them into a mean would print
  // synthesized intake as a headline fact.
  const loggedDays = series.filter((d) => d.source !== "sample");
  const hasSample = loggedDays.length !== series.length;
  const hasAvg = loggedDays.length > 0;
  const meanOf = (key: "calories" | "protein" | "carbs" | "fat") =>
    hasAvg ? Math.round(loggedDays.reduce((s, d) => s + d[key], 0) / loggedDays.length) : 0;
  const avgGrams = hasAvg
    ? loggedDays.reduce((sum, d) => sum + d.protein + d.carbs + d.fat, 0) / loggedDays.length
    : 0;
  const avgY = VIEW_H - scaleY(avgGrams);
  const avgCalories = meanOf("calories");
  const avgByMacro = {
    protein: meanOf("protein"),
    carbs: meanOf("carbs"),
    fat: meanOf("fat"),
  } as const;
  // When sample days are present the averages describe a subset, so every
  // readout says so rather than leaning on the footnote.
  const avgWord = hasSample ? "logged avg" : "avg";
  // Hatch id must stay unique when several history charts share one transcript.
  const hatchId = `fw-macro-hatch-${String(artifact.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const summary = hasAvg
    ? `Macro history, last ${artifact.window}: ${series.length} days charted. ` +
      `Across ${loggedDays.length} logged ${loggedDays.length === 1 ? "day" : "days"}, average ${avgCalories} kcal per day, ` +
      `${avgByMacro.protein} g protein, ${avgByMacro.carbs} g carbs, ${avgByMacro.fat} g fat. ` +
      `Highest day totalled ${Math.round(maxGrams)} g of macros.` +
      (hasSample ? " Sample days are charted but excluded from the averages." : "")
    : `Macro history, last ${artifact.window}: ${series.length} sample days charted and no logged intake yet, so no averages are shown. ` +
      `Highest day totalled ${Math.round(maxGrams)} g of macros.`;

  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader
        as="h3"
        icon={BarChart3}
        title="Macro history"
        description={
          hasAvg
            ? `${hasSample ? "Logged-day avg" : "Avg"} ${Math.round(avgGrams)} g of macros · ${avgCalories} kcal per day`
            : "Sample days only — nothing logged yet to average"
        }
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
          <span className="block pl-9">
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="h-28 w-full"
              role="img"
              aria-label={summary}
              preserveAspectRatio="none"
            >
              <defs>
                {/* Sample days are hatched as well as faded — opacity alone is
                    ambiguous once bars get thin. */}
                <pattern
                  id={hatchId}
                  width="5"
                  height="5"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="5"
                    stroke="var(--color-surface)"
                    strokeWidth="2"
                    strokeOpacity="0.75"
                  />
                </pattern>
              </defs>

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
                const x = i * columnW;
                const hP = scaleY(d.protein);
                const hC = scaleY(d.carbs);
                const hF = scaleY(d.fat);
                const isSample = d.source === "sample";
                return (
                  <g key={d.date}>
                    <title>
                      {`${shortDate(d.date)}: ${Math.round(d.protein)} g protein, ${Math.round(d.carbs)} g carbs, ${Math.round(d.fat)} g fat · ${Math.round(d.calories)} kcal${isSample ? " (sample)" : ""}`}
                    </title>
                    <g opacity={isSample ? 0.6 : 1}>
                      <rect x={x} y={VIEW_H - hP} width={barW} height={hP} fill={COLORS.protein} />
                      <rect
                        x={x}
                        y={VIEW_H - hP - hC}
                        width={barW}
                        height={hC}
                        fill={COLORS.carbs}
                      />
                      <rect
                        x={x}
                        y={VIEW_H - hP - hC - hF}
                        width={barW}
                        height={hF}
                        fill={COLORS.fat}
                      />
                      {isSample && (
                        <rect
                          x={x}
                          y={VIEW_H - hP - hC - hF}
                          width={barW}
                          height={hP + hC + hF}
                          fill={`url(#${hatchId})`}
                        />
                      )}
                    </g>
                    {/* Full-height hit band: thin bars are almost impossible to
                        hover for their own tooltip. */}
                    <rect
                      x={x - gap / 2}
                      y="0"
                      width={columnW}
                      height={VIEW_H}
                      className="fill-transparent transition-[fill] duration-150 ease-out-soft hover:fill-ink/10"
                    />
                  </g>
                );
              })}

              {/* Average across the logged days — the comparison line. Absent
                  entirely when there is nothing logged to average. */}
              {hasAvg && (
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
              )}
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
            className="pointer-events-none absolute left-0 top-0 -translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-muted"
          >
            {`${Math.round(maxGrams)}g`}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-muted"
          >
            {`${Math.round(maxGrams / 2)}g`}
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 translate-y-1/2 text-[0.625rem] font-bold tabular-nums text-ink-muted"
          >
            0
          </span>
          {hasAvg && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 max-w-[60%] truncate -translate-y-1/2 rounded-full bg-surface/85 px-1 text-[0.625rem] font-bold tabular-nums text-ink-muted"
              style={{ top: `${(avgY / VIEW_H) * 100}%` }}
            >
              {`${avgWord} ${Math.round(avgGrams)}g`}
            </span>
          )}
        </span>

        <span className="mt-1.5 flex items-baseline justify-between gap-3 pl-9 text-[0.625rem] font-bold tabular-nums text-ink-muted">
          <span className="min-w-0 truncate">{shortDate(series[0].date)}</span>
          <span className="min-w-0 truncate text-right">
            {shortDate(series[series.length - 1].date)}
          </span>
        </span>
      </button>

      {/* Legend doubles as the per-macro average readout, so the colours are
          tied to a number instead of only to a name. */}
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
        {MACROS.map((m) => (
          <div
            key={m}
            className="min-w-0 rounded-[0.9rem] bg-surface-muted px-2 py-1.5 ring-1 ring-inset ring-hairline"
          >
            <dt className="flex min-w-0 items-center gap-1.5 text-[0.625rem] font-black uppercase tracking-[0.08em] text-ink-muted">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: COLORS[m] }}
              />
              <span className="truncate">{m}</span>
            </dt>
            <dd className="mt-0.5 text-sm font-black tabular-nums text-ink">
              <span className="block truncate">{hasAvg ? `${avgByMacro[m]}g` : "—"}</span>
              <span className="block truncate text-[0.625rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                {hasAvg ? avgWord : "no logged days"}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {hasSample && (
        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-ink-muted">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-4 shrink-0 rounded-[3px] bg-[repeating-linear-gradient(45deg,var(--color-hairline-strong)_0_2px,var(--color-surface-muted)_2px_5px)] ring-1 ring-inset ring-hairline-strong"
          />
          <span className="min-w-0">
            Hatched, faded days are sample data — averages count logged days only.
          </span>
        </p>
      )}

      {artifact.sample && (
        <p className="mt-1 text-xs font-semibold text-ink-muted">
          Past days are sample data; today is your logged intake.
        </p>
      )}
    </Card>
  );
}
