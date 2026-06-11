"use client";

/**
 * LogConfirmChip — the tap-to-confirm card the coach renders after parsing a
 * "log ..." message. Meals confirm into useDayLog; workouts acknowledge in
 * session only (no workout store exists yet).
 */

import { Check, Dumbbell, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { LogIntent } from "./coach-logging";

type LogConfirmChipProps = {
  intent: LogIntent;
  status: "pending" | "confirmed" | "dismissed";
  onConfirm: () => void;
  onDismiss: () => void;
};

export function LogConfirmChip({
  intent,
  status,
  onConfirm,
  onDismiss,
}: LogConfirmChipProps) {
  return (
    <div
      className={cn(
        "mt-3 rounded-2xl border p-3",
        status === "confirmed"
          ? "border-primary-200 bg-primary-50/70"
          : status === "dismissed"
            ? "border-neutral-200 bg-neutral-50 opacity-70"
            : "border-neutral-200 bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          {intent.kind === "meal" ? (
            <UtensilsCrossed className="h-4 w-4" />
          ) : (
            <Dumbbell className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {intent.kind === "meal" ? (
            <>
              <p className="text-xs font-black uppercase tracking-wide text-neutral-400">
                Confirm {intent.mealType}
              </p>
              <ul className="mt-1 space-y-1">
                {intent.foods.map((f) => (
                  <li
                    key={f.food.id}
                    className="flex items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="truncate font-bold text-neutral-900">
                      {f.quantity !== 1 ? `${f.quantity}x ` : ""}
                      {f.food.name}
                      <span className="ml-1 font-medium text-neutral-400">
                        {f.amount}
                        {f.food.servingUnit}
                      </span>
                    </span>
                    <span className="shrink-0 font-bold text-neutral-600">
                      {f.macros.kcal} kcal
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs font-bold text-neutral-500">
                {totalMacro(intent.foods, "kcal")} kcal ·{" "}
                {totalMacro(intent.foods, "protein")}g protein ·{" "}
                {totalMacro(intent.foods, "carbs")}g carbs ·{" "}
                {totalMacro(intent.foods, "fat")}g fat
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-black uppercase tracking-wide text-neutral-400">
                Confirm workout
              </p>
              <p className="mt-1 text-sm font-bold text-neutral-900">
                {intent.label}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                Logged for this session — a saved workout history is coming
                soon.
              </p>
            </>
          )}

          {status === "pending" ? (
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={onConfirm}>
                <Check className="mr-1 h-3.5 w-3.5" />
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="mr-1 h-3.5 w-3.5" />
                Not now
              </Button>
            </div>
          ) : (
            <p
              className={cn(
                "mt-2 text-xs font-black",
                status === "confirmed" ? "text-primary-700" : "text-neutral-400",
              )}
            >
              {status === "confirmed" ? "Added" : "Dismissed"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function totalMacro(
  foods: Extract<LogIntent, { kind: "meal" }>["foods"],
  key: "kcal" | "protein" | "carbs" | "fat",
): number {
  return foods.reduce((sum, f) => sum + f.macros[key], 0);
}
