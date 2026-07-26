import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-shaped pending state for /app/log. The generic PageSkeleton assumes an
 * fw-page-header this route does not render, so the placeholder used to settle
 * into a different layout than the one that arrives. This mirrors the real
 * grid — dark hero, mode switcher, search card, totals rail — so the swap to
 * live content is a fill rather than a reflow.
 */
export default function LogLoading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl min-w-0 space-y-4 p-4 pb-28 md:space-y-5 md:p-8"
      role="status"
      aria-label="Loading meal logging"
    >
      <Skeleton className="h-28 rounded-[24px] bg-[#123d32]/85 md:h-32" />

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
        <div className="min-w-0 space-y-5">
          {/* Mode switcher: four segments inside one raised plate. */}
          <div className="grid min-w-0 grid-cols-2 gap-2 rounded-[1.5rem] border border-hairline bg-surface/86 p-2 shadow-e2 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 rounded-[1.15rem] bg-surface-sunken" />
            ))}
          </div>

          <Skeleton className="h-4 w-3/4 max-w-md rounded-full bg-surface-sunken" />

          {/* Search card: field, two filter chip rows, count line, result rows. */}
          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
            <Skeleton className="h-12 rounded-[1.35rem] bg-surface-sunken" />
            <div className="flex flex-wrap gap-2">
              {["w-[5.5rem]", "w-[4.5rem]", "w-16", "w-[3.5rem]"].map((w, i) => (
                <Skeleton
                  key={i}
                  className={`h-9 rounded-full bg-surface-sunken ${w}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["w-12", "w-[5.25rem]", "w-[4.75rem]", "w-[7rem]"].map((w, i) => (
                <Skeleton
                  key={i}
                  className={`h-9 rounded-full bg-surface-muted ${w}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 px-1">
              <Skeleton className="h-3 w-24 rounded-full bg-surface-sunken" />
              <Skeleton className="h-5 w-20 rounded-full bg-surface-muted" />
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="h-[4.25rem] rounded-[1rem] bg-surface-muted"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-5">
          {/* Totals rail: header, four-macro status strip, then four meter rows. */}
          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-surface-sunken" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-5 w-40 max-w-full rounded-full bg-surface-sunken" />
                <Skeleton className="h-3 w-56 max-w-full rounded-full bg-surface-muted" />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-[1.15rem] bg-surface-muted px-3 py-2.5 ring-1 ring-inset ring-hairline">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-2.5 w-full max-w-16 rounded-full bg-surface-sunken" />
                  <Skeleton className="h-4 w-10 rounded-full bg-surface-sunken" />
                </div>
              ))}
            </div>

            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="space-y-2.5 rounded-[1.2rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline"
              >
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-9 w-28 rounded-[0.9rem] bg-surface-sunken" />
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-5 w-24 rounded-full bg-surface-sunken" />
                    <Skeleton className="h-4 w-20 rounded-full bg-surface-sunken" />
                  </div>
                </div>
                <Skeleton className="h-2.5 rounded-full bg-surface-sunken" />
                {/* Axis strip below the meter, so the scale line does not pop in. */}
                <div aria-hidden="true" className="flex justify-between px-px">
                  {Array.from({ length: 5 }, (_, tick) => (
                    <span
                      key={tick}
                      className={`w-px bg-hairline-strong ${tick === 2 ? "h-2.5" : "h-1.5"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">Loading meal logging…</span>
    </div>
  );
}
