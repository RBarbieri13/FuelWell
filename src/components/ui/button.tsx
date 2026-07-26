import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tonal" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-gradient-to-b from-primary-500 to-teal-600 text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 active:from-primary-700 active:to-primary-800 active:shadow-e1 focus-visible:ring-primary-600",
  secondary:
    "bg-surface/92 text-primary-800 border border-primary-100 shadow-e1 hover:border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-600",
  tonal:
    "bg-primary-50 text-primary-800 hover:bg-primary-100 active:bg-primary-200 focus-visible:ring-primary-600",
  ghost:
    "text-ink-muted hover:bg-primary-50 hover:text-primary-800 active:bg-primary-100 focus-visible:ring-primary-600",
  danger:
    "text-red-600 hover:bg-red-50 active:bg-red-100 focus-visible:ring-red-500",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-3 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
  icon: "h-11 w-11 p-0 shrink-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "fw-press inline-flex min-h-11 select-none items-center justify-center rounded-[1.15rem] font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:min-h-0",
          size === "icon" && "min-h-11 rounded-[1rem] md:min-h-11",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="-ml-0.5 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
