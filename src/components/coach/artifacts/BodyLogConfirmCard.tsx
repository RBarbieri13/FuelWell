"use client";

import { Droplet, Scale, Smile } from "lucide-react";
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

  let icon = <Scale className="h-4 w-4" />;
  let line: string;
  switch (kind) {
    case "weight":
      icon = <Scale className="h-4 w-4" />;
      line =
        artifact.unit === "lb"
          ? `Weight logged: ${Math.round(value * 10) / 10} lb`
          : `Weight logged: ${kgToLb(value)} lb`;
      break;
    case "mood":
      icon = <Smile className="h-4 w-4" />;
      line = `Mood logged: ${Math.round(value)}/5`;
      break;
    case "water":
      icon = <Droplet className="h-4 w-4" />;
      line = `Water logged: ${Math.round(value)} ml`;
      break;
    default:
      line = "Logged";
  }

  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        {icon}
      </span>
      <p className="min-w-0 truncate text-sm font-bold text-neutral-700">{line}</p>
    </div>
  );
}
