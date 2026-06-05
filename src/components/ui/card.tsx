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
  default: "bg-white/90 rounded-2xl border border-white/80 shadow-sm shadow-neutral-200/70",
  outlined: "bg-white/55 rounded-2xl border border-neutral-200/80",
  elevated:
    "bg-white rounded-2xl border border-white/90 shadow-xl shadow-neutral-300/35",
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
