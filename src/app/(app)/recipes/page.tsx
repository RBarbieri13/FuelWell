import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

export default function RecipesPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-6">
        Recipes
      </h1>
      <div className="bg-white rounded-2xl border border-neutral-200/80">
        <EmptyState
          icon={BookOpen}
          title="Your recipe collection is empty"
          description="Discover recipes that match your goals and dietary preferences. Save your favorites for quick meal logging."
          action={{ label: "Browse recipes", href: "#" }}
        />
      </div>
    </div>
  );
}
