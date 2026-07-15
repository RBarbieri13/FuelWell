import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

const variantMap = {
  default:
    "bg-white rounded-[24px] border border-border shadow-[0_12px_30px_rgba(20,90,75,0.07)]",
  outlined: "bg-white/72 rounded-[24px] border border-border",
  elevated:
    "bg-white rounded-[24px] border border-border shadow-[0_16px_38px_rgba(20,90,75,0.09)]",
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
