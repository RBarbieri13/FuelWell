import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-shaped skeleton. Daily review opens with two disclosure sections and
 * the energy ledger, so a generic three-card stack mis-sized the page and it
 * jumped on hydration. This mirrors the real regions instead.
 */
export default function DailyReviewLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-header">
        <div className="fw-page-inner py-5">
          <Skeleton className="h-8 w-48 bg-primary-100/80" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full bg-primary-50" />
        </div>
      </div>

      <div className="fw-page-inner space-y-4 pb-28 md:space-y-6 md:pb-8">
        {/* Overview + Daily summary disclosure sections */}
        {[4, 3].map((tiles, section) => (
          <div
            key={section}
            className="rounded-[2rem] border border-primary-200/90 bg-primary-50/35 p-3 shadow-e2 md:p-4"
          >
            <div className="rounded-[1.5rem] border border-white/85 bg-surface/72 px-4 py-3.5 md:px-5">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-[0.9rem] bg-primary-100/80" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 bg-primary-100/70" />
                  <Skeleton className="h-6 w-56 max-w-full bg-surface-sunken" />
                  <Skeleton className="h-4 w-full max-w-md bg-surface-muted" />
                </div>
                <Skeleton className="h-11 w-11 shrink-0 rounded-full bg-surface sm:w-28" />
              </div>
            </div>
            <div
              className={`mt-3 grid grid-cols-2 gap-3 md:mt-4 ${
                tiles === 4 ? "lg:grid-cols-4" : "md:grid-cols-3"
              }`}
            >
              {Array.from({ length: tiles }, (_, tile) => (
                <Skeleton key={tile} className="h-32 rounded-[1.2rem] bg-surface/85" />
              ))}
            </div>
          </div>
        ))}

        {/* Energy ledger: controls, bar strip, legend, trend tiles */}
        <div className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
          <Skeleton className="h-3 w-28 bg-primary-100/70" />
          <Skeleton className="mt-2 h-6 w-64 max-w-full bg-surface-sunken" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl bg-surface-muted" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-[1rem] bg-surface-sunken" />
            <Skeleton className="h-12 rounded-[1rem] bg-surface-sunken" />
          </div>
          <div className="mt-4 flex h-52 items-end gap-2">
            {["h-[54%]", "h-[78%]", "h-[63%]", "h-[91%]", "h-[70%]"].map((height, index) => (
              <Skeleton
                key={index}
                className={`min-w-0 flex-1 rounded-[1.1rem] bg-surface-sunken ${height}`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-hairline pt-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-3.5 w-20 bg-surface-muted" />
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-28 rounded-[1.25rem] bg-surface-subtle" />
            ))}
          </div>
        </div>

        <Skeleton className="h-64 rounded-[2rem] bg-surface/80" />
      </div>
    </div>
  );
}
