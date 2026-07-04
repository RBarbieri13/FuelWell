"use client";

import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type InflowsOutflowsArtifact = ArtifactSpec & {
  window: string;
  inflowKcal: number;
  outflowKcal: number;
  net: number;
  assumptions?: string[];
};

const R = 26;
const CIRC = 2 * Math.PI * R;

/** 5-digit weekly totals overflow the 64-unit ring; compact them to e.g. "14.3k". */
function compactKcal(kcal: number): string {
  const rounded = Math.round(kcal);
  return rounded >= 10000 ? `${Math.round(rounded / 100) / 10}k` : `${rounded}`;
}

function Ring({ fraction, color, label, kcal }: { fraction: number; color: string; label: string; kcal: number }) {
  const clamped = Math.max(0, Math.min(1, fraction));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        viewBox="0 0 64 64"
        className="h-20 w-20"
        role="img"
        aria-label={`${label}: ${Math.round(kcal)} kcal`}
      >
        <circle cx="32" cy="32" r={R} fill="none" stroke="#f5f5f5" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${CIRC * clamped} ${CIRC}`}
          transform="rotate(-90 32 32)"
        />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          className="fill-neutral-900 text-[13px] font-black"
        >
          {compactKcal(kcal)}
        </text>
      </svg>
      <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">{label}</p>
    </div>
  );
}

export function InflowsOutflowsRing({ artifact }: ArtifactCardProps<InflowsOutflowsArtifact>) {
  const inflow = artifact.inflowKcal ?? 0;
  const outflow = artifact.outflowKcal ?? 0;
  const net = artifact.net ?? inflow - outflow;
  const assumptions = artifact.assumptions ?? [];
  const max = Math.max(inflow, outflow, 1);

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-black text-neutral-900">Energy balance</p>
        <span className="text-xs font-bold text-neutral-400">
          {artifact.window === "7d" ? "last 7 days" : "today"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-6">
        <Ring fraction={inflow / max} color="#1eae84" label="In" kcal={inflow} />
        <Ring fraction={outflow / max} color="#f97316" label="Out" kcal={outflow} />
      </div>

      <p className="mt-3 text-center text-sm font-bold text-neutral-700">
        Net {net > 0 ? "+" : ""}
        {Math.round(net)} kcal
        <span className="ml-1 font-medium text-neutral-400">
          ({net > 0 ? "surplus" : net < 0 ? "deficit" : "even"})
        </span>
      </p>

      {assumptions.length > 0 && (
        <details className="mt-3 border-t border-neutral-100 pt-2">
          <summary className="cursor-pointer truncate text-xs font-bold text-neutral-400">
            Estimate assumptions ({assumptions.length})
          </summary>
          <ul className="mt-1.5 space-y-1">
            {assumptions.map((a, i) => (
              <li key={i} className="text-xs font-medium text-neutral-500">
                {a}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
