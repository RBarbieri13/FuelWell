import { cn } from "@/lib/utils/cn";
import { toneStyles, type Tone } from "@/lib/design/tones";
import { type LucideIcon } from "lucide-react";

const sizeStyles = {
  sm: { box: "h-8 w-8 rounded-[0.7rem]", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-[0.9rem]", icon: "h-[1.125rem] w-[1.125rem]" },
  lg: { box: "h-12 w-12 rounded-[1.05rem]", icon: "h-5 w-5" },
};

/**
 * The tinted glyph square that opens most cards and rows. Centralised because
 * it was hand-rolled on nearly every screen with slightly different radii,
 * ring widths, and icon sizes — which is exactly the drift that makes an app
 * feel assembled rather than designed.
 */
export function IconPlate({
  icon: Icon,
  tone = "primary",
  size = "md",
  className,
  label,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Only set when the glyph carries meaning no adjacent text already states. */
  label?: string;
}) {
  const dims = sizeStyles[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        dims.box,
        toneStyles[tone].chip,
        className
      )}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon className={dims.icon} strokeWidth={2} />
    </span>
  );
}
