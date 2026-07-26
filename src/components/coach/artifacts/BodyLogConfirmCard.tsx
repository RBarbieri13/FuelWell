"use client";

import { Check, Droplet, Scale, Smile, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type BodyLogConfirmArtifact = ArtifactSpec & {
  kind: "weight" | "mood" | "water";
  value: number;
  unit?: string;
  displayValue?: string;
};

function kgToLb(value: number) {
  return Math.round(value * 2.20462 * 10) / 10;
}

/** One tint per measurement family so three receipts in a row stay tellable apart. */
const PLATE_STYLES = {
  weight: "bg-primary-50 text-primary-700 ring-primary-100",
  mood: "bg-lemon-50 text-lemon-700 ring-lemon-200",
  water: "bg-sky-50 text-sky-700 ring-sky-200",
  default: "bg-surface-muted text-ink-muted ring-hairline-strong",
} as const;

export function BodyLogConfirmCard({ artifact }: ArtifactCardProps<BodyLogConfirmArtifact>) {
  const { kind, value } = artifact;

  let Icon: LucideIcon = Check;
  let label = "Logged";
  let figure = "";
  let unit = "";

  switch (kind) {
    case "weight":
      Icon = Scale;
      label = "Weight logged";
      figure = String(
        artifact.unit === "lb" ? Math.round(value * 10) / 10 : kgToLb(value)
      );
      unit = "lb";
      break;
    case "mood":
      Icon = Smile;
      label = "Mood logged";
      figure = `${Math.round(value)}/5`;
      break;
    case "water":
      Icon = Droplet;
      label = "Water logged";
      figure = String(Math.round(value));
      unit = "ml";
      break;
    default:
      break;
  }

  const plate = PLATE_STYLES[kind] ?? PLATE_STYLES.default;

  return (
    <div
      role="group"
      aria-label={figure ? `${label}: ${figure}${unit ? ` ${unit}` : ""}` : label}
      className="flex max-w-full items-center gap-3 rounded-[24px] border border-hairline bg-surface px-4 py-3 shadow-e1"
    >
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] ring-1 ring-inset ${plate}`}
      >
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-muted">
          {label}
        </div>
        {figure && (
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1 text-lg font-black leading-6 text-ink [overflow-wrap:anywhere]">
            <span className="tabular-nums">{figure}</span>
            {unit && (
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                {unit}
              </span>
            )}
          </p>
        )}
      </div>

      <Badge variant="success" size="sm" dot className="shrink-0">
        Saved
      </Badge>
    </div>
  );
}
