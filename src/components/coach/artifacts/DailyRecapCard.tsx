"use client";

import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
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
  { key: "calories", label: "Calories", color: "var(--color-macro-calories)", unit: "kcal" },
  { key: "protein", label: "Protein", color: "var(--color-macro-protein)", unit: "g" },
  { key: "carbs", label: "Carbs", color: "var(--color-macro-carbs)", unit: "g" },
  { key: "fat", label: "Fat", color: "var(--color-macro-fat)", unit: "g" },
];

function formatValue(value: number, unit: string): string {
  return unit === "kcal" ? `${Math.round(value)}` : `${Math.round(value * 10) / 10}`;
}

export function DailyRecapCard({ artifact, onAction }: ArtifactCardProps<DailyRecapArtifact>) {
  const totals = artifact.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = artifact.targets ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const highlights = artifact.highlights ?? [];

  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader
        as="h3"
        icon={ClipboardList}
        title="Daily recap"
        action={
          <Badge variant="neutral" size="sm" className="tabular-nums">
            {`${artifact.mealCount ?? 0} meals · ${artifact.workoutCount ?? 0} workouts`}
          </Badge>
        }
      />

      {/* Sunken well groups the four meters into one comparison table so the
          percentage column reads as a shared axis. */}
      <div className="mt-4 rounded-[1.15rem] bg-surface-subtle p-3 ring-1 ring-inset ring-hairline">
        <div className="flex items-baseline justify-between gap-2 text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-muted">
          <span className="min-w-0 truncate">Logged vs target</span>
          <span className="shrink-0">% of target</span>
        </div>

        <div className="mt-2.5 space-y-3">
          {BARS.map(({ key, label, color, unit }) => {
            const value = totals[key];
            const target = targets[key];
            const over = target > 0 && value > target;
            const pct = target > 0 ? Math.round((value / target) * 100) : null;
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate font-bold text-ink-muted">{label}</span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span
                      className={
                        over
                          ? "font-black tabular-nums text-accent-700"
                          : "font-bold tabular-nums text-ink"
                      }
                    >
                      {`${formatValue(value, unit)}/${formatValue(target, unit)} ${unit}`}
                    </span>
                    {/* Fixed-width percentage column keeps the four figures in
                        one vertical line instead of ragging with the values. */}
                    <span
                      className={
                        over
                          ? "w-10 text-right text-[0.6875rem] font-black tabular-nums text-accent-700"
                          : "w-10 text-right text-[0.6875rem] font-bold tabular-nums text-ink-muted"
                      }
                    >
                      {pct === null ? "—" : `${pct}%`}
                    </span>
                  </span>
                </div>
                <ProgressMeter
                  className="mt-1.5"
                  size="sm"
                  value={value}
                  target={target}
                  color={color}
                  label={`${label}: ${formatValue(value, unit)} of ${formatValue(target, unit)} ${unit}${over ? ", over target" : ""}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {highlights.length > 0 && (
        <ul className="mt-4 space-y-2">
          {highlights.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-xs font-semibold leading-5 text-ink-muted">
              <Sparkles
                aria-hidden="true"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600"
                strokeWidth={2}
              />
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
          className="fw-press mt-4 flex min-h-11 w-full items-center justify-between gap-3 rounded-[1.15rem] bg-primary-50 px-4 py-3 text-left ring-1 ring-inset ring-primary-100 hover:bg-primary-100 hover:ring-primary-200 active:bg-primary-200"
        >
          <span className="min-w-0">
            <span className="block text-[0.625rem] font-black uppercase tracking-[0.1em] text-primary-700">
              Next move
            </span>
            <span className="mt-0.5 block text-sm font-bold leading-5 text-primary-900">
              {artifact.nextMove}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-primary-700 ring-1 ring-inset ring-primary-100"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
          </span>
        </button>
      )}
    </Card>
  );
}
