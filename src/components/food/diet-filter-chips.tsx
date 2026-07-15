"use client";

import { cn } from "@/lib/utils/cn";
import { DIET_FILTERS, type DietFilter } from "@/lib/use-preferences";

/**
 * Row of diet filter chips (high-protein / low-carb / low-fat / vegan).
 * Controlled: parent owns the active set and toggles. Pairs with
 * filterFoods() from the food database and the recipe filter.
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
              "min-h-11 md:min-h-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition",
              isOn
                ? "bg-primary-600 text-white shadow-sm shadow-primary-600/25"
                : "bg-primary-50 text-primary-800 hover:bg-primary-100"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
