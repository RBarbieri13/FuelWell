import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-shaped placeholder. The generic PageSkeleton showed three identical
 * slabs, which reads as "something broke" on a page whose real first paint is
 * one tall dark panel above two short cards. Matching the real geometry keeps
 * the layout from jumping when the content lands.
 */
export default function WorkoutsLoading() {
  return (
    <div className="fw-app-surface min-h-full" aria-busy="true">
      <div className="fw-page-header">
        <div className="fw-page-inner py-5 md:py-7">
          <Skeleton className="h-8 w-40 rounded-2xl bg-primary-100/80 md:h-10 md:w-56" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full rounded-full bg-primary-50" />
        </div>
      </div>

      <div className="fw-page-inner space-y-4 pb-28 md:space-y-6 md:pb-8">
        {/* Coach recommends — the dark hero. Uses the real panel treatment so
            the first paint has the same depth and colour as the loaded card. */}
        <div className="fw-dark-panel overflow-hidden rounded-[24px] border px-5 py-6 shadow-e4 ring-1 ring-inset ring-primary-300/25 sm:px-7 sm:py-7">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-[0.9rem] bg-white/15" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-48 max-w-full rounded-full bg-white/15" />
              <Skeleton className="h-3.5 w-full rounded-full bg-white/10" />
              <Skeleton className="h-3.5 w-3/4 rounded-full bg-white/10" />
            </div>
          </div>
          {/* Recommended-pick plate: icon, title, chip row, two option rows. */}
          <div className="mt-5 space-y-3 rounded-[20px] bg-white/10 p-4 ring-1 ring-inset ring-white/12">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-[0.9rem] bg-white/15" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40 max-w-full rounded-full bg-white/15" />
                <div className="flex flex-wrap gap-1.5">
                  <Skeleton className="h-5 w-16 rounded-full bg-white/12" />
                  <Skeleton className="h-5 w-20 rounded-full bg-white/12" />
                  <Skeleton className="h-5 w-24 rounded-full bg-white/12" />
                </div>
              </div>
            </div>
            <Skeleton className="h-11 rounded-[0.95rem] bg-white/10" />
            <Skeleton className="h-11 rounded-[0.95rem] bg-white/10" />
          </div>
          <Skeleton className="mt-3 h-12 rounded-[1.15rem] bg-white/20" />
          <Skeleton className="mt-3 h-11 rounded-[1.15rem] bg-white/12" />
        </div>

        {/* Pick my own / Activity */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-[20px] border border-hairline bg-surface px-3 py-4 shadow-e2 sm:gap-4 sm:rounded-[24px] sm:px-6 sm:py-6"
            >
              <Skeleton className="h-9 w-9 rounded-[0.8rem] bg-surface-sunken sm:h-10 sm:w-10 sm:rounded-[0.9rem]" />
              <Skeleton className="h-4 w-24 max-w-full rounded-full bg-surface-sunken" />
              <Skeleton className="hidden h-3.5 w-full rounded-full bg-surface-muted sm:block" />
              <Skeleton className="mt-auto h-11 w-full rounded-[1.15rem] bg-surface-sunken" />
            </div>
          ))}
        </div>

        <Skeleton className="h-24 rounded-[20px] bg-lemon-50/80" />
      </div>
    </div>
  );
}
