import { MessageSquare } from "lucide-react";

export default function CoachPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">AI Coach</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
          <MessageSquare className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Your AI Nutrition Coach
        </h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          Ask me anything about nutrition, meal planning, or your goals. I&apos;ll
          give you personalized advice based on your profile and progress.
        </p>
      </div>
    </div>
  );
}
