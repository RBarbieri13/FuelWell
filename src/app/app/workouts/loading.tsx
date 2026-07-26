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
        {/* Coach recommends — the dark hero */}
        <div className="rounded-[24px] bg-[#123d32]/90 p-5 shadow-e3 sm:p-7">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-[13px] bg-white/15" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-48 max-w-full rounded-full bg-white/15" />
              <Skeleton className="h-3.5 w-full rounded-full bg-white/10" />
              <Skeleton className="h-3.5 w-3/4 rounded-full bg-white/10" />
            </div>
          </div>
          <Skeleton className="mt-5 h-28 rounded-[20px] bg-white/10" />
          <Skeleton className="mt-3 h-12 rounded-[1.15rem] bg-white/15" />
        </div>

        {/* Pick my own / Activity */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="space-y-3 rounded-[20px] border border-hairline bg-surface p-3 shadow-e1 sm:rounded-[24px] sm:p-6"
            >
              <Skeleton className="h-9 w-9 rounded-[12px] bg-surface-sunken sm:h-10 sm:w-10" />
              <Skeleton className="h-4 w-24 max-w-full rounded-full bg-surface-sunken" />
              <Skeleton className="hidden h-3.5 w-full rounded-full bg-surface-muted sm:block" />
              <Skeleton className="h-11 w-full rounded-[1.15rem] bg-surface-sunken" />
            </div>
          ))}
        </div>

        <Skeleton className="h-24 rounded-[20px] bg-lemon-50/80" />
      </div>
    </div>
  );
}
