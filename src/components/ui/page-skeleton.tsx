import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic route-transition skeleton matching the fw-page-header + card-stack
 * shape most /app pages share. Route loading.tsx files render this so slow
 * navigations show a pending state instead of a frozen previous page.
 */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-header">
        <div className="fw-page-inner py-5">
          <Skeleton className="h-8 w-56 bg-primary-100/80" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full bg-primary-50" />
        </div>
      </div>
      <div className="fw-page-inner space-y-6 pb-28 md:pb-8">
        {Array.from({ length: cards }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-[1.5rem] bg-white/80" />
        ))}
      </div>
    </div>
  );
}
