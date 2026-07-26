import { Skeleton } from "@/components/ui/skeleton";

/**
 * Recipes has no fw-page-header — it opens straight into a dark hero panel
 * inside a centred column. The generic PageSkeleton drew a header bar that
 * never arrives, so the page visibly jumped on hydration; this mirrors the
 * real layout instead.
 */
export default function RecipesLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="mx-auto max-w-6xl space-y-6 p-4 pb-28 md:p-8">
        {/* Dark library hero */}
        <Skeleton className="h-64 rounded-[24px] bg-primary-950/80 md:h-56" />

        {/* Search + meal filter + diet chips card */}
        <div className="space-y-5 rounded-[24px] border border-hairline bg-surface p-6 shadow-e2">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Skeleton className="h-14 rounded-[1.3rem] bg-surface-muted" />
            <Skeleton className="h-14 w-full rounded-[1.35rem] bg-surface-sunken lg:w-80" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full bg-surface-muted" />
            ))}
          </div>
        </div>

        {/* Result count row */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-40 bg-primary-100/70" />
          <Skeleton className="h-6 w-28 rounded-full bg-sky-100/70" />
        </div>

        {/* Recipe grid — same 1 / 2 / 3 column rhythm as the real cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[24px] border border-hairline bg-surface shadow-e2"
            >
              <div className="space-y-3 border-b border-hairline bg-surface-subtle px-5 py-4">
                <div className="flex gap-1.5">
                  <Skeleton className="h-6 w-20 rounded-full bg-primary-100/80" />
                  <Skeleton className="h-6 w-16 rounded-full bg-surface-muted" />
                </div>
                <Skeleton className="h-6 w-3/4 bg-primary-100/60" />
              </div>
              <div className="space-y-3 px-5 pb-5 pt-4">
                <div className="grid grid-cols-2 gap-1.5 min-[400px]:grid-cols-4">
                  {Array.from({ length: 4 }, (_, tile) => (
                    <Skeleton key={tile} className="h-14 rounded-[1rem] bg-surface-muted" />
                  ))}
                </div>
                <Skeleton className="h-1.5 rounded-full bg-surface-sunken" />
                <Skeleton className="h-11 rounded-[1.1rem] bg-surface-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
