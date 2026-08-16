"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoFeatureCardProps {
  label: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  visual?: React.ReactNode;
  span?: "full" | "wide" | "narrow";
  className?: string;
}

const spanClasses = {
  full: "md:col-span-3",
  wide: "md:col-span-2",
  narrow: "md:col-span-1",
};

export function BentoFeatureCard({
  label,
  title,
  description,
  icon,
  visual,
  span = "narrow",
  className,
}: BentoFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-[#e7e8e8] bg-white p-6 overflow-hidden",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)]",
        "hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] hover:-translate-y-1",
        "transition-all duration-300",
        spanClasses[span],
        className
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006c49]/10 shrink-0">
            {icon}
          </div>
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#006c49] mt-3">
          {label}
        </span>
      </div>
      <h3
        className="text-xl font-bold text-[#191c1d] mb-2"
        style={{ fontFamily: "var(--v2-font-heading)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[#3c4a42] leading-relaxed mb-4">
        {description}
      </p>
      {visual && (
        <div className="mt-auto rounded-xl border border-[#e7e8e8] bg-[#f8f9fa] overflow-hidden">
          {visual}
        </div>
      )}
    </motion.div>
  );
}
