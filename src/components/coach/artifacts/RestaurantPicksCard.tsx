"use client";

import { useState } from "react";
import { Store, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { ArtifactCardProps } from "./contract";

type RestaurantPick = {
  foodId: string;
  name: string;
  macros: { calories: number; protein: number; carbs: number; fat: number };
  why: string;
  portion: string;
};

type RestaurantPicksArtifact = ArtifactSpec & {
  restaurant: string | null;
  picks: RestaurantPick[];
};

const SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
type Slot = (typeof SLOTS)[number];

/** Fixed metric cell — macros align column-wise across every pick. */
function MetricCell({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex min-w-0 items-baseline justify-between gap-1 rounded-lg bg-surface-muted px-1.5 py-1 ring-1 ring-inset ring-hairline">
      <span className="shrink-0 text-[0.625rem] font-black uppercase tracking-wide text-ink-subtle">
        {label}
      </span>
      <span
        className="min-w-0 truncate text-[0.6875rem] font-black tabular-nums"
        style={{ color: tone }}
      >
        {value}
      </span>
    </span>
  );
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function RestaurantPicksCard({ artifact, onAction }: ArtifactCardProps<RestaurantPicksArtifact>) {
  const [slot, setSlot] = useState<Slot>("dinner");
  const picks = artifact.picks ?? [];

  return (
    <Card padding="sm" className="min-w-0 max-w-full">
      <SectionHeader
        as="h3"
        icon={artifact.restaurant ? Store : UtensilsCrossed}
        eyebrow="Eating out"
        title={artifact.restaurant ? `Picks at ${artifact.restaurant}` : "Restaurant picks"}
      />

      {picks.length === 0 ? (
        <EmptyState
          size="inline"
          icon={Store}
          title="No picks found for this spot"
          description="Name a different restaurant and the coach will look again."
        />
      ) : (
        <>
          <div
            className="mt-3 flex flex-wrap gap-1.5"
            role="group"
            aria-label="Meal slot"
          >
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Use ${s} slot`}
                aria-pressed={slot === s}
                onClick={() => setSlot(s)}
                className={cn(
                  "fw-press min-h-11 rounded-full px-3.5 text-xs font-black capitalize focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9",
                  slot === s
                    ? "bg-primary-600 text-white shadow-e1 ring-1 ring-inset ring-primary-700"
                    : "bg-surface-muted text-ink-muted ring-1 ring-inset ring-hairline-strong hover:bg-primary-50 hover:text-primary-800"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <ul className="mt-3 space-y-2">
            {picks.map((pick) => (
              <li
                key={pick.foodId}
                className="rounded-2xl bg-surface-subtle p-3 ring-1 ring-inset ring-hairline"
              >
                <div className="fw-artifact-mobile-stack flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-ink">{pick.name}</p>
                    {pick.portion && (
                      <p className="mt-1">
                        <Badge variant="neutral" size="sm">
                          {pick.portion}
                        </Badge>
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    aria-label={`Log ${pick.name} as ${slot}`}
                    onClick={() =>
                      // Restaurant items live in the restaurant DB (per-serving
                      // published macros), not the per-100g food DB — log them
                      // as a custom meal with their exact macros.
                      onAction({
                        kind: "invoke_tool",
                        name: "log_custom_meal",
                        input: {
                          name: pick.name,
                          kcal: pick.macros.calories,
                          protein: pick.macros.protein,
                          carbs: pick.macros.carbs,
                          fat: pick.macros.fat,
                          meal_slot: slot,
                        },
                      })
                    }
                    className="shrink-0"
                  >
                    Log it
                  </Button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
                  <MetricCell
                    label="kcal"
                    value={`${Math.round(pick.macros.calories)}`}
                    tone="var(--color-macro-calories)"
                  />
                  <MetricCell
                    label="P"
                    value={`${round1(pick.macros.protein)}g`}
                    tone="var(--color-macro-protein)"
                  />
                  <MetricCell
                    label="C"
                    value={`${round1(pick.macros.carbs)}g`}
                    tone="var(--color-lemon-700)"
                  />
                  <MetricCell
                    label="F"
                    value={`${round1(pick.macros.fat)}g`}
                    tone="var(--color-accent-700)"
                  />
                </div>

                {pick.why && (
                  <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">{pick.why}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
