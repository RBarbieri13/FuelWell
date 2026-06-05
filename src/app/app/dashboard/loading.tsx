import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Greeting skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Ring + Macros */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="flex items-center justify-center py-8">
          <Skeleton className="w-[200px] h-[200px] rounded-full" />
        </Card>
        <Card className="space-y-5">
          <Skeleton className="h-3 w-16" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
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
