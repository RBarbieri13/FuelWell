"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradientButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: "default" | "sm" | "lg"
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  "aria-label"?: string
}

const sizeClasses = {
  lg: "min-h-14 px-9 text-base sm:px-10 sm:text-lg",
  default: "min-h-12 px-7 text-[15px] sm:px-8 sm:text-base",
  sm: "min-h-11 px-5 text-sm sm:px-6",
}

export function GradientButton({
  children,
  href,
  onClick,
  className,
  size = "default",
  type = "button",
  disabled,
  "aria-label": ariaLabel,
}: GradientButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center",
    "bg-gradient-to-r from-emerald-500 to-teal-500",
    "text-white font-semibold rounded-[0.875rem] shadow-card",
    "hover:shadow-card-hover hover:from-emerald-600 hover:to-teal-600",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-[background-color,box-shadow,transform] duration-200",
    sizeClasses[size],
    className
  )

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-flex max-w-full"
      >
        <Link href={href} className={baseClasses} aria-label={ariaLabel}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={baseClasses}
    >
      {children}
    </motion.button>
  )
}
