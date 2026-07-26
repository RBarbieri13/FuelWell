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

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Canonical macro palette, shared verbatim by every coach card that shows a
 * macro. These bright `--color-macro-*` tokens are the chart tone — used here
 * only as bar fill and legend dot, never as text, so the darker text step the
 * other cards use for figures is not needed on this card.
 */
const MACRO_KEYS = [
  { key: "protein", label: "Protein", tone: "var(--color-macro-protein)" },
  { key: "carbs", label: "Carbs", tone: "var(--color-macro-carbs)" },
  { key: "fat", label: "Fat", tone: "var(--color-macro-fat)" },
] as const;

/**
 * Composition bar for a single day. It re-renders the protein/carbs/fat grams
 * already present in `dayTotals` as a share-of-weight strip — no new figure is
 * introduced, and when the day has no macro weight the bar is omitted rather
 * than drawn as an empty axis.
 */
function DayMacroBar({ totals }: { totals: PlanDay["dayTotals"] }) {
  const gramTotal = totals.protein + totals.carbs + totals.fat;
  if (!(gramTotal > 0)) return null;

  const segments = MACRO_KEYS.map((macro) => ({
    ...macro,
    grams: totals[macro.key],
    pct: (totals[macro.key] / gramTotal) * 100,
  })).filter((segment) => segment.pct > 0);

  return (
    <div
      role="img"
      aria-label={segments
        .map((s) => `${round1(s.grams)}g ${s.label.toLowerCase()}`)
        .join(", ")}
      className="mt-2 flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-surface-sunken"
    >
      {segments.map((segment) => (
        <span
          key={segment.key}
          className="h-full first:rounded-l-full last:rounded-r-full"
          style={{ width: `${segment.pct}%`, backgroundColor: segment.tone }}
        />
      ))}
    </div>
  );
}

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
        <div className="mt-3 max-h-96 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
          {days.map((day) => (
            <section
              key={day.day}
              className="rounded-2xl bg-surface-muted p-3 ring-1 ring-inset ring-hairline"
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
                  <span>{round1(day.dayTotals.protein)}g protein</span>
                </p>
              </div>

              <DayMacroBar totals={day.dayTotals} />

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
                      className="fw-press group grid min-h-11 w-full grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-2 text-left ring-1 ring-inset ring-transparent hover:bg-primary-50/70 hover:ring-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto]"
                    >
                      <span className="truncate text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-muted">
                        {meal.slot}
                      </span>
                      <span className="truncate text-sm font-bold text-ink group-hover:text-primary-800">
                        {meal.title}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {/* Units live on the figure, not only in the footnote —
                            a bare number in a chip has no scale. */}
                        <span className="rounded-full bg-surface px-2 py-0.5 text-[0.6875rem] font-black tabular-nums text-ink-muted ring-1 ring-inset ring-hairline">
                          {Math.round(meal.perServing.calories)}
                          <span className="ml-0.5 font-bold text-ink-muted">kcal</span>
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
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-hairline pt-2.5">
          <ul
            aria-label="Day total macro legend"
            className="flex flex-wrap items-center gap-x-2.5 gap-y-1"
          >
            {MACRO_KEYS.map((macro) => (
              <li
                key={macro.key}
                className="flex items-center gap-1.5 text-[0.625rem] font-black uppercase tracking-wide text-ink-muted"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: macro.tone }}
                />
                {macro.label}
              </li>
            ))}
          </ul>
          {/* Two scales live on this card: the day header and the composition
              bar are daily totals, the per-meal chip is one serving. The
              caption has to name both or it mislabels one of them. */}
          <p className="text-[0.6875rem] font-bold text-ink-muted">
            Day rows and bars are daily totals; meal chips are per serving.
          </p>
        </div>
      )}
    </Card>
  );
}
