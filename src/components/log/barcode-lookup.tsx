"use client";

import { useId, useState } from "react";
import { AlertCircle, Barcode, CheckCircle2, PackageSearch, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { FoodItem } from "@/lib/food-database";

/** Macro roles carry the same colour as the totals panel and portion picker. */
const RESULT_MACROS: { key: "protein" | "carbs" | "fat"; label: string; color: string }[] =
  [
    { key: "protein", label: "protein", color: "var(--color-macro-protein)" },
    { key: "carbs", label: "carbs", color: "var(--color-macro-carbs)" },
    { key: "fat", label: "fat", color: "var(--color-macro-fat)" },
  ];

type BarcodeResponse =
  | {
      found: true;
      barcode: string;
      provider: string;
      verified: boolean;
      food: FoodItem;
      sourceNote: string;
    }
  | { found: false; barcode: string; message: string };

export function BarcodeLookup({ onSelect }: { onSelect: (food: FoodItem) => void }) {
  const barcodeHintId = useId();
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeResponse | null>(null);
  const [error, setError] = useState("");
  const tooShort = barcode.trim().length < 8;

  async function lookup() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/food/barcode?barcode=${encodeURIComponent(barcode)}`);
      const data = (await res.json()) as BarcodeResponse | { error?: string };
      if (!res.ok && "error" in data) {
        setError(data.error ?? "Barcode lookup failed.");
      } else {
        setResult(data as BarcodeResponse);
      }
    } catch {
      setError("Barcode lookup is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <SectionHeader
        as="h2"
        icon={Barcode}
        title="Barcode lookup"
        description="Use the camera keyboard scanner or paste a barcode. FuelWell only saves a match after you review the portion."
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Barcode
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-600"
            strokeWidth={2}
          />
          <input
            inputMode="numeric"
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Try 000000000104"
            aria-label="Barcode number"
            aria-describedby={barcodeHintId}
            className="min-h-12 w-full min-w-0 rounded-[1.15rem] bg-primary-50/55 py-3 pl-12 pr-4 text-base font-bold tabular-nums text-ink ring-1 ring-inset ring-primary-100 transition duration-200 ease-out-soft placeholder:font-semibold placeholder:tabular-nums placeholder:text-ink-faint hover:ring-primary-200 focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-primary-500"
          />
        </div>
        <Button
          onClick={lookup}
          loading={loading}
          disabled={tooShort}
          className="shrink-0"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          Look up
        </Button>
      </div>

      {/* A disabled button with no stated reason reads as broken. */}
      <p
        id={barcodeHintId}
        className={cn(
          "px-1 text-xs font-bold leading-5",
          tooShort && barcode.trim().length > 0
            ? "text-accent-700"
            : "text-ink-subtle"
        )}
      >
        Barcodes are at least 8 digits.{" "}
        {barcode.trim().length > 0 && (
          <span className="tabular-nums">
            {barcode.trim().length} entered.
          </span>
        )}
      </p>

      {loading && (
        // Placeholder matches the result panel's shape so the answer fills in
        // rather than pushing the card open.
        <div
          className="space-y-2 rounded-[1.35rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline"
          role="status"
          aria-label="Looking up barcode"
        >
          <Skeleton className="h-6 w-52 max-w-full rounded-full bg-surface-sunken" />
          <Skeleton className="h-5 w-40 max-w-full rounded-full bg-surface-sunken" />
          <Skeleton className="h-4 w-64 max-w-full rounded-full bg-surface-sunken" />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[1.15rem] bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-700 ring-1 ring-inset ring-red-100"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          {error}
        </p>
      )}

      {result?.found === false && (
        <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60">
          <EmptyState
            size="inline"
            icon={PackageSearch}
            title="No verified match."
            description={result.message}
          />
        </div>
      )}

      {result?.found === true && (
        // Nested inside the card — inset ring, not a second drop shadow.
        <div className="rounded-[1.35rem] bg-surface-subtle p-4 ring-1 ring-inset ring-primary-100">
          <Badge
            variant="success"
            className="uppercase tracking-[0.14em] ring-primary-200"
          >
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            Verified barcode match
          </Badge>
          <p className="mt-3 text-base font-black text-ink">{result.food.name}</p>
          <p className="mt-1 text-sm font-semibold text-ink-muted">
            {result.food.categoryLabel} ·{" "}
            <span className="tabular-nums">{result.food.per100.kcal}</span> kcal /100
            {result.food.servingUnit}
          </p>
          {/* Full macro read, not just kcal — the portion step that follows is
              easier to judge when all four numbers are already on screen. */}
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {RESULT_MACROS.map((macro) => (
              <div
                key={macro.key}
                className="min-w-0 rounded-[0.9rem] bg-surface px-2.5 py-2 ring-1 ring-inset ring-hairline"
              >
                <dt className="flex items-center gap-1.5 text-[0.625rem] font-black uppercase tracking-[0.1em] text-ink-muted">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="min-w-0 truncate">{macro.label}</span>
                </dt>
                <dd className="mt-0.5 truncate text-sm font-black tabular-nums text-ink">
                  {result.food.per100[macro.key]}g
                  <span className="ml-1 text-[0.625rem] font-bold text-ink-muted">
                    /100{result.food.servingUnit}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-hairline pt-2 text-xs font-semibold leading-5 text-ink-subtle">
            {result.sourceNote}
          </p>
          <Button className="mt-3 w-full sm:w-auto" onClick={() => onSelect(result.food)}>
            Choose portion
          </Button>
        </div>
      )}
    </Card>
  );
}
