"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePreferences } from "@/lib/use-preferences";

/**
 * Like / dislike control for a food or recipe. Persists via usePreferences so
 * the signal is shared across surfaces. `id` is the stable food/recipe id.
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
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const pad = size === "sm" ? "p-3.5 -m-2" : "p-2";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-pressed={isLiked(id)}
        aria-label="Like this"
        onClick={(e) => {
          e.preventDefault();
          toggleLike(id);
        }}
        className={cn(
          "rounded-full transition",
          pad,
          isLiked(id)
            ? "bg-primary-100 text-primary-700"
            : "text-neutral-400 hover:bg-neutral-100 hover:text-primary-600"
        )}
      >
        <ThumbsUp className={dim} />
      </button>
      <button
        type="button"
        aria-pressed={isDisliked(id)}
        aria-label="Not for me"
        onClick={(e) => {
          e.preventDefault();
          toggleDislike(id);
        }}
        className={cn(
          "rounded-full transition",
          pad,
          isDisliked(id)
            ? "bg-neutral-200 text-neutral-700"
            : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        )}
      >
        <ThumbsDown className={dim} />
      </button>
    </div>
  );
}
