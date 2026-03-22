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
  visual?: React.ReactNode;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  premium = false,
  className,
  visual,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-fw-border bg-white p-6 transition-all duration-300 shadow-card",
        "hover:-translate-y-1 hover:shadow-card-hover hover:border-fw-accent/40",
        "flex flex-col h-full",
        className
      )}
    >
      {premium && (
        <Badge className="absolute top-4 right-4 bg-violet-100 text-violet-600 border-violet-200 text-[10px] uppercase tracking-wider font-semibold">
          Premium
        </Badge>
      )}

      {/* Visual / infographic area */}
      {visual && (
        <div className="mb-5 rounded-xl bg-gradient-to-br from-fw-surface to-white border border-fw-border/50 p-4 overflow-hidden group-hover:border-fw-accent/20 transition-colors duration-300">
          {visual}
        </div>
      )}

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50 group-hover:ring-emerald-300 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300">
        <Icon className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
