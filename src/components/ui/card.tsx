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
    "bg-white rounded-[1.75rem] border border-primary-100/70 shadow-[0_20px_55px_rgba(22,48,42,0.08)]",
  outlined: "bg-white/72 rounded-[1.75rem] border border-primary-100/70",
  elevated:
    "bg-white rounded-[2rem] border border-primary-100/80 shadow-[0_28px_70px_rgba(22,48,42,0.12)]",
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
