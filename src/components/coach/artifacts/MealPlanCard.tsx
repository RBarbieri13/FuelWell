"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactCardProps } from "./contract";

type PlanMeal = {
  slot: string;
  recipeId: string;
  title: string;
  perServing: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
};

type PlanDay = {
  day: number;
  meals: PlanMeal[];
  dayTotals: { calories: number; protein: number; carbs: number; fat: number };
};

type MealPlanArtifact = {
  id: string;
  type: "meal_plan";
  days: PlanDay[];
  summary: string;
};

export function MealPlanCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealPlanArtifact>) {
  const days = artifact.days ?? [];

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <SectionHeader
        as="h3"
        icon={CalendarDays}
        title="Meal plan"
        description={artifact.summary || undefined}
        action={
          days.length > 0 ? (
            <Badge variant="default" size="sm" className="tabular-nums">
              {days.length} day{days.length === 1 ? "" : "s"}
            </Badge>
          ) : undefined
        }
      />

      {days.length === 0 ? (
        <EmptyState
          size="inline"
          icon={CalendarDays}
          title="Nothing planned"
          description="No plan days to show."
        />
      ) : (
        <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-0.5">
          {days.map((day) => (
            <section
              key={day.day}
              className="rounded-2xl bg-surface-subtle p-3 ring-1 ring-inset ring-hairline"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-700">
                  Day {day.day}
                </h4>
                <p className="flex shrink-0 items-baseline gap-2 text-[0.6875rem] font-black tabular-nums text-ink-muted">
                  <span>{Math.round(day.dayTotals.calories)} kcal</span>
                  <span aria-hidden="true" className="text-ink-faint">
                    ·
                  </span>
                  <span>{Math.round(day.dayTotals.protein * 10) / 10}g protein</span>
                </p>
              </div>

              <ul className="mt-2 space-y-0.5">
                {day.meals.map((meal) => (
                  <li key={`${day.day}-${meal.slot}`}>
                    <button
                      type="button"
                      aria-label={`View recipe for day ${day.day} ${meal.slot}: ${meal.title}`}
                      onClick={() =>
                        onAction({
                          kind: "invoke_tool",
                          name: "get_recipe_detail",
                          input: { recipe_id: meal.recipeId },
                        })
                      }
                      className="fw-press group grid min-h-11 w-full grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto]"
                    >
                      <span className="truncate text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-subtle">
                        {meal.slot}
                      </span>
                      <span className="truncate text-sm font-bold text-ink group-hover:text-primary-800">
                        {meal.title}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[0.6875rem] font-black tabular-nums text-ink-muted ring-1 ring-inset ring-hairline">
                          {Math.round(meal.perServing.calories)}
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          strokeWidth={2}
                          className="h-4 w-4 text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {days.length > 0 && (
        <p className="mt-2 text-[0.6875rem] font-bold text-ink-subtle">
          Calories shown per serving.
        </p>
      )}
    </Card>
  );
}
