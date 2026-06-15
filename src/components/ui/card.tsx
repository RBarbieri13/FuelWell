import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variantMap = {
  default:
    "bg-white/88 rounded-2xl border border-primary-100/80 shadow-sm shadow-primary-900/5",
  outlined: "bg-white/58 rounded-2xl border border-primary-100/70",
  elevated:
    "bg-white rounded-2xl border border-primary-100/90 shadow-xl shadow-primary-900/10",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantMap[variant], paddingMap[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
