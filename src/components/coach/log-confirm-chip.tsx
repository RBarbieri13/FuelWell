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

/**
 * The macro swatches reuse the same three roles the rest of the app charts
 * macros with, so a protein number is the same blue here as on the dashboard.
 */
const MACRO_ROWS = [
  { key: "protein", label: "Protein", swatch: "var(--color-macro-protein)" },
  { key: "carbs", label: "Carbs", swatch: "var(--color-macro-carbs)" },
  { key: "fat", label: "Fat", swatch: "var(--color-macro-fat)" },
] as const;

export function LogConfirmChip({
  intent,
  status,
  onConfirm,
  onDismiss,
}: LogConfirmChipProps) {
  const isMeal = intent.kind === "meal";
  const isConfirmed = status === "confirmed";
  const isDismissed = status === "dismissed";
  const Icon = isConfirmed ? Check : isMeal ? UtensilsCrossed : Dumbbell;

  return (
    <div
      className={cn(
        // Nested inside a message bubble, so this stays a ringed plate rather
        // than stacking a second drop shadow on the bubble's elevation.
        "mt-3 rounded-[1.25rem] p-3 ring-1 ring-inset transition-colors duration-200 ease-out-soft",
        isConfirmed
          ? "bg-primary-50/70 ring-primary-200"
          : isDismissed
            ? // Settled-and-declined used to be a blanket 70% opacity, which
              // dragged the numbers under the contrast floor. It now steps down
              // in colour instead, so the record stays readable.
              "bg-surface-muted ring-hairline"
            : "bg-surface ring-hairline-strong"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] ring-1 ring-inset transition-colors duration-200 ease-out-soft",
            isConfirmed
              ? "bg-primary-600 text-white ring-primary-600"
              : isDismissed
                ? "bg-surface text-ink-subtle ring-hairline"
                : "bg-primary-50 text-primary-700 ring-primary-100"
          )}
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          {intent.kind === "meal" ? (
            <>
              <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-muted">
                Confirm {intent.mealType}
              </p>
              {/* Hairline rules between rows give the kcal column something to
                  track against once a meal runs to four or five items. */}
              <ul className="mt-1.5 divide-y divide-hairline">
                {intent.foods.map((f) => (
                  <li
                    key={f.food.id}
                    className="flex items-baseline justify-between gap-2 py-1 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="min-w-0 truncate font-bold text-ink">
                      {f.quantity !== 1 ? (
                        <span className="tabular-nums">{f.quantity}x </span>
                      ) : (
                        ""
                      )}
                      {f.food.name}
                      <span className="ml-1 font-semibold tabular-nums text-ink-muted">
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
                  <span className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-muted">
                    Total
                  </span>
                  <span className="text-sm font-black tabular-nums text-ink">
                    {totalMacro(intent.foods, "kcal")} kcal
                  </span>
                </div>
                <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {MACRO_ROWS.map((row) => (
                    <div key={row.key} className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.swatch }}
                      />
                      <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                        {row.label}
                      </dt>
                      <dd className="text-xs font-black tabular-nums text-ink">
                        {totalMacro(intent.foods, row.key)}g
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          ) : (
            <>
              <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-muted">
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
            // One primary action, one step down to ghost — and both keep the
            // 44px target the rest of the chat rows use.
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="rounded-full px-4" onClick={onConfirm}>
                <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full px-4"
                onClick={onDismiss}
              >
                <X className="h-4 w-4 shrink-0" strokeWidth={2} />
                Not now
              </Button>
            </div>
          ) : (
            <div className="mt-2.5" role="status">
              <Badge dot size="sm" variant={isConfirmed ? "success" : "neutral"}>
                {isConfirmed ? "Added" : "Dismissed"}
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
