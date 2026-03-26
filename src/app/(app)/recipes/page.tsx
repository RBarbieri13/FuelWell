import { BookOpen } from "lucide-react";

export default function RecipesPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Recipes</h1>
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <div className="mx-auto w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">
          Recipe Collection
        </h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          Discover recipes that match your goals and dietary preferences. Save
          your favorites for quick meal logging.
        </p>
      </div>
    </div>
  );
}
