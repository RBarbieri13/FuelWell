"use client";

import { useEffect, useState } from "react";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
  size?: "md" | "lg";
}

export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color,
  size = "md",
}: MacroBarProps) {
  const progress = Math.min((current / target) * 100, 100);
  const large = size === "lg";

  // Animate width on mount
  const [animatedWidth, setAnimatedWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={large ? "space-y-3" : "space-y-2"}>
      <div className="flex items-center justify-between">
        <div className={large ? "flex items-center gap-3" : "flex items-center gap-2"}>
          <div
            className={large ? "h-3 w-3 rounded-full" : "h-2 w-2 rounded-full"}
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className={large ? "text-lg font-black text-neutral-800" : "text-sm font-bold text-neutral-700"}>
            {label}
          </span>
        </div>
        <span className={large ? "text-base font-bold text-neutral-500 tabular-nums md:text-lg" : "text-sm font-semibold text-neutral-500 tabular-nums"}>
          <span className={large ? "text-2xl font-black text-neutral-900" : "font-black text-neutral-800"}>{current.toLocaleString()}</span> / {target.toLocaleString()}
          {unit.length > 1 ? ` ${unit}` : unit}
        </span>
      </div>
      <div
        className={large ? "h-4 overflow-hidden rounded-full bg-primary-100/70" : "h-2 overflow-hidden rounded-full bg-primary-100/70"}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label}: ${current} of ${target} ${unit}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${animatedWidth}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
