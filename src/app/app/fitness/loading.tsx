import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the Activity-detail route: hero, the summary tile row, then the
 * stack of activity log cards. Same rhythm as the loaded page so the first
 * paint doesn't reflow.
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
        <div className="rounded-[24px] border border-hairline bg-surface p-5 shadow-e3 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-[1rem] bg-primary-100/80" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32 rounded-full bg-surface-muted" />
                <Skeleton className="h-6 w-64 max-w-full rounded-xl bg-surface-sunken" />
                <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
              </div>
            </div>
            <Skeleton className="h-12 w-full shrink-0 rounded-full bg-primary-100/80 md:w-40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-3 rounded-[24px] border border-hairline bg-surface p-4 shadow-e2">
              <Skeleton className="h-10 w-10 rounded-[1rem] bg-surface-sunken" />
              <Skeleton className="h-7 w-20 rounded-xl bg-surface-sunken" />
              <Skeleton className="h-3.5 w-full rounded-full bg-surface-muted" />
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

        <Skeleton className="h-28 rounded-[1.5rem] bg-lemon-50/80" />
      </div>
    </div>
  );
}
