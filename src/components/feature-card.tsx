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
        "fw-marketing-card group relative overflow-hidden p-6 transition-[border-color,box-shadow,transform] duration-300 sm:p-7",
        "hover:-translate-y-1 hover:shadow-card-hover hover:border-fw-accent/30",
        "flex flex-col h-full",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fw-orange via-fw-accent to-fw-info opacity-80" />

      {premium && (
        <Badge className="absolute right-4 top-4 border-emerald-200 bg-emerald-50 text-xs font-bold uppercase tracking-wide text-emerald-700">
          Premium
        </Badge>
      )}

      {/* Visual / infographic area */}
      {visual && (
        <div className="mb-5 rounded-xl bg-gradient-to-br from-fw-surface via-white to-fw-surface/80 border border-fw-border/40 p-4 overflow-hidden group-hover:border-fw-accent/20 transition-all duration-300 relative shadow-sm">
          <div className="absolute inset-0 noise opacity-30 pointer-events-none" />
          {visual}
        </div>
      )}

      <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50 group-hover:ring-2 group-hover:ring-emerald-300/60 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all duration-300 shadow-sm">
        <Icon className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="mb-2.5 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-base leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
