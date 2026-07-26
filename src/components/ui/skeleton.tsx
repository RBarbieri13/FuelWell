import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "fw-shimmer rounded-xl bg-surface-sunken",
        className
      )}
      aria-hidden="true"
    />
  );
}
