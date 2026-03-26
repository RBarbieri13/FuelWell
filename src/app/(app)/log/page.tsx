import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed } from "lucide-react";

export default function LogPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-6">
        Log Meal
      </h1>
      <div className="bg-white rounded-2xl border border-neutral-200/80">
        <EmptyState
          icon={UtensilsCrossed}
          title="No meals logged today"
          description="Search for foods, snap a photo, or scan a barcode to quickly log what you're eating. Your first meal starts your daily streak!"
          action={{ label: "Log your first meal", href: "#" }}
        />
      </div>
    </div>
  );
}
