"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  premium?: boolean;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  premium = false,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-fw-border bg-fw-elevated p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-fw-accent",
        className,
      )}
    >
      {premium && (
        <Badge className="absolute top-4 right-4 bg-fw-premium text-white border-none">
          Premium
        </Badge>
      )}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-fw-accent/10">
        <Icon className="h-5 w-5 text-fw-accent" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
