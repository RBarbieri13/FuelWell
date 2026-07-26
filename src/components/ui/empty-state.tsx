import Link from "next/link";
import { Button } from "@/components/ui/button";
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
            <Link href={action.href} className="sm:w-auto">
              <Button className="w-full">{action.label}</Button>
            </Link>
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href} className="sm:w-auto">
              <Button variant="secondary" className="w-full">
                {secondaryAction.label}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
