"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradientButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  size?: "default" | "sm"
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  "aria-label"?: string
}

const sizeClasses = {
  default: "h-12 px-8 text-base",
  sm: "h-10 px-6 text-sm",
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
    "text-white font-semibold rounded-xl shadow-md",
    "hover:shadow-lg hover:from-emerald-600 hover:to-teal-600",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-all duration-200",
    sizeClasses[size],
    className
  )

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-block"
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
