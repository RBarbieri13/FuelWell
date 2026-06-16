"use client";

import { useEffect, useState } from "react";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}

export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color,
}: MacroBarProps) {
  const progress = Math.min((current / target) * 100, 100);

  // Animate width on mount
  const [animatedWidth, setAnimatedWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-neutral-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-neutral-500 tabular-nums">
          <span className="text-neutral-800 font-black">{current}</span> / {target}
          {unit}
        </span>
      </div>
      <div
        className="h-2 bg-primary-100/70 rounded-full overflow-hidden"
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
