"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DIET_FILTERS, type DietFilter } from "@/lib/use-preferences";

/**
 * Row of diet filter chips (high-protein / low-carb / low-fat / vegan).
 * Controlled: parent owns the active set and toggles. Pairs with
 * filterFoods() from the food database and the recipe filter.
 *
 * Selected chips are filled *and* ringed *and* carry a check glyph — a tint
 * shift alone is too easy to miss when several chips sit side by side. The
 * unselected chip is deliberately neutral rather than brand-tinted so "on"
 * cannot be confused with "off" at a glance, and so this row and the
 * preference row it sits above read as one control group.
 */
export function DietFilterChips({
  active,
  onToggle,
  className,
}: {
  active: DietFilter[];
  onToggle: (id: DietFilter) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {DIET_FILTERS.map((filter) => {
        const isOn = active.includes(filter.id);
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(filter.id)}
            title={
              isOn
                ? `${filter.label} filter on — tap to remove`
                : `Filter results to ${filter.label.toLowerCase()} foods`
            }
            className={cn(
              "fw-press inline-flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9",
              isOn
                ? "gap-1.5 bg-primary-700 text-white shadow-e1 ring-primary-800"
                : "gap-0 bg-surface-muted text-ink-muted ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-100 active:bg-primary-100"
            )}
          >
            <Check
              aria-hidden="true"
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-all duration-200 ease-out-soft",
                // Collapsing the glyph rather than unmounting it keeps the chip
                // row from reflowing every time a filter is toggled.
                isOn ? "w-3.5 opacity-100" : "w-0 opacity-0"
              )}
              strokeWidth={3}
            />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
