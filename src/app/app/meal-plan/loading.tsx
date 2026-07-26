import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the meal-plan layout: page header with the day/week switch, the
 * plan-quality + grocery-readiness pair, then the 20rem day rail beside the
 * slot list. Matching the real column widths keeps the route swap from
 * reflowing when the data lands.
 */
export default function MealPlanLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between md:py-7">
          <div>
            <Skeleton className="h-8 w-48 bg-primary-100/80" />
            <Skeleton className="mt-2 h-4 w-80 max-w-full bg-primary-50" />
          </div>
          <Skeleton className="h-12 w-48 rounded-full bg-surface/90" />
        </div>
      </div>

      <div className="fw-page-inner space-y-4 pb-28 md:space-y-6 md:pb-8">
        <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Skeleton className="h-80 rounded-[24px] bg-primary-950/80" />
          <div className="space-y-5 rounded-[24px] border border-hairline bg-surface p-5 shadow-e3 md:p-6">
            <Skeleton className="h-6 w-52 bg-primary-100/70" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-[1.25rem] bg-surface-muted" />
              <Skeleton className="h-20 rounded-[1.25rem] bg-surface-muted" />
            </div>
            <Skeleton className="h-12 rounded-[1.15rem] bg-primary-100/70" />
            <Skeleton className="h-12 rounded-[1.1rem] bg-surface-muted" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <div className="h-fit space-y-2 rounded-[24px] border border-hairline bg-surface px-5 py-5 shadow-e2">
            <Skeleton className="mb-4 h-6 w-32 bg-primary-100/70" />
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-[1.25rem] bg-surface-subtle" />
            ))}
          </div>
          <div className="space-y-3 rounded-[24px] border border-hairline bg-surface p-5 shadow-e3 md:p-6">
            <Skeleton className="h-8 w-56 bg-primary-100/70" />
            <Skeleton className="h-16 rounded-[1.15rem] bg-primary-50" />
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-32 rounded-[1.45rem] bg-surface-subtle" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
