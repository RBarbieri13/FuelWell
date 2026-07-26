"use client";

import { Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactSpec, CoachDaySnapshot } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type PreferencesUpdatedArtifact = ArtifactSpec & {
  patch: Partial<CoachDaySnapshot["preferences"]>;
};

type PreferenceRow = {
  label: string;
  values: string[];
  /** Allergies carry a safety consequence, so they never sit in the neutral role. */
  tone: "default" | "warning" | "neutral";
};

export function PreferencesUpdatedCard({ artifact }: ArtifactCardProps<PreferencesUpdatedArtifact>) {
  const patch = artifact.patch ?? {};

  const rows: PreferenceRow[] = [];
  if (patch.diets !== undefined) {
    rows.push({ label: "Diet", values: patch.diets, tone: "default" });
  }
  if (patch.allergies !== undefined) {
    rows.push({ label: "Allergies", values: patch.allergies, tone: "warning" });
  }
  if (patch.likes !== undefined) {
    rows.push({ label: "Likes", values: patch.likes, tone: "neutral" });
  }
  if (patch.dislikes !== undefined) {
    rows.push({ label: "Dislikes", values: patch.dislikes, tone: "neutral" });
  }
  if (patch.units !== undefined) {
    rows.push({ label: "Units", values: [patch.units], tone: "neutral" });
  }

  return (
    <div
      role="group"
      aria-label="Preferences updated"
      className="max-w-full rounded-[24px] border border-hairline bg-surface p-4 shadow-e2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
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
              className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-3 border-t border-hairline px-3 py-2.5 first:border-t-0"
            >
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-ink-muted">
                {row.label}
              </div>
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {row.values.length > 0 ? (
                  row.values.map((value) => (
                    <Badge
                      key={value}
                      variant={row.tone}
                      size="sm"
                      dot={row.tone === "warning"}
                      className="max-w-full capitalize"
                    >
                      <span className="min-w-0 break-words">{value}</span>
                    </Badge>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-bold text-ink-subtle ring-1 ring-inset ring-hairline-strong">
                    none
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
