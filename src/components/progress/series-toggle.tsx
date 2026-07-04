"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MACRO_META, type MacroKey } from "./macro-stacked-bars";

const SERIES_ORDER: MacroKey[] = ["calories", "protein", "carbs", "fat"];

export function SeriesToggle({
  active,
  onToggle,
}: {
  active: MacroKey[];
  onToggle: (key: MacroKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SERIES_ORDER.map((key) => {
        const isOn = active.includes(key);
        const isLast = isOn && active.length === 1;

        return (
          <button
            key={key}
            type="button"
            aria-pressed={isOn}
            disabled={isLast}
            onClick={() => onToggle(key)}
            title={isLast ? "Keep at least one series visible" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black transition-colors",
              isOn
                ? "border-primary-100 bg-white text-[#516b63] shadow-sm"
                : "border-primary-100 bg-primary-50/50 text-[#91a7a0]",
              isLast ? "cursor-not-allowed opacity-80" : "cursor-pointer"
            )}
          >
            <span
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-[4px]",
                isOn ? MACRO_META[key].swatchClass : "bg-[#b8cac4]"
              )}
            >
              {isOn ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /> : null}
            </span>
            {MACRO_META[key].label}
          </button>
        );
      })}
    </div>
  );
}
