import { Skeleton } from "@/components/ui/skeleton";

/**
 * Grocery-shaped placeholder: the header action pair, the mint progress
 * panel, the add-item rail, and aisle-grouped rows. Blocking out the aisle
 * headers matters — without them the list reads as one undifferentiated
 * stack and then reorganises itself when the data lands.
 */
export default function GroceryListLoading() {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-7">
          <div className="min-w-0">
            <Skeleton className="h-8 w-52 bg-primary-100/80" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full bg-primary-50" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <Skeleton className="h-12 w-full rounded-full bg-primary-200/70 sm:w-44" />
            <Skeleton className="h-12 w-full rounded-full bg-surface/90 sm:w-32" />
          </div>
        </div>
      </div>

      <div className="fw-page-inner grid gap-5 pb-28 md:pb-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-[24px] bg-primary-100/70" />
          <Skeleton className="h-28 rounded-[24px] bg-primary-950/80" />
        </div>

        <div className="max-lg:order-3">
          <div className="space-y-4 rounded-[24px] border border-hairline bg-surface px-4 py-5 shadow-e2 sm:px-6">
            <Skeleton className="h-9 w-44 bg-primary-100/70" />
            <Skeleton className="h-12 rounded-[1.1rem] bg-surface-muted" />
            <Skeleton className="h-12 rounded-[1.1rem] bg-surface-muted" />
            <Skeleton className="h-12 rounded-[1.15rem] bg-primary-100/70" />
          </div>
        </div>

        <div className="order-2 space-y-4 lg:col-span-2">
          <Skeleton className="h-28 rounded-[24px] bg-surface/80" />
          <div className="space-y-5 rounded-[24px] border border-hairline bg-surface p-2 shadow-e2 md:p-4">
            {Array.from({ length: 3 }, (_, group) => (
              <div key={group} className="space-y-2">
                <Skeleton className="h-12 rounded-[1rem] bg-surface-muted" />
                {Array.from({ length: 2 }, (_, row) => (
                  <Skeleton key={row} className="h-36 rounded-[1.15rem] bg-surface-subtle md:h-[4.25rem]" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
