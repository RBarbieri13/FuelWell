"use client"

import { useEffect, useRef, useState } from "react"
import { useMotionValue, useTransform, animate, useInView } from "framer-motion"

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n))
}

export function CountUp({ end, duration = 800, suffix, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(formatNumber(latest))
    })
    return unsubscribe
  }, [motionValue])

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, end, {
      duration: duration / 1000,
      ease: "easeOut",
    })
    return controls.stop
  }, [isInView, motionValue, end, duration])

  return (
    <span ref={ref} className={className}>
      {displayValue}
      {suffix}
    </span>
  )
}