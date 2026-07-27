import { cn } from "@/lib/utils/cn";
import { toneStyles, type Tone } from "@/lib/design/tones";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated" | "tinted" | "sunken";
  padding?: "none" | "sm" | "md" | "lg";
  /** Hover lift + press feedback. Only when the whole card is one target. */
  interactive?: boolean;
  /**
   * Tints the whole card to a semantic tone. Use only when the card's subject
   * IS that concept (a soreness panel, a protein breakdown) — never to
   * decorate. Overrides the variant's surface and border.
   */
  tone?: Tone;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

const variantMap = {
  default: "bg-surface border-hairline shadow-e2",
  outlined: "bg-surface/72 border-hairline",
  elevated: "bg-surface border-hairline shadow-e3",
  tinted: "bg-surface-subtle border-hairline-strong shadow-e1",
  sunken: "bg-surface-muted border-hairline",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  interactive = false,
  tone,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px]",
        tone ? toneStyles[tone].surface : cn("border", variantMap[variant]),
        paddingMap[padding],
        interactive &&
          "fw-press cursor-pointer hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-e3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
