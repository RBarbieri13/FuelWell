"use client";

import { Settings2 } from "lucide-react";
import type { ArtifactSpec, CoachDaySnapshot } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type PreferencesUpdatedArtifact = ArtifactSpec & {
  patch: Partial<CoachDaySnapshot["preferences"]>;
};

export function PreferencesUpdatedCard({ artifact }: ArtifactCardProps<PreferencesUpdatedArtifact>) {
  const patch = artifact.patch ?? {};

  const rows: Array<{ label: string; value: string }> = [];
  if (patch.diets !== undefined) {
    rows.push({ label: "Diet", value: patch.diets.length > 0 ? patch.diets.join(", ") : "none" });
  }
  if (patch.allergies !== undefined) {
    rows.push({
      label: "Allergies",
      value: patch.allergies.length > 0 ? patch.allergies.join(", ") : "none",
    });
  }
  if (patch.likes !== undefined) {
    rows.push({ label: "Likes", value: patch.likes.length > 0 ? patch.likes.join(", ") : "none" });
  }
  if (patch.dislikes !== undefined) {
    rows.push({
      label: "Dislikes",
      value: patch.dislikes.length > 0 ? patch.dislikes.join(", ") : "none",
    });
  }
  if (patch.units !== undefined) {
    rows.push({ label: "Units", value: patch.units });
  }

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <Settings2 className="h-4 w-4" />
        </span>
        <p className="text-sm font-black text-neutral-900">Preferences updated</p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-neutral-500">No changes applied</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((row) => (
            <li key={row.label} className="flex items-baseline gap-3 text-sm">
              <span className="w-20 shrink-0 text-[10px] font-black uppercase tracking-wide text-neutral-400">
                {row.label}
              </span>
              <span className="min-w-0 break-words font-bold capitalize text-neutral-700">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
