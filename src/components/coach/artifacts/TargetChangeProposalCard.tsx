"use client";

import { Check, X } from "lucide-react";
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

export function TargetChangeProposalCard({
  artifact,
  onAction,
}: ArtifactCardProps<TargetChangeProposalArtifact>) {
  return (
    <div className="max-w-full rounded-2xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wider text-sky-700">
        Target change proposal
      </p>
      <p className="mt-2 text-sm font-bold leading-5 text-neutral-800">
        {artifact.reason}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <TargetColumn label="Current" targets={artifact.currentTargets} />
        <TargetColumn label="Proposed" targets={artifact.proposedTargets} />
      </div>

      {artifact.evidence.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-4 text-xs font-medium leading-5 text-neutral-600">
          {artifact.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <div className="fw-artifact-actions mt-3 flex flex-wrap gap-2">
        <button
          type="button"
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
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-sky-700 px-4 py-2 text-xs font-black text-white transition hover:bg-sky-600"
        >
          <Check className="h-3.5 w-3.5" />
          Accept
        </button>
        <button
          type="button"
          onClick={() =>
            onAction({
              kind: "send_message",
              text: "Decline that target change proposal. Keep my current targets.",
            })
          }
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-100"
        >
          <X className="h-3.5 w-3.5" />
          Decline
        </button>
      </div>
    </div>
  );
}

function TargetColumn({ label, targets }: { label: string; targets: MacroTargets }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="font-black uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 font-black text-neutral-950">{targets.calories} kcal</p>
      <p className="mt-0.5 font-medium text-neutral-500">
        {targets.protein}p · {targets.carbs}c · {targets.fat}f
      </p>
    </div>
  );
}
