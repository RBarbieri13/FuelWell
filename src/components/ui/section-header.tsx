import { cn } from "@/lib/utils/cn";
import { type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Small tinted glyph plate to the left of the title. */
  icon?: LucideIcon;
  /** Uppercase kicker above the title, for grouping related sections. */
  eyebrow?: string;
  /** Trailing control — a link, button, or badge. */
  action?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}

/**
 * The title / supporting-copy / trailing-action row that opens nearly every
 * card and section. Centralised so spacing and type scale stay identical
 * across screens instead of drifting per page.
 */
export function SectionHeader({
  title,
  description,
  icon: Icon,
  eyebrow,
  action,
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-3 gap-y-2",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              {eyebrow}
            </p>
          )}
          <Heading
            className={cn(
              "font-black text-ink",
              Heading === "h2" ? "text-xl" : "text-base",
              eyebrow && "mt-0.5"
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
