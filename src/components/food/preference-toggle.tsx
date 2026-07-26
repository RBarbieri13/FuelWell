"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePreferences } from "@/lib/use-preferences";

/**
 * Like / dislike control for a food or recipe. Persists via usePreferences so
 * the signal is shared across surfaces. `id` is the stable food/recipe id.
 *
 * Both buttons keep a >=44px tap area at every size; the visual glyph plate is
 * smaller than the hit box so a dense result row still reads as light. Set
 * states are filled and ringed rather than merely recoloured — at 16px a glyph
 * tint change alone does not survive a dense list.
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
  const liked = isLiked(id);
  const disliked = isDisliked(id);
  const dim = size === "sm" ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]";
  const base =
    "fw-press inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:h-9 md:w-9";

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label="Preference"
    >
      <button
        type="button"
        aria-pressed={liked}
        aria-label="Like this"
        title={
          liked
            ? "Liked — ranked higher in your lists. Tap to clear."
            : "Like — ranks this higher in your lists"
        }
        onClick={(e) => {
          e.preventDefault();
          toggleLike(id);
        }}
        className={cn(
          base,
          liked
            ? "bg-primary-100 text-primary-700 shadow-e1 ring-primary-300"
            : "text-ink-subtle ring-transparent hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-100 active:bg-primary-100"
        )}
      >
        <ThumbsUp className={dim} strokeWidth={liked ? 2.5 : 2} aria-hidden="true" />
      </button>
      {/* Hairline keeps the pair reading as one control without boxing it. */}
      <span aria-hidden="true" className="h-4 w-px shrink-0 bg-hairline" />
      <button
        type="button"
        aria-pressed={disliked}
        aria-label="Not for me"
        title={
          disliked
            ? "Marked not for me — ranked lower in your lists. Tap to clear."
            : "Not for me — ranks this lower in your lists"
        }
        onClick={(e) => {
          e.preventDefault();
          toggleDislike(id);
        }}
        className={cn(
          base,
          disliked
            ? "bg-surface-sunken text-ink ring-hairline-strong"
            : "text-ink-subtle ring-transparent hover:bg-surface-muted hover:text-ink-muted hover:ring-hairline active:bg-surface-sunken"
        )}
      >
        <ThumbsDown
          className={dim}
          strokeWidth={disliked ? 2.5 : 2}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
