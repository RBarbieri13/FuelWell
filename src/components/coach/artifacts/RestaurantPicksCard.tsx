"use client";

import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
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

/** log_meal takes portion in grams; the pick's portion label embeds it, e.g. "Full portion (300 g)". */
function portionGrams(portion: string): number {
  const match = portion.match(/(\d+)\s*g/);
  return match ? Number(match[1]) : 300;
}

export function RestaurantPicksCard({ artifact, onAction }: ArtifactCardProps<RestaurantPicksArtifact>) {
  const [slot, setSlot] = useState<Slot>("dinner");
  const picks = artifact.picks ?? [];

  return (
    <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <UtensilsCrossed className="h-4 w-4" />
        </span>
        <p className="min-w-0 truncate text-sm font-black text-neutral-900">
          {artifact.restaurant ? `Picks at ${artifact.restaurant}` : "Restaurant picks"}
        </p>
      </div>

      {picks.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-neutral-500">
          No picks found for this spot
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Meal slot">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={`Use ${s} slot`}
                aria-pressed={slot === s}
                onClick={() => setSlot(s)}
                className={
                  slot === s
                    ? "rounded-full bg-neutral-900 px-3 py-2 text-xs font-black capitalize text-white"
                    : "rounded-full border border-neutral-200 px-3 py-2 text-xs font-bold capitalize text-neutral-500 transition hover:border-neutral-300"
                }
              >
                {s}
              </button>
            ))}
          </div>

          <ul className="mt-2">
            {picks.map((pick, i) => (
              <li
                key={pick.foodId}
                className={i > 0 ? "border-t border-neutral-100 py-3" : "py-3"}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-neutral-900">{pick.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-neutral-500">
                      {Math.round(pick.macros.calories)} kcal ·{" "}
                      {Math.round(pick.macros.protein * 10) / 10}g P ·{" "}
                      {Math.round(pick.macros.carbs * 10) / 10}g C ·{" "}
                      {Math.round(pick.macros.fat * 10) / 10}g F
                    </p>
                    <p className="mt-1 text-xs font-medium text-neutral-500">{pick.why}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Log ${pick.name} as ${slot}`}
                    onClick={() =>
                      onAction({
                        kind: "invoke_tool",
                        name: "log_meal",
                        input: {
                          food_id: pick.foodId,
                          portion: portionGrams(pick.portion),
                          meal_slot: slot,
                        },
                      })
                    }
                    className="min-h-10 shrink-0 rounded-full bg-primary-50 px-4 py-2.5 text-xs font-black text-primary-700 transition hover:bg-primary-100"
                  >
                    Log it
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
