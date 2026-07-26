import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Activity-detail route: the compact hero row, the four target
 * tiles (icon + pill + big number + meter), the stack of activity log cards,
 * then the workout manager and the two footer notes. Same rhythm and the same
 * radii as the loaded page, so the first paint doesn't reflow.
 */
export default function FitnessLoading() {
  return (
    <div className="fw-app-surface min-h-full" aria-busy="true">
      <div className="fw-page-header">
        <div className="fw-page-inner py-5">
          <Skeleton className="h-8 w-44 rounded-2xl bg-primary-100/80 md:h-10 md:w-56" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-full bg-primary-50" />
        </div>
      </div>

      <div className="fw-page-inner space-y-4 pb-28 md:space-y-6 md:pb-8">
        <div className="rounded-[1.35rem] border border-hairline bg-surface px-5 py-4 shadow-e2 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-100/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-32 rounded-full bg-surface-muted" />
                <Skeleton className="h-6 w-64 max-w-full rounded-xl bg-surface-sunken" />
                <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
              </div>
            </div>
            <Skeleton className="h-12 w-full shrink-0 rounded-full bg-primary-100/80 md:w-40" />
          </div>
        </div>

        {/* Four target tiles: chip + percent pill, the figure, then the meter. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-[1.2rem] border border-hairline bg-surface px-4 py-3.5 shadow-e2 md:px-5 md:py-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-full bg-surface-sunken" />
                  <Skeleton className="h-4 w-16 max-w-full rounded-full bg-surface-muted" />
                </div>
                <Skeleton className="h-6 w-12 shrink-0 rounded-full bg-surface-muted" />
              </div>
              <Skeleton className="h-7 w-24 max-w-full rounded-xl bg-surface-sunken" />
              <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
              <Skeleton className="h-1.5 w-full rounded-full bg-surface-sunken" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e2">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-[0.9rem] bg-surface-sunken" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 max-w-full rounded-full bg-surface-sunken" />
                  <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
                  <Skeleton className="h-3.5 w-2/3 rounded-full bg-surface-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workout manager, then the source-check row. */}
        <div className="space-y-4 rounded-[1.5rem] border border-hairline bg-surface px-5 py-5 shadow-e2 md:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-100/80" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-44 max-w-full rounded-full bg-surface-sunken" />
              <Skeleton className="h-3.5 w-64 max-w-full rounded-full bg-surface-muted" />
            </div>
          </div>
          <Skeleton className="h-11 w-full rounded-[1rem] bg-surface-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-11 rounded-[1rem] bg-surface-muted" />
            <Skeleton className="h-11 rounded-[1rem] bg-surface-muted" />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-hairline bg-surface px-5 py-5 shadow-e2 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-primary-100/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40 max-w-full rounded-full bg-surface-sunken" />
                <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Skeleton className="h-11 w-32 rounded-full bg-surface-muted" />
              <Skeleton className="h-11 w-40 rounded-full bg-surface-muted" />
            </div>
          </div>
        </div>

        <Skeleton className="h-28 rounded-[1.5rem] bg-lemon-50/80" />
      </div>
    </div>
  );
}
