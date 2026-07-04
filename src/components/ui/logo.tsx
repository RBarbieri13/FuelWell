import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ href = "/", size = "md", className }: LogoProps) {
  const content = (
    <span
      className={cn(
        "font-heading font-black tracking-tight",
        sizeStyles[size],
        className
      )}
    >
      <span className="text-neutral-900">Fuel</span>
      <span className="text-primary-600">Well</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="FuelWell home">
        {content}
      </Link>
    );
  }

  return content;
}
