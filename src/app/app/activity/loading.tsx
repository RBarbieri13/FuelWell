import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Activity route: verdict hero + decisions panel, a four-up metric
 * strip, then the two chart cards. Sized so the real content lands in place
 * instead of shifting the page under the user's thumb.
 */
export default function ActivityLoading() {
  return (
    <div className="fw-app-surface min-h-full" aria-busy="true">
      <div className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:py-7">
          <div>
            <Skeleton className="h-8 w-32 rounded-2xl bg-primary-100/80 md:h-10 md:w-44" />
            <Skeleton className="mt-2 h-4 w-60 max-w-full rounded-full bg-primary-50" />
          </div>
          <Skeleton className="h-12 w-full rounded-full bg-primary-100/80 md:w-56" />
        </div>
      </div>

      <div className="fw-page-inner space-y-4 pb-28 md:space-y-6 md:pb-8">
        <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="fw-dark-panel rounded-[24px] border p-6 shadow-e3 md:p-7">
            <Skeleton className="h-7 w-52 max-w-full rounded-full bg-white/15" />
            <Skeleton className="mt-4 h-8 w-full rounded-2xl bg-white/15 md:h-10" />
            <Skeleton className="mt-2 h-8 w-3/4 rounded-2xl bg-white/12 md:h-10" />
            <Skeleton className="mt-4 h-3.5 w-5/6 rounded-full bg-white/10" />
            <div className="mt-6 grid grid-cols-3 gap-2 md:gap-3">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-[4.5rem] rounded-[1.05rem] bg-white/10 md:rounded-[1.25rem]" />
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e3 md:p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-[0.8125rem] bg-primary-100/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40 max-w-full rounded-full bg-surface-sunken" />
                <Skeleton className="h-3.5 w-56 max-w-full rounded-full bg-surface-muted" />
              </div>
            </div>
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-20 rounded-[1.25rem] bg-surface-subtle" />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e2">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-[1.15rem] bg-surface-sunken" />
                <Skeleton className="h-6 w-20 rounded-full bg-surface-muted" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl bg-surface-sunken" />
              <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
            </div>
          ))}
        </div>

        {/* Movement load + fuel timing, then the timeline beside the honesty
            note — the same column ratios as the loaded page. */}
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          {[0, 1].map((index) => (
            <div key={index} className="space-y-4 rounded-[24px] border border-hairline bg-surface p-6 shadow-e2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-100/80" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-40 max-w-full rounded-full bg-surface-sunken" />
                  <Skeleton className="h-3.5 w-56 max-w-full rounded-full bg-surface-muted" />
                </div>
              </div>
              <Skeleton className="h-3 w-full rounded-full bg-surface-muted" />
              {[0, 1, 2].map((row) => (
                <div key={row} className="space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded-full bg-surface-muted" />
                  <Skeleton className="h-4 w-full rounded-full bg-surface-sunken" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface p-6 shadow-e2">
            <Skeleton className="h-6 w-44 max-w-full rounded-full bg-surface-sunken" />
            <Skeleton className="h-3.5 w-72 max-w-full rounded-full bg-surface-muted" />
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 md:grid-cols-[5rem_1.5rem_minmax(0,1fr)]">
                <Skeleton className="hidden h-4 w-14 rounded-full bg-surface-muted md:block" />
                <Skeleton className="mx-auto h-3 w-3 rounded-full bg-surface-sunken" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-5 w-48 max-w-full rounded-full bg-surface-sunken" />
                  <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-40 rounded-[24px] bg-lemon-50/80" />
        </div>
      </div>
    </div>
  );
}
