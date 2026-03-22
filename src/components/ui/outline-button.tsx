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
      className="inline-block"
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center justify-center h-12 px-8 text-base font-medium rounded-xl",
          "border border-fw-border bg-white text-foreground shadow-sm",
          "hover:bg-fw-surface hover:border-fw-accent/40",
          "transition-all duration-200",
          className
        )}
      >
        {children}
      </Link>
    </motion.div>
  )
}
