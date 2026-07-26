import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-shaped pending state. The generic page skeleton stacked three equal
 * cards, which did not match this page and made the hand-off to the real
 * content jump; this mirrors the profile grid so the layout stays still.
 */
export default function ProfileLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <Skeleton className="h-8 w-40 bg-primary-100/80 md:h-10" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full bg-primary-50" />
          </div>
          <Skeleton className="h-11 w-32 rounded-full bg-primary-50" />
        </div>
      </header>

      {/* Matches ProfileClient's container exactly — the app shell already
          reserves room for the mobile tab bar, so an extra pb here made the
          skeleton taller than the page it stands in for. */}
      <div className="fw-page-inner space-y-4 md:space-y-6">
        <section className="grid min-w-0 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="fw-dark-panel min-w-0 rounded-[24px] border px-5 py-5 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <Skeleton className="h-16 w-16 shrink-0 rounded-[1.35rem] bg-white/12 md:h-24 md:w-24 md:rounded-[2rem]" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-28 bg-white/12" />
                <Skeleton className="mt-3 h-8 w-56 max-w-full bg-white/15 md:h-10" />
                <Skeleton className="mt-3 h-4 w-44 max-w-full bg-white/10" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-8 md:gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-[4.5rem] rounded-[1.25rem] bg-white/10" />
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-5 rounded-[24px] border border-hairline bg-surface p-5 shadow-e3 md:p-6">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-100/70" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-6 w-40 bg-primary-100/60" />
                <Skeleton className="mt-2 h-4 w-full max-w-sm bg-surface-sunken" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-[5.5rem] rounded-[1.35rem] bg-surface-sunken" />
              ))}
            </div>
            <Skeleton className="h-[6.5rem] rounded-[1.35rem] bg-surface-muted" />
            <div className="space-y-2">
              <Skeleton className="h-11 rounded-[1.15rem] bg-surface-sunken" />
              <Skeleton className="h-11 rounded-[1.15rem] bg-surface-muted" />
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-[1fr_0.85fr]">
          <div className="min-w-0 rounded-[24px] border border-hairline bg-surface px-5 py-6 shadow-e2 sm:px-6">
            <Skeleton className="h-6 w-36 bg-primary-100/60" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-14 rounded-[1rem] bg-surface-sunken" />
              ))}
            </div>
          </div>
          <div className="min-w-0 self-start rounded-[24px] border border-hairline bg-surface p-5 shadow-e2 md:p-6">
            <Skeleton className="h-5 w-40 bg-primary-100/60" />
            <Skeleton className="mt-2 h-4 w-52 max-w-full bg-surface-sunken" />
            <Skeleton className="mt-4 h-11 w-32 rounded-[1.15rem] bg-surface-muted" />
          </div>
        </section>
      </div>
    </div>
  );
}
