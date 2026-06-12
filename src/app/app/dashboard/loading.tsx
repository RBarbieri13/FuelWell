import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      {/* Hero + Today's plate */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-72 rounded-2xl bg-neutral-900/80" />
        <Card className="space-y-5">
          <Skeleton className="h-5 w-32" />
          <div className="flex justify-center">
            <Skeleton className="w-[200px] h-[200px] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Coach insight */}
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
}
