import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-6">
        Progress
      </h1>
      <div className="bg-white rounded-2xl border border-neutral-200/80">
        <EmptyState
          icon={TrendingUp}
          title="Not enough data yet"
          description="Start logging meals to see your nutrition trends, weight changes, and goal streaks over time. Charts unlock after 3 days of tracking."
          action={{ label: "Log a meal to start", href: "/app/log" }}
        />
      </div>
    </div>
  );
}
