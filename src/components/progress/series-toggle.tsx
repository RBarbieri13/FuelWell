"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MACRO_META, type MacroKey } from "./macro-stacked-bars";

const SERIES_ORDER: MacroKey[] = ["calories", "protein", "carbs", "fat"];

/**
 * Series visibility chips. "On" and "off" must be readable at a glance and
 * without relying on colour alone, so the selected chip carries three
 * signals at once: a filled swatch with a check, a coloured 2px ring, and a
 * raised surface. Off chips sink into the inset well with a hollow swatch.
 */
export function SeriesToggle({
  active,
  onToggle,
}: {
  active: MacroKey[];
  onToggle: (key: MacroKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Chart series">
      {SERIES_ORDER.map((key) => {
        const meta = MACRO_META[key];
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
              "fw-press inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-black ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1 md:min-h-9",
              isOn
                ? cn("bg-surface shadow-e1 ring-2", meta.ringClass, meta.textClass)
                : "bg-surface-muted text-ink-subtle ring-1 ring-hairline-strong hover:bg-surface hover:text-ink-muted",
              isLast ? "cursor-not-allowed" : "cursor-pointer"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] ring-inset transition-colors duration-150",
                isOn
                  ? cn(meta.swatchClass, "ring-1 ring-black/10")
                  : cn("bg-transparent ring-2", meta.ringClass, "opacity-45")
              )}
            >
              {isOn ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} /> : null}
            </span>
            {meta.label}
            {isLast ? (
              <Lock className="h-3 w-3 shrink-0 opacity-60" strokeWidth={2.5} aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
