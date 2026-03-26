import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

export default function CoachPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-6">
        AI Coach
      </h1>
      <div className="bg-white rounded-2xl border border-neutral-200/80">
        <EmptyState
          icon={MessageSquare}
          title="Start a conversation"
          description="Ask me anything about nutrition, meal planning, or your goals. I'll give you personalized advice based on your profile and progress."
          action={{ label: "Ask a question", href: "#" }}
        />
      </div>
    </div>
  );
}
