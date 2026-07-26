"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePreferences } from "@/lib/use-preferences";

/**
 * Like / dislike control for a food or recipe. Persists via usePreferences so
 * the signal is shared across surfaces. `id` is the stable food/recipe id.
 *
 * Both buttons keep a >=44px tap area at every size; the visual glyph plate is
 * smaller than the hit box so a dense result row still reads as light.
 */
export function PreferenceToggle({
  id,
  size = "md",
  className,
}: {
  id: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { isLiked, isDisliked, toggleLike, toggleDislike } = usePreferences();
  const dim = size === "sm" ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]";
  const base =
    "fw-press inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:h-9 md:w-9";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-pressed={isLiked(id)}
        aria-label="Like this"
        title="Like — ranks this higher in your lists"
        onClick={(e) => {
          e.preventDefault();
          toggleLike(id);
        }}
        className={cn(
          base,
          isLiked(id)
            ? "bg-primary-100 text-primary-700 ring-primary-200"
            : "text-ink-faint ring-transparent hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-100 active:bg-primary-100"
        )}
      >
        <ThumbsUp className={dim} strokeWidth={isLiked(id) ? 2.5 : 2} />
      </button>
      <button
        type="button"
        aria-pressed={isDisliked(id)}
        aria-label="Not for me"
        title="Not for me — ranks this lower in your lists"
        onClick={(e) => {
          e.preventDefault();
          toggleDislike(id);
        }}
        className={cn(
          base,
          isDisliked(id)
            ? "bg-surface-sunken text-ink ring-hairline-strong"
            : "text-ink-faint ring-transparent hover:bg-surface-muted hover:text-ink-muted hover:ring-hairline active:bg-surface-sunken"
        )}
      >
        <ThumbsDown className={dim} strokeWidth={isDisliked(id) ? 2.5 : 2} />
      </button>
    </div>
  );
}
