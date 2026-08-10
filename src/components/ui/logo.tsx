import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "inverse";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-[8.75rem]",
  md: "h-9 w-[9.75rem]",
  lg: "h-11 w-[11.75rem]",
};

const imageSizes = {
  sm: "140px",
  md: "156px",
  lg: "188px",
};

export function Logo({
  href = "/",
  size = "md",
  tone = "default",
  className,
}: LogoProps) {
  const content = (
    <span
      className={cn(
        "relative block shrink-0",
        sizeStyles[size],
        className
      )}
    >
      <Image
        src={
          tone === "inverse"
            ? "/brand/fuelwell-lockup-ondark.png"
            : "/brand/fuelwell-lockup.png"
        }
        alt="FuelWell"
        fill
        sizes={imageSizes[size]}
        className="object-contain object-left"
        priority={size === "lg"}
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="FuelWell home"
        className="inline-flex min-h-11 items-center md:min-h-0"
      >
        {content}
      </Link>
    );
  }

  return content;
}
