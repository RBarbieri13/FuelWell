"use client";

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const remaining = Math.max(0, target - consumed);
  const progress = Math.min(consumed / target, 1);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="12"
        />
        {/* Progress ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={progress >= 1 ? "#ef4444" : "#22c55e"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-neutral-900">{remaining}</span>
        <span className="text-sm text-neutral-500">remaining</span>
        <span className="text-xs text-neutral-400 mt-1">
          {consumed} / {target} kcal
        </span>
      </div>
    </div>
  );
}
