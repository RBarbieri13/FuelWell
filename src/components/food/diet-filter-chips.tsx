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
 * shift alone is too easy to miss when several chips sit side by side.
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
            className={cn(
              "fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9",
              isOn
                ? "bg-primary-600 text-white shadow-e1 ring-primary-700"
                : "bg-primary-50 text-primary-800 ring-primary-100 hover:bg-primary-100 hover:ring-primary-200 active:bg-primary-200"
            )}
          >
            {isOn && (
              <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
