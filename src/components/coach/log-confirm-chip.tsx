"use client";

/**
 * LogConfirmChip — the tap-to-confirm card the coach renders after parsing a
 * "log ..." message. Meals confirm into useDayLog; workouts acknowledge in
 * session only (no workout store exists yet).
 */

import { Check, Dumbbell, UtensilsCrossed, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { LogIntent } from "./coach-logging";

type LogConfirmChipProps = {
  intent: LogIntent;
  status: "pending" | "confirmed" | "dismissed";
  onConfirm: () => void;
  onDismiss: () => void;
};

const MACRO_ROWS = [
  { key: "protein", label: "Protein" },
  { key: "carbs", label: "Carbs" },
  { key: "fat", label: "Fat" },
] as const;

export function LogConfirmChip({
  intent,
  status,
  onConfirm,
  onDismiss,
}: LogConfirmChipProps) {
  const isMeal = intent.kind === "meal";
  const Icon = isMeal ? UtensilsCrossed : Dumbbell;

  return (
    <div
      className={cn(
        // Nested inside a message bubble, so this stays a ringed plate rather
        // than stacking a second drop shadow on the bubble's elevation.
        "mt-3 rounded-[1.25rem] p-3 ring-1 ring-inset transition-colors duration-200 ease-out-soft",
        status === "confirmed"
          ? "bg-primary-50/70 ring-primary-200"
          : status === "dismissed"
            ? "bg-surface-muted opacity-70 ring-hairline"
            : "bg-surface ring-hairline-strong"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] ring-1 ring-inset",
            status === "confirmed"
              ? "bg-primary-100 text-primary-700 ring-primary-200"
              : "bg-primary-50 text-primary-700 ring-primary-100"
          )}
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          {intent.kind === "meal" ? (
            <>
              <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
                Confirm {intent.mealType}
              </p>
              <ul className="mt-1.5 space-y-1">
                {intent.foods.map((f) => (
                  <li
                    key={f.food.id}
                    className="flex items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="min-w-0 truncate font-bold text-ink">
                      {f.quantity !== 1 ? (
                        <span className="tabular-nums">{f.quantity}x </span>
                      ) : (
                        ""
                      )}
                      {f.food.name}
                      <span className="ml-1 font-semibold tabular-nums text-ink-faint">
                        {f.amount}
                        {f.food.servingUnit}
                      </span>
                    </span>
                    <span className="shrink-0 font-black tabular-nums text-ink-muted">
                      {f.macros.kcal} kcal
                    </span>
                  </li>
                ))}
              </ul>
              {/* Totals get their own sunken well and aligned columns so the
                  numbers being confirmed are scannable, not a run-on line. */}
              <div className="mt-2.5 rounded-[0.9rem] bg-surface-muted px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
                    Total
                  </span>
                  <span className="text-sm font-black tabular-nums text-ink">
                    {totalMacro(intent.foods, "kcal")} kcal
                  </span>
                </div>
                <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {MACRO_ROWS.map((row) => (
                    <div key={row.key} className="flex items-baseline gap-1.5">
                      <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-subtle">
                        {row.label}
                      </dt>
                      <dd className="text-xs font-black tabular-nums text-ink-muted">
                        {totalMacro(intent.foods, row.key)}g
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          ) : (
            <>
              <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
                Confirm workout
              </p>
              <p className="mt-1 text-sm font-black text-ink">{intent.label}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">
                Logged for this session — a saved workout history is coming
                soon.
              </p>
            </>
          )}

          {status === "pending" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={onConfirm}>
                <Check className="h-3.5 w-3.5" />
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="h-3.5 w-3.5" />
                Not now
              </Button>
            </div>
          ) : (
            <div className="mt-2.5">
              <Badge
                dot
                size="sm"
                variant={status === "confirmed" ? "success" : "neutral"}
              >
                {status === "confirmed" ? "Added" : "Dismissed"}
              </Badge>
            </div>
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
