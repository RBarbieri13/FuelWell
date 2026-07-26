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

  return (
    <div className="flex max-w-full items-center gap-3 rounded-[24px] border border-hairline bg-surface px-4 py-3 shadow-e1">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
      >
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-muted">
          {label}
        </div>
        {figure && (
          <p className="mt-0.5 text-base font-black leading-6 text-ink [overflow-wrap:anywhere]">
            <span className="tabular-nums">{figure}</span>
            {unit && (
              <span className="ml-1 text-xs font-bold text-ink-muted">{unit}</span>
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
