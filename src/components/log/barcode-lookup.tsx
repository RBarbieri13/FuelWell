"use client";

import { useState } from "react";
import { Barcode, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FoodItem } from "@/lib/food-database";

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
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeResponse | null>(null);
  const [error, setError] = useState("");

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
      <div>
        <div className="flex items-center gap-2">
          <Barcode className="h-5 w-5 text-primary-700" />
          <h2 className="text-lg font-black text-neutral-900">Barcode lookup</h2>
        </div>
        <p className="mt-1 text-sm font-medium leading-6 text-neutral-500">
          Use the camera keyboard scanner or paste a barcode. FuelWell only saves a match after you review the portion.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          inputMode="numeric"
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          placeholder="Try 000000000104"
          aria-label="Barcode number"
          className="min-h-12 flex-1 rounded-2xl border border-neutral-200 bg-white px-4 text-base font-bold text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button onClick={lookup} loading={loading} disabled={barcode.trim().length < 8}>
          <Search className="h-4 w-4" />
          Look up
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {result?.found === false && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
          <p className="font-bold text-neutral-900">No verified match.</p>
          <p className="mt-1 text-sm font-medium text-neutral-500">{result.message}</p>
        </div>
      )}

      {result?.found === true && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-primary-700">
            Verified barcode match
          </p>
          <p className="mt-1 text-base font-black text-neutral-950">{result.food.name}</p>
          <p className="mt-1 text-sm font-medium text-neutral-600">
            {result.food.categoryLabel} · {result.food.per100.kcal} cal /100{result.food.servingUnit}
          </p>
          <p className="mt-2 text-xs font-medium leading-5 text-neutral-500">
            {result.sourceNote}
          </p>
          <Button className="mt-3" onClick={() => onSelect(result.food)}>
            Choose portion
          </Button>
        </div>
      )}
    </Card>
  );
}
