"use client";

import { useRef, useState } from "react";
import { Camera, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MacroTotals } from "@/lib/fuelwell-data";

type PhotoCandidate = {
  name: string;
  portionLabel: string;
  totals: MacroTotals;
  confidence: number;
  source: "vision_model" | "description_search";
  sourceNote: string;
};

type PhotoEstimateResponse = {
  enabled: boolean;
  candidates: PhotoCandidate[];
  reviewRequired: true;
  sourceNote: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export function PhotoEstimateReview({
  onLogCandidate,
}: {
  onLogCandidate: (name: string, totals: MacroTotals, portionLabel: string) => void;
}) {
  const [description, setDescription] = useState("");
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PhotoEstimateResponse | null>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Use a JPG, PNG, or WebP meal photo.");
      return;
    }
    setImageDataUrl(await readFileAsDataUrl(file));
  }

  async function estimate() {
    const currentDescription =
      (document.querySelector(
        '[aria-label="Describe visible foods"]'
      ) as HTMLTextAreaElement | null)?.value.trim() ||
      descriptionRef.current?.value.trim() ||
      description.trim();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/food/photo-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(imageDataUrl ? { imageDataUrl } : {}),
          description: currentDescription || undefined,
        }),
      });
      const data = (await res.json()) as PhotoEstimateResponse | { error?: string };
      if (!res.ok && "error" in data) {
        setError(data.error ?? "Photo estimate failed.");
      } else {
        setResult(data as PhotoEstimateResponse);
      }
    } catch {
      setError("Photo estimate is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary-700" />
          <h2 className="text-lg font-black text-neutral-900">Photo review draft</h2>
        </div>
        <p className="mt-1 text-sm font-medium leading-6 text-neutral-500">
          Upload a meal photo and review candidates before saving. FuelWell never auto-logs a photo estimate.
        </p>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Meal photo"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        className="block w-full rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm font-medium text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-xs file:font-black file:text-white"
      />

      {imageDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageDataUrl}
          alt="Selected meal preview"
          className="max-h-56 w-full rounded-2xl object-cover"
        />
      )}

      <textarea
        ref={descriptionRef}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Optional: describe visible foods, e.g. chicken, rice, broccoli"
        aria-label="Describe visible foods"
        className="min-h-24 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <Button
        onClick={estimate}
        loading={loading}
        disabled={!imageDataUrl && description.trim().length < 2}
      >
        <Search className="h-4 w-4" />
        Estimate draft
      </Button>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <p className="text-sm font-bold leading-5 text-amber-900">
              {result.sourceNote} Review is required before anything is saved.
            </p>
          </div>

          {result.candidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
              <p className="font-bold text-neutral-900">No useful draft yet.</p>
              <p className="mt-1 text-sm font-medium text-neutral-500">
                Add a short description or use Search so macros stay truthful.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {result.candidates.map((candidate) => (
                <li
                  key={`${candidate.name}-${candidate.portionLabel}`}
                  className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-neutral-900">
                        {candidate.name}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-neutral-500">
                        {candidate.portionLabel} · {candidate.totals.calories} kcal ·{" "}
                        {candidate.totals.protein}g protein
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-neutral-500">
                        {candidate.sourceNote}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        onLogCandidate(candidate.name, candidate.totals, candidate.portionLabel)
                      }
                    >
                      Save reviewed
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
