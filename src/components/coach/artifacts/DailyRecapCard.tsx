"use client";

import { ArrowRight, ClipboardList } from "lucide-react";
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

      <div className="mt-4 space-y-3">
        {BARS.map(({ key, label, color, unit }) => {
          const value = totals[key];
          const target = targets[key];
          const over = target > 0 && value > target;
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="min-w-0 truncate font-bold text-ink-muted">{label}</span>
                <span
                  className={
                    over
                      ? "shrink-0 font-black tabular-nums text-accent-700"
                      : "shrink-0 font-bold tabular-nums text-ink"
                  }
                >
                  {`${formatValue(value, unit)}/${formatValue(target, unit)} ${unit}`}
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

      {highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-hairline pt-3">
          {highlights.map((h, i) => (
            <li key={i} className="flex gap-2 text-xs font-semibold leading-5 text-ink-muted">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300"
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
            <span className="block text-[0.625rem] font-black uppercase text-primary-700">
              Next move
            </span>
            <span className="mt-0.5 block text-sm font-bold leading-5 text-primary-900">
              {artifact.nextMove}
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-700" />
        </button>
      )}
    </Card>
  );
}
