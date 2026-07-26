"use client";

import { Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="max-w-full rounded-[24px] border border-hairline bg-surface p-4 shadow-e2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
          >
            <Settings2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <p className="min-w-0 text-sm font-black text-ink [overflow-wrap:anywhere]">
            Preferences updated
          </p>
        </div>
        {rows.length > 0 && (
          <Badge variant="success" size="sm" dot className="shrink-0">
            Saved
          </Badge>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 rounded-[1rem] bg-surface-muted px-3 py-2.5 text-sm font-semibold text-ink-muted ring-1 ring-inset ring-hairline">
          No changes applied
        </p>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-[1rem] bg-surface-muted ring-1 ring-inset ring-hairline">
          {rows.map((row) => (
            <li
              key={row.label}
              className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-baseline gap-3 border-t border-hairline px-3 py-2.5 first:border-t-0"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.08em] text-ink-muted">
                {row.label}
              </div>
              <span className="min-w-0 break-words text-sm font-bold capitalize text-ink">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
