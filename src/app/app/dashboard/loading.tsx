import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner max-w-6xl space-y-4 md:space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-72 rounded-[2rem] bg-[#123d32]/85" />
        <Card variant="elevated" className="space-y-5">
          <Skeleton className="h-5 w-32 bg-primary-100/80" />
          <div className="flex justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full bg-primary-100/80" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-[1.25rem] bg-primary-50" />
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Skeleton className="mb-3 h-3 w-24 bg-primary-100/80" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-[1.25rem] bg-white/80" />
          ))}
        </div>
      </div>

      <Skeleton className="h-32 rounded-[1.75rem] bg-white/80" />
      </div>
    </div>
  );
}
