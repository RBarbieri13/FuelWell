"use client";

import { useEffect, useState } from "react";

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const remaining = Math.max(0, target - consumed);
  const progress = Math.min(consumed / target, 1);
  const isOver = consumed > target;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // Animate on mount
  const [animatedOffset, setAnimatedOffset] = useState(circumference);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOffset(circumference * (1 - progress));
    }, 100);
    return () => clearTimeout(timer);
  }, [circumference, progress]);

  // Animate number
  const [displayRemaining, setDisplayRemaining] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const end = remaining;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayRemaining(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [remaining]);

  const ringColor = isOver ? "#ef4444" : "#16a34a";

  return (
    <div className="relative flex items-center justify-center" role="img" aria-label={`${consumed} of ${target} calories consumed, ${remaining} remaining`}>
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#f5f5f5"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-neutral-900 tabular-nums">
          {displayRemaining}
        </span>
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider mt-0.5">
          {isOver ? "over" : "remaining"}
        </span>
        <div className="mt-2 px-3 py-1 bg-neutral-100 rounded-full">
          <span className="text-xs font-medium text-neutral-500 tabular-nums">
            {consumed} / {target} kcal
          </span>
        </div>
      </div>
    </div>
  );
}
