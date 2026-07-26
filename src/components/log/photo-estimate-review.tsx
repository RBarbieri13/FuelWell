"use client";

import { useRef, useState } from "react";
import { AlertCircle, Camera, ImageOff, Info, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
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

/** Macro roles carry the same colour as the totals panel and portion picker. */
const CANDIDATE_MACROS: {
  key: "protein" | "carbs" | "fat";
  label: string;
  color: string;
}[] = [
  { key: "protein", label: "protein", color: "var(--color-macro-protein)" },
  { key: "carbs", label: "carbs", color: "var(--color-macro-carbs)" },
  { key: "fat", label: "fat", color: "var(--color-macro-fat)" },
];

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
      <SectionHeader
        as="h2"
        icon={Camera}
        title="Photo review draft"
        description="Upload a meal photo and review candidates before saving. FuelWell never auto-logs a photo estimate."
      />

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Meal photo"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        className="block w-full cursor-pointer rounded-[1.25rem] border border-dashed border-primary-200 bg-primary-50/55 px-4 py-4 text-sm font-semibold text-ink-muted transition duration-200 ease-out-soft hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary-700 file:px-4 file:py-2 file:text-xs file:font-black file:text-white hover:file:bg-primary-800"
      />

      {imageDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageDataUrl}
          alt="Selected meal preview"
          className="max-h-56 w-full rounded-[1.25rem] object-cover shadow-e1 ring-1 ring-inset ring-hairline"
        />
      )}

      <textarea
        ref={descriptionRef}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Optional: describe visible foods, e.g. chicken, rice, broccoli"
        aria-label="Describe visible foods"
        className="min-h-24 w-full min-w-0 rounded-[1.25rem] bg-surface px-4 py-3 text-base font-semibold leading-6 text-ink ring-1 ring-inset ring-hairline-strong transition duration-200 ease-out-soft placeholder:font-semibold placeholder:text-ink-faint hover:ring-primary-200 focus:outline-none focus:ring-[3px] focus:ring-primary-500"
      />

      <Button
        onClick={estimate}
        loading={loading}
        disabled={!imageDataUrl && description.trim().length < 2}
        className="w-full sm:w-auto"
      >
        <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        Estimate draft
      </Button>

      {loading && (
        <div
          className="space-y-2"
          role="status"
          aria-label="Building estimate candidates"
        >
          <Skeleton className="h-12 rounded-[1.25rem] bg-lemon-50" />
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-[1.25rem] bg-surface-muted" />
          ))}
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

      {result && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-[1.25rem] bg-lemon-50 px-4 py-3 ring-1 ring-inset ring-lemon-200">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-lemon-700"
              strokeWidth={2}
              aria-hidden="true"
            />
            <p className="text-sm font-bold leading-5 text-lemon-700">
              {result.sourceNote} Review is required before anything is saved.
            </p>
          </div>

          {result.candidates.length === 0 ? (
            <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60">
              <EmptyState
                size="inline"
                icon={ImageOff}
                title="No useful draft yet."
                description="Add a short description or use Search so macros stay truthful."
              />
            </div>
          ) : (
            <ul className="space-y-2">
              {result.candidates.map((candidate) => (
                <li
                  key={`${candidate.name}-${candidate.portionLabel}`}
                  className="rounded-[1.25rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline"
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="min-w-0 truncate text-sm font-black text-ink">
                          {candidate.name}
                        </p>
                        <Badge variant="warning" size="sm" dot>
                          <span className="tabular-nums">
                            {Math.round(candidate.confidence * 100)}%
                          </span>{" "}
                          confidence
                        </Badge>
                      </div>
                      {/* A percentage in a chip is a claim; the meter turns it
                          into something you can compare between candidates. */}
                      <div
                        role="img"
                        aria-label={`Model confidence ${Math.round(
                          candidate.confidence * 100
                        )} percent`}
                        className="mt-1.5 h-1.5 max-w-56 overflow-hidden rounded-full bg-surface-sunken"
                      >
                        <div
                          className="h-full rounded-full bg-lemon-500 transition-[width] duration-500 ease-out-soft"
                          style={{
                            width: `${Math.max(
                              4,
                              Math.min(100, Math.round(candidate.confidence * 100))
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs font-bold text-ink-muted">
                        <span className="min-w-0 truncate">
                          {candidate.portionLabel}
                        </span>
                        <span className="whitespace-nowrap font-black text-ink">
                          <span className="tabular-nums">
                            {candidate.totals.calories.toLocaleString()}
                          </span>{" "}
                          kcal
                        </span>
                        {CANDIDATE_MACROS.map((macro) => (
                          <span
                            key={macro.key}
                            className="inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: macro.color }}
                            />
                            <span className="tabular-nums">
                              {candidate.totals[macro.key]}
                            </span>
                            g {macro.label}
                          </span>
                        ))}
                      </p>
                      <p className="mt-1.5 text-xs font-semibold leading-5 text-ink-subtle">
                        {candidate.sourceNote}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0"
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
