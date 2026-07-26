"use client";

import { ArrowRight, Check, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MacroTargets } from "@/lib/fuelwell-data";
import type { ArtifactCardProps } from "./contract";

type TargetChangeProposalArtifact = {
  id: string;
  type: "target_change_proposal";
  currentTargets: MacroTargets;
  proposedTargets: MacroTargets;
  reason: string;
  evidence: string[];
};

const ROWS: Array<{ key: keyof MacroTargets; label: string; unit: string }> = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

export function TargetChangeProposalCard({
  artifact,
  onAction,
}: ArtifactCardProps<TargetChangeProposalArtifact>) {
  const rows = ROWS.map(({ key, label, unit }) => {
    const current = Math.round(artifact.currentTargets?.[key] ?? 0);
    const proposed = Math.round(artifact.proposedTargets?.[key] ?? 0);
    return { key, label, unit, current, proposed, delta: proposed - current };
  });

  const hasChange = rows.some((row) => row.delta !== 0);
  // A percentage scale only means something when every baseline is non-zero.
  // Otherwise the bars get dropped rather than drawn against an invented axis.
  const scalable = hasChange && rows.every((row) => row.current > 0);
  const maxShift = scalable
    ? Math.max(...rows.map((row) => Math.abs(row.delta) / row.current))
    : 0;
  const axisLabel = Math.max(Math.round(maxShift * 100), 1);

  return (
    <div className="max-w-full rounded-[24px] border border-sky-100 bg-sky-50/60 p-4 shadow-e2">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200"
        >
          <Target className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <div className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-sky-700">
            Target change proposal
          </div>
          <p className="mt-1 text-sm font-bold leading-6 text-ink [overflow-wrap:anywhere]">
            {artifact.reason}
          </p>
        </div>
      </div>

      <ul className="mt-3 overflow-hidden rounded-[1rem] bg-surface ring-1 ring-inset ring-hairline">
        <li className="flex items-center justify-between gap-2 bg-surface-muted px-3 py-2">
          <div className="text-[10px] font-black uppercase tracking-[0.1em] text-ink-muted">
            Target
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.1em] text-ink-muted">
            Current → Proposed
          </div>
        </li>
        {rows.map((row) => {
          const shift = scalable ? Math.abs(row.delta) / row.current : 0;
          // Half the track is the largest change in the set, so the four rows
          // are comparable to each other rather than each self-scaled.
          const width = maxShift > 0 ? (shift / maxShift) * 50 : 0;
          const up = row.delta > 0;

          return (
            <li
              key={row.key}
              className="border-t border-hairline px-3 py-2.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="min-w-0 text-xs font-black uppercase tracking-[0.08em] text-ink-muted">
                  {row.label}
                </div>
                <span
                  className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1"
                  role="img"
                  aria-label={`${row.label}: ${row.current} ${row.unit} now, ${row.proposed} ${row.unit} proposed`}
                >
                  <span className="text-sm font-bold tabular-nums text-ink-muted">
                    {row.current}
                  </span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                  <span className="text-sm font-black tabular-nums text-ink">{row.proposed}</span>
                  <span className="text-[0.6875rem] font-bold text-ink-muted">{row.unit}</span>
                  {row.delta !== 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[0.6875rem] font-black tabular-nums ring-1 ring-inset ${
                        up
                          ? "bg-primary-50 text-primary-700 ring-primary-100"
                          : "bg-accent-50 text-accent-700 ring-accent-100"
                      }`}
                    >
                      {up ? "+" : "−"}
                      {Math.abs(row.delta)}
                    </span>
                  )}
                </span>
              </div>

              {scalable && (
                <div
                  aria-hidden="true"
                  className="relative mt-2 h-1.5 w-full rounded-full bg-surface-sunken"
                >
                  <span className="absolute inset-y-[-2px] left-1/2 w-px -translate-x-1/2 bg-ink/20" />
                  {row.delta !== 0 && (
                    <span
                      className="absolute inset-y-0 rounded-full transition-[width] duration-500 ease-out-soft"
                      style={{
                        width: `${width}%`,
                        left: up ? "50%" : `${50 - width}%`,
                        backgroundColor: up
                          ? "var(--color-primary-500)"
                          : "var(--color-accent-400)",
                      }}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
        {scalable && (
          <li className="flex items-center justify-between gap-2 border-t border-hairline bg-surface-muted px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-ink-subtle">
            <span className="tabular-nums">−{axisLabel}%</span>
            <span>No change</span>
            <span className="tabular-nums">+{axisLabel}%</span>
          </li>
        )}
      </ul>

      {artifact.evidence.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-dashed border-sky-200 pt-3">
          {artifact.evidence.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-xs font-semibold leading-5 text-ink-muted"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
              />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="fw-artifact-actions mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() =>
            onAction({
              kind: "invoke_tool",
              name: "update_goal_plan",
              input: {
                target_calories: artifact.proposedTargets.calories,
                target_protein: artifact.proposedTargets.protein,
                target_carbs: artifact.proposedTargets.carbs,
                target_fat: artifact.proposedTargets.fat,
                goal_reason: artifact.reason,
              },
            })
          }
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          Accept
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            onAction({
              kind: "send_message",
              text: "Decline that target change proposal. Keep my current targets.",
            })
          }
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          Decline
        </Button>
      </div>
    </div>
  );
}
