import { Skeleton } from "@/components/ui/skeleton";

/**
 * Chat-shaped route skeleton. The generic page skeleton shows a stack of equal
 * cards, which does not match this route at all — the pending state now mirrors
 * the real coach layout (header rail, alternating bubbles, pinned composer) so
 * the transition lands on the same silhouette instead of reflowing.
 */
export default function CoachLoading() {
  return (
    <div className="fw-coach-page flex h-full flex-col" aria-busy="true">
      <div className="fw-page-header px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-[1.25rem] bg-primary-100/80" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-5 w-24 bg-primary-100/70" />
              <Skeleton className="h-3 w-44 max-w-full bg-primary-50" />
            </div>
          </div>
          <Skeleton className="hidden h-9 w-28 shrink-0 rounded-full bg-surface/80 sm:block" />
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden px-3 pt-5 sm:px-4 sm:pt-6 md:px-8">
        <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5">
          <Skeleton className="h-40 rounded-[2rem] bg-[#123d32]/80 md:h-52" />

          {/* Two turns of the conversation: assistant left with avatar, user
              right. Widths taper so the block reads as speech, not as bars. */}
          <div className="flex min-w-0 gap-2 sm:gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-2xl bg-primary-100/80" />
            <div className="w-full max-w-[85%] space-y-2 rounded-[1.5rem] rounded-bl-md bg-surface/80 p-3 shadow-e1 sm:p-4">
              <Skeleton className="h-3 w-11/12 bg-surface-sunken" />
              <Skeleton className="h-3 w-9/12 bg-surface-sunken" />
              <Skeleton className="h-3 w-6/12 bg-surface-sunken" />
            </div>
          </div>

          <div className="flex min-w-0 justify-end gap-2 sm:gap-3">
            <Skeleton className="h-12 w-52 max-w-[70%] rounded-3xl rounded-br-md bg-primary-200/70" />
            <Skeleton className="h-8 w-8 shrink-0 rounded-2xl bg-primary-100/80" />
          </div>

          <div className="flex min-w-0 gap-2 sm:gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-2xl bg-primary-100/80" />
            <Skeleton className="h-24 w-full max-w-[85%] rounded-[1.5rem] rounded-bl-md bg-surface/80" />
          </div>
        </div>
      </div>

      <div className="border-t border-hairline bg-surface/88 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Skeleton className="h-12 w-12 shrink-0 rounded-[1.35rem] bg-primary-50" />
          <Skeleton className="h-12 min-w-0 flex-1 rounded-[1.35rem] bg-primary-50" />
          <Skeleton className="h-12 w-12 shrink-0 rounded-[1.15rem] bg-primary-200/70" />
        </div>
      </div>
    </div>
  );
}
