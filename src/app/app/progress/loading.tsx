import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-shaped skeleton. A generic card stack made the chart-heavy Progress
 * page jump on hydration; this mirrors the real layout (verdict panel, next
 * step, chart with its axis strip, then the two-up cards) so the transition
 * settles instead of reflowing.
 */
export default function ProgressLoading() {
  return (
    <div className="fw-app-surface min-h-full" role="status" aria-busy="true">
      <span className="sr-only">Loading your progress trends</span>

      <div className="fw-page-header">
        <div className="fw-page-inner py-5 md:py-7">
          <Skeleton className="h-8 w-40 bg-primary-100/80" />
          <Skeleton className="mt-2 h-4 w-60 max-w-full bg-primary-50" />
        </div>
      </div>

      <div className="fw-page-inner max-w-[1120px] space-y-4 pb-28 md:space-y-6 md:pb-8">
        {/* Verdict panel + today's stat tiles */}
        <div className="fw-mint-panel rounded-[24px] border border-primary-200/80 p-4 md:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <Skeleton className="h-7 w-64 max-w-full rounded-full bg-surface/80" />
              <Skeleton className="h-7 w-72 max-w-full bg-surface/70" />
              <Skeleton className="h-4 w-full bg-surface/60" />
              <Skeleton className="h-4 w-4/5 bg-surface/60" />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[0, 1, 2].map((tile) => (
                <Skeleton key={tile} className="h-[92px] rounded-2xl bg-surface/80" />
              ))}
            </div>
          </div>
        </div>

        {/* One next step */}
        <Skeleton className="h-28 rounded-[24px] bg-primary-950/85" />

        {/* Chart card: header, series chips, legend, y-axis gutter, bars, axis strip */}
        <div className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-50" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-56 max-w-full bg-surface-sunken" />
              <Skeleton className="mt-2 h-4 w-full max-w-md bg-surface-muted" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((chip) => (
              <Skeleton key={chip} className="h-9 w-24 rounded-full bg-surface-sunken" />
            ))}
          </div>
          {/* Legend strip — the real chart draws it above the plot band. */}
          <div className="mt-4 flex flex-wrap gap-4">
            {[0, 1, 2, 3].map((swatch) => (
              <Skeleton key={swatch} className="h-3 w-16 bg-surface-muted" />
            ))}
          </div>
          {/* The real chart parks a 2.5rem y-axis beside the plot; without the
              same gutter the bars slide sideways on hydration. */}
          <div className="mt-3 flex gap-2">
            <div className="flex w-10 shrink-0 flex-col justify-between pt-5">
              {[0, 1, 2].map((tick) => (
                <Skeleton key={tick} className="h-2.5 w-full bg-surface-muted" />
              ))}
            </div>
            <div className="min-w-0 flex-1 pt-5">
              <div className="flex h-40 items-end gap-2 border-b border-hairline-strong sm:gap-3 md:gap-4">
                {[
                  "h-[62%]",
                  "h-[84%]",
                  "h-[71%]",
                  "h-[96%]",
                  "h-[58%]",
                  "h-[79%]",
                  "h-[88%]",
                ].map((height, index) => (
                  <Skeleton
                    key={index}
                    className={`min-w-0 max-w-[38px] flex-1 rounded-t-[0.6rem] bg-surface-sunken ${height}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex gap-2 pl-12">
            {[0, 1, 2, 3, 4, 5, 6].map((label) => (
              <Skeleton key={label} className="h-3 min-w-0 flex-1 bg-surface-muted" />
            ))}
          </div>
        </div>

        {/* Macro meters + meal consistency */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          {[0, 1].map((card) => (
            <div
              key={card}
              className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-50" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 max-w-full bg-surface-sunken" />
                  <Skeleton className="h-3.5 w-40 max-w-full bg-surface-muted" />
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="space-y-2">
                    <Skeleton className="h-3.5 w-32 bg-surface-muted" />
                    <Skeleton className="h-2.5 rounded-full bg-surface-sunken" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Weight trend: input column beside the chart well */}
        <div className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-50" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-40 max-w-full bg-surface-sunken" />
              <Skeleton className="h-3.5 w-56 max-w-full bg-surface-muted" />
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[0.85fr_1.15fr]">
            <div className="min-w-0 space-y-3">
              <Skeleton className="h-3 w-28 bg-surface-muted" />
              <Skeleton className="h-14 rounded-[1rem] bg-surface-muted" />
              <Skeleton className="h-11 w-36 rounded-full bg-surface-sunken" />
            </div>
            <div className="min-w-0 rounded-[18px] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
              <Skeleton className="h-20 w-full bg-surface-sunken" />
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-3.5 w-full bg-surface-muted" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <Skeleton className="h-24 rounded-[24px] bg-surface/85" />
      </div>
    </div>
  );
}
