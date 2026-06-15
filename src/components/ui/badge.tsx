import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-primary-50 text-primary-800",
  success: "bg-primary-50 text-primary-700",
  warning: "bg-lemon-50 text-[#7a650d]",
  error: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
