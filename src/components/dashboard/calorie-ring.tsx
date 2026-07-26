"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";

interface CalorieRingProps {
  consumed: number;
  target: number;
  emphasis?: "compact" | "normal" | "hero";
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * CSS handles the arc transitions, but the number count-up is driven from JS
 * and would otherwise ignore the user's motion preference entirely.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

export function CalorieRing({ consumed, target, emphasis = "normal" }: CalorieRingProps) {
  const safeTarget = target > 0 ? target : 1;
  const remaining = Math.max(0, target - consumed);
  const progress = Math.min(consumed / safeTarget, 1);
  const isOver = consumed > target;
  const overBy = Math.max(0, Math.round(consumed - target));
  // Overage is drawn as its own arc on top of the completed ring, capped at one
  // extra lap so a wildly over day still reads rather than wrapping forever.
  const overProgress = Math.min(Math.max(consumed - target, 0) / safeTarget, 1);
  const hasIntake = consumed > 0;

  const compact = emphasis === "compact";
  const hero = emphasis === "hero";
  const viewBox = compact ? 180 : hero ? 320 : 280;
  const center = viewBox / 2;
  const radius = compact ? 76 : hero ? 120 : 104;
  const strokeWidth = compact ? 15 : hero ? 24 : 20;
  const circumference = 2 * Math.PI * radius;

  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reducedMotion = usePrefersReducedMotion();

  // One animated value drives the arc sweep and the travelling end cap so they
  // can never drift apart mid-transition.
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(
      () => setAnimatedProgress(progress),
      reducedMotion ? 0 : 100
    );
    return () => clearTimeout(timer);
  }, [progress, reducedMotion]);

  // The overage arc lands after the base ring so the eye reads "filled, then
  // went past" rather than two arcs racing each other.
  const [animatedOverProgress, setAnimatedOverProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(
      () => setAnimatedOverProgress(overProgress),
      reducedMotion ? 0 : 320
    );
    return () => clearTimeout(timer);
  }, [overProgress, reducedMotion]);

  // Compact (dashboard plate) centers on what was eaten — the hero tiles own
  // the "remaining" number, so the ring stops repeating it. Larger variants
  // keep the remaining-focused readout.
  const primaryValue = compact ? consumed : isOver ? overBy : remaining;

  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const end = primaryValue;

    if (reducedMotion) {
      const immediate = setTimeout(() => setDisplayValue(end), 0);
      return () => clearTimeout(immediate);
    }

    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.max(0, Math.min(elapsed / duration, 1));
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayValue(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    // rAF can be throttled to a standstill (backgrounded tab, embedded webview);
    // pin the terminal value so the headline number is never left mid-count.
    const settle = setTimeout(() => setDisplayValue(end), duration + 150);
    return () => clearTimeout(settle);
  }, [primaryValue, reducedMotion]);

  // Uncapped so an over day reads as over instead of silently pinning at 100%.
  const percent = Math.round((consumed / safeTarget) * 100);
  const capMarkerRadius = Math.max(3, strokeWidth * 0.3);

  // Quarter ticks give the ring a scale — without them a partly filled arc has
  // no reference for "how far along is that, really".
  const tickPoints = [0.25, 0.5, 0.75].map((fraction) => {
    const angle = fraction * 2 * Math.PI;
    const inner = radius - strokeWidth / 2 + 1;
    const outer = radius + strokeWidth / 2 - 1;
    return {
      fraction,
      x1: center + inner * Math.cos(angle),
      y1: center + inner * Math.sin(angle),
      x2: center + outer * Math.cos(angle),
      y2: center + outer * Math.sin(angle),
    };
  });

  const arcTransition = reducedMotion
    ? undefined
    : "stroke-dashoffset 1000ms var(--ease-out-soft)";
  const capTransition = reducedMotion
    ? undefined
    : "transform 1000ms var(--ease-out-soft)";

  return (
    <div
      className="relative flex items-center justify-center"
      role="img"
      aria-label={
        hasIntake
          ? `${consumed.toLocaleString()} of ${target.toLocaleString()} calories consumed, ${percent}% of target, ${
              isOver
                ? `${overBy.toLocaleString()} over target`
                : `${remaining.toLocaleString()} remaining`
            }`
          : `No calories logged yet today. Target ${target.toLocaleString()} calories.`
      }
    >
      <svg
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        className={`-rotate-90 ${
          compact
            ? "h-[10.75rem] w-[10.75rem]"
            : hero
              ? "h-72 w-72 sm:h-[21rem] sm:w-[21rem]"
              : "h-[17.5rem] w-[17.5rem]"
        }`}
      >
        <defs>
          <linearGradient id={`${uid}-track`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-sunken)" />
            <stop offset="100%" stopColor="var(--color-surface-subtle)" />
          </linearGradient>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-400)" />
            <stop offset="55%" stopColor="var(--color-primary-500)" />
            <stop offset="100%" stopColor="var(--color-teal-600)" />
          </linearGradient>
          <linearGradient id={`${uid}-over`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent-300)" />
            <stop offset="100%" stopColor="var(--color-accent-500)" />
          </linearGradient>
          {/* Inset shadow on the track so the ring reads as a groove the fill
              sits inside, rather than two flat stacked strokes. */}
          <filter id={`${uid}-inset`} x="-25%" y="-25%" width="150%" height="150%">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="2.5" result="offsetBlur" />
            <feComposite operator="out" in="SourceGraphic" in2="offsetBlur" result="inverse" />
            <feFlood
              floodColor="#0b251f"
              style={{ floodColor: "var(--color-primary-950)" }}
              floodOpacity="0.2"
              result="shadowColor"
            />
            <feComposite operator="in" in="shadowColor" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${uid}-track)`}
          strokeWidth={strokeWidth}
          strokeDasharray={hasIntake ? undefined : `${strokeWidth * 0.5} ${strokeWidth * 0.75}`}
          filter={hasIntake ? `url(#${uid}-inset)` : undefined}
        />

        {/* Scale ticks sit above the track and below the fill so a completed
            ring is never chopped up by them. */}
        <g stroke="var(--color-hairline-strong)" strokeWidth={1.5} strokeLinecap="round">
          {tickPoints.map((tick) => (
            <line
              key={tick.fraction}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
            />
          ))}
        </g>

        {hasIntake && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${uid}-fill)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - animatedProgress)}
            style={{ transition: arcTransition }}
          />
        )}

        {isOver && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${uid}-over)`}
            strokeWidth={strokeWidth * 0.62}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - animatedOverProgress)}
            style={{ transition: arcTransition }}
          />
        )}

        {/* Travelling cap marker — rotated as a group so it stays glued to the
            leading edge of the arc for the whole sweep. */}
        {hasIntake && (
          <g
            style={{
              transform: `rotate(${(isOver ? animatedOverProgress : animatedProgress) * 360}deg)`,
              transformOrigin: `${center}px ${center}px`,
              transition: capTransition,
            }}
          >
            <circle
              cx={center + radius}
              cy={center}
              r={capMarkerRadius}
              fill="var(--color-surface)"
              stroke={isOver ? "var(--color-accent-500)" : "var(--color-primary-600)"}
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <span
          className={`${
            compact ? "text-[2.1rem]" : hero ? "text-7xl" : "text-6xl"
          } font-black leading-none tabular-nums ${
            hasIntake ? (isOver ? "text-accent-700" : "text-ink") : "text-ink-faint"
          }`}
        >
          {displayValue.toLocaleString()}
        </span>
        <span
          className={`${
            compact ? "mt-1.5 text-xs" : hero ? "mt-3 text-base" : "mt-2 text-sm"
          } font-black uppercase tracking-[0.14em] text-ink-muted`}
        >
          {compact ? "kcal eaten" : isOver ? "kcal over" : "kcal remaining"}
        </span>
        {!compact && (
          <span
            className={`mt-2 rounded-full px-2.5 py-1 text-xs font-black tabular-nums ring-1 ring-inset ${
              isOver
                ? "bg-accent-50 text-accent-700 ring-accent-200"
                : "bg-surface/85 text-ink-muted ring-hairline"
            }`}
          >
            {percent}% of target
          </span>
        )}
        <div
          className={`${
            compact
              ? "mt-1.5 bg-transparent px-0 py-0 ring-0"
              : hero
                ? "mt-4 px-5 py-2.5 ring-1 ring-inset"
                : "mt-3 px-4 py-2 ring-1 ring-inset"
          } max-w-full rounded-full ${
            compact ? "" : isOver ? "bg-accent-50 ring-accent-100" : "bg-primary-50 ring-primary-100"
          }`}
        >
          <span
            className={`${
              compact ? "text-xs" : hero ? "text-base" : "text-sm"
            } font-black tabular-nums ${
              !compact && isOver ? "text-accent-700" : "text-primary-700"
            }`}
          >
            {compact
              ? `of ${target.toLocaleString()} kcal target`
              : `${consumed.toLocaleString()} of ${target.toLocaleString()} kcal`}
          </span>
        </div>
        {compact && isOver && (
          <span className="mt-1.5 inline-flex items-center rounded-full bg-accent-50 px-2 py-0.5 text-[0.6875rem] font-black tabular-nums text-accent-700 ring-1 ring-inset ring-accent-200">
            {overBy.toLocaleString()} over
          </span>
        )}
      </div>
    </div>
  );
}
