"use client";

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

export function MacroHistoryChart({ artifact, onAction }: ArtifactCardProps<MacroHistoryArtifact>) {
  const series = artifact.series ?? [];

  if (series.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-primary-100 bg-white p-4 text-sm font-medium text-neutral-500">
        No history to chart yet
      </div>
    );
  }

  const maxGrams = Math.max(...series.map((d) => d.protein + d.carbs + d.fat), 1);
  const gap = series.length > 14 ? 1 : 3;
  const barW = (VIEW_W - gap * (series.length - 1)) / series.length;
  const scaleY = (g: number) => (g / maxGrams) * VIEW_H;

  const avg = (key: "calories" | "protein") =>
    Math.round(series.reduce((s, d) => s + d[key], 0) / series.length);
  const summary = `Macro history, last ${artifact.window}: average ${avg("calories")} kcal and ${avg("protein")} g protein per day across ${series.length} days, stacked by protein, carbs, and fat grams.`;

  return (
    <div className="mt-3 rounded-2xl border border-primary-100 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-black text-neutral-900">Macro history</p>
        <span className="text-xs font-bold text-neutral-400">{artifact.window}</span>
      </div>

      <button
        type="button"
        aria-label="Explain the macro split"
        onClick={() =>
          onAction({ kind: "invoke_tool", name: "explain_metric", input: { metric: "macro_split" } })
        }
        className="mt-3 block w-full rounded-xl transition hover:bg-neutral-50"
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-28 w-full"
          role="img"
          aria-label={summary}
          preserveAspectRatio="none"
        >
          {series.map((d, i) => {
            const x = i * (barW + gap);
            const hP = scaleY(d.protein);
            const hC = scaleY(d.carbs);
            const hF = scaleY(d.fat);
            const opacity = d.source === "sample" ? 0.45 : 1;
            return (
              <g key={d.date} opacity={opacity}>
                <rect x={x} y={VIEW_H - hP} width={barW} height={hP} fill={COLORS.protein} />
                <rect x={x} y={VIEW_H - hP - hC} width={barW} height={hC} fill={COLORS.carbs} />
                <rect x={x} y={VIEW_H - hP - hC - hF} width={barW} height={hF} fill={COLORS.fat} />
              </g>
            );
          })}
        </svg>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        {(["protein", "carbs", "fat"] as const).map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: COLORS[m] }}
            />
            <span className="capitalize">{m} (g)</span>
          </span>
        ))}
      </div>

      {artifact.sample && (
        <p className="mt-2 text-xs font-medium text-neutral-400">
          Past days are sample data; today is your logged intake.
        </p>
      )}
    </div>
  );
}
