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
  const radius = 104;
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

  const ringColor = isOver ? "#f0795b" : "#1eae84";

  return (
    <div className="relative flex items-center justify-center" role="img" aria-label={`${consumed} of ${target} calories consumed, ${remaining} remaining`}>
      <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke="#d6f0e8"
          strokeWidth="20"
        />
        <circle
          cx="140"
          cy="140"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black leading-none text-neutral-900 tabular-nums">
          {displayRemaining}
        </span>
        <span className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-neutral-500">
          {isOver ? "over" : "remaining"}
        </span>
        <div className="mt-3 rounded-full bg-primary-50 px-4 py-2 shadow-sm shadow-primary-900/5">
          <span className="text-sm font-black text-primary-700 tabular-nums">
            {consumed} / {target} kcal
          </span>
        </div>
      </div>
    </div>
  );
}
