"use client";

import { ProgressMeter } from "@/components/ui/progress-meter";

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
  const large = size === "lg";
  const safeTarget = target > 0 ? target : 1;
  const percent = Math.round((current / safeTarget) * 100);
  const isOver = current > target;
  const left = Math.max(0, Math.round(target - current));
  const unitSuffix = unit === "g" ? "g" : ` ${unit}`;

  return (
    <div className={large ? "space-y-2.5" : "space-y-1.5"}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className={large ? "flex items-center gap-3" : "flex items-center gap-2"}>
          <span
            className={`${large ? "h-3 w-3" : "h-2.5 w-2.5"} shrink-0 rounded-full ring-1 ring-inset ring-black/10`}
            style={{ backgroundColor: isOver ? "var(--color-accent-400)" : color }}
            aria-hidden="true"
          />
          <span
            className={
              large
                ? "text-lg font-black text-ink"
                : "text-sm font-bold text-ink"
            }
          >
            {label}
          </span>
        </div>
        <span
          className={`tabular-nums ${
            large ? "text-base font-bold text-ink-muted md:text-lg" : "text-sm font-semibold text-ink-muted"
          }`}
        >
          <span
            className={`${large ? "text-2xl font-black" : "font-black"} ${
              isOver ? "text-accent-700" : "text-ink"
            }`}
          >
            {current.toLocaleString()}
          </span>{" "}
          / {target.toLocaleString()}
          {unitSuffix}
        </span>
      </div>

      <ProgressMeter
        value={current}
        target={target}
        color={color}
        size={large ? "lg" : "md"}
        label={`${label}: ${current} of ${target} ${unit}`}
      />

      {/* Endpoint scale. A bare bar tells you nothing about how far along the
          day is; the percentage and the remainder do. */}
      <div className="flex items-center justify-between gap-2 text-[0.6875rem] font-bold tabular-nums">
        <span className={isOver ? "text-accent-700" : "text-ink-subtle"}>
          {percent}%
        </span>
        <span className="min-w-0 truncate text-ink-subtle">
          {isOver
            ? `${Math.round(current - target).toLocaleString()}${unitSuffix} over`
            : `${left.toLocaleString()}${unitSuffix} left`}
        </span>
      </div>
    </div>
  );
}
