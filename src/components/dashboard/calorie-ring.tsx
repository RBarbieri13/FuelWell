"use client";

import { useEffect, useState } from "react";

interface CalorieRingProps {
  consumed: number;
  target: number;
  emphasis?: "compact" | "normal" | "hero";
}

export function CalorieRing({ consumed, target, emphasis = "normal" }: CalorieRingProps) {
  const remaining = Math.max(0, target - consumed);
  const progress = Math.min(consumed / target, 1);
  const isOver = consumed > target;
  const compact = emphasis === "compact";
  const hero = emphasis === "hero";
  const viewBox = compact ? 180 : hero ? 320 : 280;
  const center = viewBox / 2;
  const radius = compact ? 76 : hero ? 120 : 104;
  const strokeWidth = compact ? 15 : hero ? 24 : 20;
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
  const percent = Math.round(progress * 100);

  return (
    <div className="relative flex items-center justify-center" role="img" aria-label={`${consumed.toLocaleString()} of ${target.toLocaleString()} calories consumed, ${remaining.toLocaleString()} remaining`}>
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
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#d6f0e8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${compact ? "text-[2.1rem]" : hero ? "text-7xl" : "text-6xl"} font-black leading-none text-neutral-900 tabular-nums`}>
          {displayRemaining.toLocaleString()}
        </span>
        <span className={`${compact ? "mt-1.5 text-[10.5px]" : hero ? "mt-3 text-base" : "mt-2 text-sm"} font-black uppercase tracking-[0.14em] text-neutral-500`}>
          {isOver ? "over" : "remaining"}
        </span>
        <span className={`${compact ? "mt-1 text-[10px]" : "mt-2 text-xs"} rounded-full bg-white/85 px-2.5 py-1 font-black text-neutral-500 shadow-sm shadow-primary-900/5`}>
          {percent}% of target
        </span>
        <div className={`${compact ? "mt-1.5 bg-transparent px-0 py-0 shadow-none" : hero ? "mt-4 px-5 py-2.5" : "mt-3 px-4 py-2"} rounded-full bg-primary-50 shadow-sm shadow-primary-900/5`}>
          <span className={`${compact ? "text-xs text-[#7c968f]" : hero ? "text-base" : "text-sm"} font-black text-primary-700 tabular-nums`}>
            {consumed.toLocaleString()} / {target.toLocaleString()} kcal
          </span>
        </div>
      </div>
    </div>
  );
}
