"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ProgressMeterProps {
  /** Consumed / completed amount in the same unit as `target`. */
  value: number;
  target: number;
  /** Track fill colour. Any CSS colour, usually a --color-macro-* token. */
  color: string;
  size?: "sm" | "md" | "lg";
  /** Accessible name. Required — the bar carries no visible label of its own. */
  label: string;
  /** Draws a marker where the day *should* be by now, for pacing. */
  pace?: number;
  className?: string;
}

const trackHeights = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

/**
 * Single horizontal meter. Unlike a plain clamped bar this keeps the overage
 * legible: once past target the fill switches to the coral role and a capped
 * segment is hatched, so "over" never looks the same as "exactly at target".
 */
export function ProgressMeter({
  value,
  target,
  color,
  size = "md",
  label,
  pace,
  className,
}: ProgressMeterProps) {
  const safeTarget = target > 0 ? target : 1;
  const ratio = value / safeTarget;
  const isOver = ratio > 1;
  const fillPercent = Math.min(ratio, 1) * 100;

  const [animatedWidth, setAnimatedWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(fillPercent), 80);
    return () => clearTimeout(timer);
  }, [fillPercent]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-primary-100/70",
        trackHeights[size],
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(target)}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out-soft"
        style={{
          width: `${animatedWidth}%`,
          backgroundColor: isOver ? "var(--color-accent-400)" : color,
          backgroundImage: isOver
            ? "repeating-linear-gradient(115deg, rgba(255,255,255,0.28) 0 6px, transparent 6px 12px)"
            : undefined,
        }}
      />
      {pace !== undefined && pace > 0 && pace < safeTarget && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 rounded-full bg-ink/25"
          style={{ left: `${Math.min((pace / safeTarget) * 100, 100)}%` }}
        />
      )}
    </div>
  );
}
