"use client";

import { useState } from "react";
import { Barcode, CheckCircle2, Search } from "lucide-react";
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
          <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
            <Barcode className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-black text-[#16302a]">Barcode lookup</h2>
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
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
          className="min-h-12 flex-1 rounded-[1.15rem] border border-primary-100 bg-primary-50/55 px-4 text-base font-bold text-[#16302a] placeholder:text-[#91a7a0] focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60 p-5">
          <p className="font-black text-[#16302a]">No verified match.</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{result.message}</p>
        </div>
      )}

      {result?.found === true && (
        <div className="rounded-[1.35rem] border border-primary-100 bg-primary-50/70 p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified barcode match
          </p>
          <p className="mt-3 text-base font-black text-[#16302a]">{result.food.name}</p>
          <p className="mt-1 text-sm font-semibold text-[#60776f]">
            {result.food.categoryLabel} · {result.food.per100.kcal} kcal /100{result.food.servingUnit}
          </p>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">
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
