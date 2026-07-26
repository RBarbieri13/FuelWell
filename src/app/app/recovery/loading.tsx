import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Recovery route: mint readiness panel with its score dial, the
 * next-actions panel, a four-up signal strip, then the two analysis cards.
 */
export default function RecoveryLoading() {
  return (
    <div className="fw-app-surface min-h-full" aria-busy="true">
      <div className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:py-7">
          <div>
            <Skeleton className="h-8 w-36 rounded-2xl bg-primary-100/80 md:h-10 md:w-48" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-full bg-primary-50" />
          </div>
          <Skeleton className="h-12 w-full rounded-full bg-primary-100/80 md:w-64" />
        </div>
      </div>

      <div className="fw-page-inner space-y-4 pb-28 md:space-y-6 md:pb-8">
        <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="fw-mint-panel rounded-[24px] border p-5 shadow-e3 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-4 w-40 max-w-full rounded-full bg-primary-100/80" />
                <Skeleton className="h-8 w-full rounded-2xl bg-primary-100/70 md:h-10" />
                <Skeleton className="h-3.5 w-5/6 rounded-full bg-surface/70" />
              </div>
              <Skeleton className="h-24 w-24 shrink-0 rounded-[20px] bg-surface/80 md:h-32 md:w-32" />
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-[0.8125rem] bg-primary-100/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-36 max-w-full rounded-full bg-surface-sunken" />
                <Skeleton className="h-3.5 w-52 max-w-full rounded-full bg-surface-muted" />
              </div>
            </div>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-20 rounded-[1.25rem] bg-surface-subtle" />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-3 rounded-[24px] border border-hairline bg-surface p-4 shadow-e2 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-[1.15rem] bg-surface-sunken" />
                <Skeleton className="h-6 w-24 rounded-full bg-surface-muted" />
              </div>
              <Skeleton className="h-8 w-20 rounded-xl bg-surface-sunken" />
              <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index} className="space-y-4 rounded-[24px] border border-hairline bg-surface p-6 shadow-e2">
              <Skeleton className="h-6 w-48 max-w-full rounded-full bg-surface-sunken" />
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="space-y-2">
                  <Skeleton className="h-3.5 w-28 rounded-full bg-surface-muted" />
                  <Skeleton className="h-3 w-full rounded-full bg-surface-sunken" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
