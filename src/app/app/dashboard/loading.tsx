import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="fw-app-surface min-h-full" role="status" aria-busy="true">
      <span className="sr-only">Loading your dashboard</span>

      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-3 py-4 md:gap-4 md:py-6">
          <Skeleton className="h-7 w-56 max-w-full rounded-full bg-primary-100/80" />
          <Skeleton className="h-4 w-40 max-w-full rounded-full bg-primary-100/60" />
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        {/* Mirrors the real hero + plate split so the layout does not jump when
            the data lands. */}
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.32fr_1fr]">
          <Skeleton className="h-64 rounded-[24px] bg-primary-900/85 md:h-72" />
          <Card className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-full bg-primary-100/80" />
                <Skeleton className="h-3 w-40 rounded-full bg-primary-100/60" />
              </div>
              <Skeleton className="h-6 w-28 shrink-0 rounded-full bg-primary-100/70" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-[10.75rem] w-[10.75rem] rounded-full bg-primary-100/80" />
            </div>
            <div className="space-y-3 rounded-[1.25rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-full bg-primary-100/70" />
                  <Skeleton className="h-2.5 w-full rounded-full bg-primary-100/60" />
                </div>
              ))}
            </div>
            <Skeleton className="h-11 w-full rounded-[1.15rem] bg-primary-50" />
          </Card>
        </div>

        <div>
          <Skeleton className="mb-3 h-5 w-32 rounded-full bg-primary-100/80" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[4.5rem] rounded-[1.4rem] bg-surface/80" />
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          {[1, 2].map((column) => (
            <Card key={column} className="space-y-4">
              <Skeleton className="h-5 w-36 rounded-full bg-primary-100/80" />
              <div className="space-y-2">
                {[1, 2, 3].map((row) => (
                  <Skeleton
                    key={row}
                    className="h-[3.75rem] rounded-[1.25rem] bg-surface-muted"
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="space-y-4">
          <Skeleton className="h-5 w-28 rounded-full bg-primary-100/80" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[4.5rem] rounded-[1.25rem] bg-surface-muted" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
