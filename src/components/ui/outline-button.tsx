"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface OutlineButtonProps {
  children: React.ReactNode
  href: string
  className?: string
}

export function OutlineButton({ children, href, className }: OutlineButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="inline-flex max-w-full"
    >
      <Link
        href={href}
        className={cn(
          "inline-flex min-h-12 items-center justify-center px-7 text-[15px] font-semibold rounded-[0.875rem] sm:px-8 sm:text-base",
          "border border-fw-border bg-white text-foreground shadow-sm",
          "hover:bg-fw-surface hover:border-fw-accent/40",
          "transition-[background-color,border-color,box-shadow,transform] duration-200",
          className
        )}
      >
        {children}
      </Link>
    </motion.div>
  )
}
