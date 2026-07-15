import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-primary-500 to-teal-500 text-white hover:from-primary-600 hover:to-teal-600 active:from-primary-700 active:to-primary-800 shadow-[0_16px_34px_rgba(21,145,108,0.24)] focus-visible:ring-primary-600",
  secondary:
    "bg-white/92 text-primary-800 border border-primary-100 hover:border-primary-200 hover:bg-primary-50 active:bg-primary-100 shadow-sm shadow-primary-900/5 focus-visible:ring-primary-600",
  ghost:
    "text-neutral-600 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-600",
  danger:
    "text-red-600 hover:bg-red-50 active:bg-red-100 focus-visible:ring-red-500",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-3 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
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
        className={cn(
          "inline-flex min-h-11 items-center justify-center font-bold rounded-[1.15rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none md:min-h-0",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
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
