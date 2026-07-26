"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type InflowsOutflowsArtifact = ArtifactSpec & {
  window: string;
  inflowKcal: number;
  outflowKcal: number;
  net: number;
  assumptions?: string[];
};

const R = 30;
const CIRC = 2 * Math.PI * R;

/** Deterministic grouping — `toLocaleString` can disagree between SSR and client. */
function withThousands(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** 5-digit weekly totals overflow the ring; compact them to e.g. "14.3k". */
function compactKcal(kcal: number): string {
  const rounded = Math.round(kcal);
  return rounded >= 10000 ? `${Math.round(rounded / 100) / 10}k` : withThousands(rounded);
}

function Ring({
  fraction,
  color,
  label,
  kcal,
  scaleKcal,
}: {
  fraction: number;
  color: string;
  label: string;
  kcal: number;
  scaleKcal: number;
}) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const share = Math.round(clamped * 100);

  // Arcs sweep in from zero on mount; the global reduced-motion rule collapses
  // the transition to an instant set.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <svg
        viewBox="0 0 80 80"
        className="h-20 w-20 shrink-0"
        role="img"
        aria-label={`${label}: ${Math.round(kcal)} kcal, ${share}% of the ${Math.round(scaleKcal)} kcal ring scale`}
      >
        {/* Hairline rails give the arc a hard start and end edge instead of
            letting it dissolve into the track. */}
        <circle cx="40" cy="40" r={R + 5} fill="none" stroke="var(--color-hairline)" strokeWidth="1" />
        <circle cx="40" cy="40" r={R - 5} fill="none" stroke="var(--color-hairline)" strokeWidth="1" />
        <circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke="var(--color-surface-sunken)"
          strokeWidth="9"
        />
        {/* Quarter ticks: without them a 40% arc and a 60% arc look alike. */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="40"
            y1={40 - (R + 4.5)}
            x2="40"
            y2={40 - (R - 4.5)}
            stroke="var(--color-hairline-strong)"
            strokeWidth="1"
            transform={`rotate(${deg} 40 40)`}
          />
        ))}
        <circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${CIRC * (drawn ? clamped : 0)} ${CIRC}`}
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dasharray 800ms var(--ease-out-soft)" }}
        />
        <text
          x="40"
          y="41"
          textAnchor="middle"
          className="fill-ink text-[16px] font-black tabular-nums"
        >
          {compactKcal(kcal)}
        </text>
        <text
          x="40"
          y="52"
          textAnchor="middle"
          className="fill-ink-muted text-[8px] font-black uppercase tracking-[0.14em]"
        >
          kcal
        </text>
      </svg>
      <p className="flex items-center gap-1.5 text-[0.625rem] font-black uppercase tracking-[0.12em] text-ink-muted">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full ring-1 ring-inset ring-black/5"
          style={{ backgroundColor: color }}
        />
        {label}
      </p>
      <p className="text-[0.625rem] font-bold tabular-nums text-ink-muted">{`${share}% of scale`}</p>
    </div>
  );
}

export function InflowsOutflowsRing({ artifact }: ArtifactCardProps<InflowsOutflowsArtifact>) {
  const inflow = artifact.inflowKcal ?? 0;
  const outflow = artifact.outflowKcal ?? 0;
  const net = artifact.net ?? inflow - outflow;
  const assumptions = artifact.assumptions ?? [];
  const max = Math.max(inflow, outflow, 1);

  const windowLabel = artifact.window === "7d" ? "last 7 days" : "today";
  const hasData = inflow > 0 || outflow > 0;
  const netState = net > 0 ? "surplus" : net < 0 ? "deficit" : "even";
  const netColor = net > 0 ? "var(--color-accent-500)" : "var(--color-primary-500)";
  // The bar can carry the mid-tone fill; the readout needs the darker step to
  // clear 4.5:1 on the muted plate.
  const netTextClass =
    net > 0 ? "text-accent-700" : net < 0 ? "text-primary-700" : "text-ink";
  // Half-width bar: zero sits at the centre, so surplus and deficit read as
  // opposite directions rather than as the same clamped fill.
  const netWidth = Math.min(Math.abs(net) / max, 1) * 50;

  return (
    <Card padding="sm" className="mt-3">
      <SectionHeader
        as="h3"
        icon={Flame}
        title="Energy balance"
        action={
          <Badge variant="neutral" size="sm">
            {windowLabel}
          </Badge>
        }
      />

      {!hasData ? (
        <EmptyState
          size="inline"
          icon={Flame}
          title="No energy data yet"
          description="Log a meal or a workout and the in-versus-out split appears here."
        />
      ) : (
        <>
          {/* Sunken well: the rings sit one layer below the card face, so the
              card keeps the only drop shadow in this stack. */}
          <div className="mt-4 rounded-[1.15rem] bg-surface-subtle p-3 ring-1 ring-inset ring-hairline">
            <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-4">
              <Ring
                fraction={inflow / max}
                color="var(--color-primary-500)"
                label="In"
                kcal={inflow}
                scaleKcal={max}
              />
              {/* Hairline divider keeps the two readouts from reading as one
                  cluster on wide cards; it collapses away when they wrap. */}
              <span
                aria-hidden="true"
                className="hidden w-px self-stretch bg-hairline-strong min-[380px]:block"
              />
              <Ring
                fraction={outflow / max}
                color="var(--color-accent-500)"
                label="Out"
                kcal={outflow}
                scaleKcal={max}
              />
            </div>

            <p className="mt-3 border-t border-hairline pt-2 text-center text-[0.625rem] font-bold uppercase tracking-[0.12em] tabular-nums text-ink-muted">
              {`Rings scaled to ${withThousands(max)} kcal`}
            </p>
          </div>

          <div className="mt-3 rounded-[1.15rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="flex items-baseline gap-1.5">
                <span className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-muted">
                  Net
                </span>
                <span className={`text-lg font-black tabular-nums ${netTextClass}`}>
                  {`${net > 0 ? "+" : ""}${withThousands(net)} kcal`}
                </span>
              </p>
              <Badge
                variant={net > 0 ? "warning" : net < 0 ? "success" : "neutral"}
                size="sm"
                className={
                  net > 0 ? "bg-accent-50 text-accent-700 ring-accent-200" : undefined
                }
              >
                {netState}
              </Badge>
            </div>

            <div
              className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-hairline-strong"
              role="img"
              aria-label={`Net ${Math.round(net)} kcal ${netState}, on a scale of plus or minus ${Math.round(max)} kcal`}
            >
              {/* Quarter gridlines so a short bar can be read as a magnitude,
                  not just as "some". */}
              {[25, 75].map((pct) => (
                <span
                  key={pct}
                  aria-hidden="true"
                  className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-ink/10"
                  style={{ left: `${pct}%` }}
                />
              ))}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink/30"
              />
              <span
                aria-hidden="true"
                className="absolute inset-y-0 rounded-full transition-[width,left] duration-700 ease-out-soft"
                style={{
                  left: net > 0 ? "50%" : `${50 - netWidth}%`,
                  width: `${netWidth}%`,
                  backgroundColor: netColor,
                }}
              />
            </div>

            <div className="mt-1.5 flex items-baseline justify-between gap-2 text-[0.625rem] font-bold uppercase tracking-[0.1em] tabular-nums text-ink-muted">
              <span className="min-w-0 truncate">{`Deficit -${withThousands(max)}`}</span>
              <span aria-hidden="true">0</span>
              <span className="min-w-0 truncate text-right">{`+${withThousands(max)} surplus`}</span>
            </div>
          </div>
        </>
      )}

      {assumptions.length > 0 && (
        <details className="group mt-3 border-t border-hairline pt-1">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-1 text-xs font-bold text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 truncate">{`Estimate assumptions (${assumptions.length})`}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out-soft group-open:rotate-180"
            />
          </summary>
          <ul className="mt-1 space-y-1.5 rounded-[1.15rem] bg-surface-muted p-3">
            {assumptions.map((a, i) => (
              <li key={i} className="flex gap-2 text-xs font-semibold leading-5 text-ink-muted">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-subtle"
                />
                <span className="min-w-0">{a}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
