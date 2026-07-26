import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-shaped pending state matching the settings grid (account hero +
 * integration card, then paired setting groups) so the layout does not shift
 * when the real content resolves.
 */
export default function SettingsLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <Skeleton className="h-8 w-44 bg-primary-100/80 md:h-10" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full bg-primary-50" />
            {/* Same scroller as the real section nav — four non-shrinking
                80px chips overflow a 320px viewport without it. */}
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-11 w-20 shrink-0 rounded-full bg-primary-50" />
              ))}
            </div>
          </div>
          <Skeleton className="h-9 w-20 shrink-0 rounded-full bg-primary-100/70" />
        </div>
      </header>

      {/* Mirrors SettingsClient's container; the app shell already pads for the
          mobile tab bar, so no extra bottom padding belongs here. */}
      <div className="fw-page-inner space-y-4 md:space-y-6">
        <section className="grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="fw-dark-panel min-w-0 rounded-[24px] border px-5 py-6 sm:px-8 sm:py-8">
            <Skeleton className="h-3 w-40 bg-white/12" />
            <Skeleton className="mt-4 h-9 w-64 max-w-full bg-white/15 md:h-12" />
            <Skeleton className="mt-3 h-4 w-48 max-w-full bg-white/10" />
            <div className="mt-5 grid grid-cols-3 gap-2 md:mt-8 md:gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-[4.5rem] rounded-[1.25rem] bg-white/10" />
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-5 rounded-[24px] border border-hairline bg-surface p-5 shadow-e3 md:p-6">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-100/70" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-6 w-44 bg-primary-100/60" />
                <Skeleton className="mt-2 h-4 w-full max-w-sm bg-surface-sunken" />
              </div>
            </div>
            <Skeleton className="h-20 rounded-[1.25rem] bg-surface-muted" />
            <Skeleton className="h-9 w-36 rounded-full bg-surface-sunken" />
          </div>
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="min-w-0">
              <Skeleton className="mb-3 h-3 w-24 bg-primary-100/60" />
              <div className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, row) => (
                    <Skeleton key={row} className="h-14 rounded-[1rem] bg-surface-sunken" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="min-w-0">
          <Skeleton className="mb-3 h-3 w-28 bg-primary-100/60" />
          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
            <Skeleton className="h-7 w-56 max-w-full bg-primary-100/60" />
            <Skeleton className="h-64 rounded-[1.35rem] bg-surface-muted" />
            <Skeleton className="h-28 rounded-[1.35rem] bg-surface-sunken" />
          </div>
        </div>
      </div>
    </div>
  );
}
