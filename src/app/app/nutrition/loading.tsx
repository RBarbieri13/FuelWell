import { Skeleton } from "@/components/ui/skeleton";

/**
 * Nutrition detail is a grouping tray at e1 holding the hero, the four macro
 * target tiles, and the meal ledger. The generic card stack implied three
 * equal blocks, which is not what arrives — this blocks out the real tray so
 * the four-up tile row does not pop in.
 */
export default function NutritionLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-header">
        <div className="fw-page-inner py-5">
          <Skeleton className="h-8 w-56 bg-primary-100/80" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full bg-primary-50" />
        </div>
      </div>

      <div className="fw-page-inner pb-28 md:pb-8">
        <div className="space-y-4 rounded-[1.75rem] bg-surface/70 p-3 shadow-e1 md:p-4">
          <Skeleton className="h-36 rounded-[1.5rem] bg-surface md:h-28" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-32 rounded-[1.5rem] bg-surface" />
            ))}
          </div>

          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-[1.5rem] bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
