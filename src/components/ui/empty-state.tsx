import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { type LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  /** Lower-commitment escape hatch shown beside the primary action. */
  secondaryAction?: EmptyStateAction;
  /** "inline" trims the vertical padding for empties nested inside a card. */
  size?: "default" | "inline";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 text-center",
        size === "inline" ? "py-10" : "py-16",
        className
      )}
    >
      <div className="relative mb-5">
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[1.6rem] bg-primary-100/60 blur-lg"
        />
        <span className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-primary-100 bg-gradient-to-br from-primary-50 to-surface text-primary-600 shadow-e1">
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>
      </div>
      <h2 className="mb-1.5 text-lg font-black text-ink">{title}</h2>
      <p className="max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex w-full max-w-xs flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          {action && (
            <Link
              href={action.href}
              className="fw-press inline-flex min-h-11 w-full select-none items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-b from-primary-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 active:from-primary-700 active:to-primary-800 active:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="fw-press inline-flex min-h-11 w-full select-none items-center justify-center gap-2 rounded-[1.15rem] border border-primary-100 bg-surface/92 px-4 py-3 text-sm font-bold text-primary-800 shadow-e1 hover:border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
