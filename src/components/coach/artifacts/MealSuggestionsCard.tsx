"use client";

import { Plus, Sparkles, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { ArtifactCardProps } from "./contract";

type Suggestion = {
  foodId: string;
  name: string;
  portion: number;
  slot: string;
  macros: { kcal: number; protein: number; carbs: number; fat: number };
  why: string;
};

type MealSuggestionsArtifact = {
  id: string;
  type: "meal_suggestions";
  suggestions: Suggestion[];
};

const grams = (n: number) => `${Math.round(n * 10) / 10}g`;

/**
 * Canonical macro palette, shared verbatim by every coach card that prints a
 * macro figure. Bright `--color-macro-*` tokens are reserved for fills; text
 * uses the darker step so each figure clears 4.5:1 on the surfaces it sits on.
 */
const MACRO_TEXT = {
  calories: "var(--color-primary-800)",
  protein: "var(--color-sky-700)",
  carbs: "var(--color-lemon-700)",
  fat: "var(--color-accent-700)",
} as const;

/**
 * Fixed four-cell metric strip so macros line up column-wise between rows.
 * The label shrinks, never the figure — clipped numbers are not acceptable.
 */
function MetricCell({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex min-h-6 min-w-0 items-baseline justify-between gap-1.5 rounded-lg bg-surface px-1.5 py-1 ring-1 ring-inset ring-hairline">
      <span className="min-w-0 truncate text-[0.625rem] font-black uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <span
        className="shrink-0 text-[0.6875rem] font-black tabular-nums"
        style={{ color: tone }}
      >
        {value}
      </span>
    </span>
  );
}

export function MealSuggestionsCard({
  artifact,
  onAction,
}: ArtifactCardProps<MealSuggestionsArtifact>) {
  const suggestions = artifact.suggestions ?? [];

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <SectionHeader
        as="h3"
        icon={Sparkles}
        eyebrow="Coach picks"
        title="Suggestions"
        description={
          suggestions.length > 0
            ? `${suggestions.length} option${suggestions.length === 1 ? "" : "s"} that fit what's left today`
            : undefined
        }
      />

      {suggestions.length === 0 ? (
        <EmptyState
          size="inline"
          icon={Utensils}
          title="Nothing to suggest"
          description="No foods fit the remaining budget."
        />
      ) : (
        <ul className="mt-3 space-y-2">
          {suggestions.map((s) => (
            <li
              key={s.foodId}
              className="rounded-2xl bg-surface-muted p-3 ring-1 ring-inset ring-hairline"
            >
              <div className="fw-artifact-mobile-stack flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">{s.name}</p>
                  <p className="mt-1">
                    <Badge variant="neutral" size="sm" className="capitalize">
                      {s.slot}
                    </Badge>
                  </p>
                </div>
                {/* Tonal, not primary: a list of N equally-weighted options has
                    no single primary action, and N glowing buttons flatten the
                    hierarchy of the whole transcript. */}
                <Button
                  type="button"
                  variant="tonal"
                  size="sm"
                  aria-label={`Log ${s.name} to ${s.slot}`}
                  onClick={() =>
                    onAction({
                      kind: "invoke_tool",
                      name: "log_meal",
                      input: {
                        food_id: s.foodId,
                        portion: s.portion,
                        meal_slot: s.slot,
                      },
                    })
                  }
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  Log it
                </Button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
                <MetricCell
                  label="kcal"
                  value={`${Math.round(s.macros.kcal)}`}
                  tone={MACRO_TEXT.calories}
                />
                <MetricCell
                  label="P"
                  value={grams(s.macros.protein)}
                  tone={MACRO_TEXT.protein}
                />
                <MetricCell
                  label="C"
                  value={grams(s.macros.carbs)}
                  tone={MACRO_TEXT.carbs}
                />
                <MetricCell
                  label="F"
                  value={grams(s.macros.fat)}
                  tone={MACRO_TEXT.fat}
                />
              </div>

              {s.why && (
                <p className="mt-2 rounded-xl bg-surface px-2.5 py-1.5 text-xs font-semibold leading-5 text-ink-muted ring-1 ring-inset ring-hairline">
                  {s.why}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
