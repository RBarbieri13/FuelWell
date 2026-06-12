"use client";

import { ArrowRight } from "lucide-react";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type Macros = { calories: number; protein: number; carbs: number; fat: number };

type DailyRecapArtifact = ArtifactSpec & {
  totals: Macros;
  targets: Macros;
  mealCount: number;
  workoutCount: number;
  highlights: string[];
  nextMove: string;
};

const BARS: Array<{ key: keyof Macros; label: string; color: string; unit: string }> = [
  { key: "calories", label: "Calories", color: "#22c55e", unit: "kcal" },
  { key: "protein", label: "Protein", color: "#3b82f6", unit: "g" },
  { key: "carbs", label: "Carbs", color: "#f59e0b", unit: "g" },
  { key: "fat", label: "Fat", color: "#ef4444", unit: "g" },
];

function formatValue(value: number, unit: string): string {
  return unit === "kcal" ? `${Math.round(value)}` : `${Math.round(value * 10) / 10}`;
}

export function DailyRecapCard({ artifact, onAction }: ArtifactCardProps<DailyRecapArtifact>) {
  const totals = artifact.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = artifact.targets ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const highlights = artifact.highlights ?? [];

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-black text-neutral-900">Daily recap</p>
        <span className="shrink-0 text-xs font-bold text-neutral-400">
          {artifact.mealCount ?? 0} meals · {artifact.workoutCount ?? 0} workouts
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {BARS.map(({ key, label, color, unit }) => {
          const value = totals[key];
          const target = targets[key];
          const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-neutral-500">{label}</span>
                <span className="font-bold text-neutral-700">
                  {formatValue(value, unit)}/{formatValue(target, unit)} {unit}
                </span>
              </div>
              <div
                className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100"
                role="img"
                aria-label={`${label}: ${formatValue(value, unit)} of ${formatValue(target, unit)} ${unit}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {highlights.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
          {highlights.map((h, i) => (
            <li key={i} className="flex gap-2 text-xs font-medium text-neutral-600">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-300" />
              <span className="min-w-0">{h}</span>
            </li>
          ))}
        </ul>
      )}

      {artifact.nextMove && (
        <button
          type="button"
          aria-label="Ask the coach about this next move"
          onClick={() => onAction({ kind: "send_message", text: artifact.nextMove })}
          className="mt-3 flex min-h-10 w-full items-center justify-between gap-3 rounded-2xl bg-primary-50 px-4 py-3 text-left transition hover:bg-primary-100"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-wide text-primary-700">
              Next move
            </span>
            <span className="block text-sm font-bold text-primary-900">{artifact.nextMove}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary-700" />
        </button>
      )}
    </div>
  );
}
