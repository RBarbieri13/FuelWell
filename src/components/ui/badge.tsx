import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md";
  /** Leading status dot. Carries the state when the label is ambiguous. */
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  default: "bg-primary-50 text-primary-800 ring-primary-100",
  success: "bg-primary-50 text-primary-700 ring-primary-100",
  warning: "bg-lemon-50 text-lemon-700 ring-lemon-100",
  error: "bg-red-50 text-red-700 ring-red-100",
  info: "bg-sky-50 text-sky-700 ring-sky-100",
  neutral: "bg-surface-muted text-ink-muted ring-hairline-strong",
};

const dotStyles = {
  default: "bg-primary-500",
  success: "bg-primary-500",
  warning: "bg-lemon-500",
  error: "bg-red-500",
  info: "bg-sky-500",
  neutral: "bg-ink-faint",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[0.6875rem] gap-1.5",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold ring-1 ring-inset",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotStyles[variant])}
        />
      )}
      {children}
    </span>
  );
}
