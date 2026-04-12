"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const screens = [
  {
    label: "Dashboard",
    image: "/carousel/dashboard.png",
    alt: "FuelWell Today's Dashboard with calorie ring, macro breakdown, sleep, heart rate, and hydration",
    width: 706,
    height: 1600,
  },
  {
    label: "Nutrition",
    image: "/carousel/nutrition.png",
    alt: "FuelWell AI Insight showing smarter food decisions with harvest bowl macro breakdown",
    width: 688,
    height: 1559,
  },
  {
    label: "Workouts",
    image: "/carousel/workouts.png",
    alt: "FuelWell Hypertrophy Chest workout with bench press tracking and performance insights",
    width: 434,
    height: 1600,
  },
  {
    label: "Insights",
    image: "/carousel/insights.png",
    alt: "FuelWell Insight and Action view with weekly consistency score, HRV, sleep, and logged meals",
    width: 481,
    height: 1600,
  },
  {
    label: "Progress",
    image: "/carousel/progress.png",
    alt: "FuelWell Activity trends with daily steps, heart rate, calorie deficit, and body measurements",
    width: 494,
    height: 1600,
  },
];

export function AppCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigate = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + screens.length) % screens.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => navigate(1), 5000);
    return () => clearInterval(timer);
  }, [navigate]);

  const screen = screens[current];

  return (
    <div className="relative max-w-md mx-auto">
      {/* Glow */}
      <div className="absolute -inset-8 bg-gradient-to-br from-emerald-200/60 via-transparent to-orange-200/50 rounded-[3.5rem] blur-3xl animate-pulse-glow" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[3px] border-gray-200/80 bg-white shadow-phone overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-[22px] bg-foreground/95 rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-foreground/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
        </div>

        {/* Screen content */}
        <div className="relative h-[680px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ x: direction >= 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -300 : 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={screen.image}
                alt={screen.alt}
                width={screen.width}
                height={screen.height}
                className="w-full h-full object-cover object-top"
                priority={current === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home indicator */}
        <div className="h-6 flex items-center justify-center bg-white">
          <div className="w-28 h-1 rounded-full bg-foreground/15" />
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[-24px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-fw-border shadow-card-premium hover:shadow-lg hover:border-fw-accent/40 transition-all duration-200 z-10"
        aria-label="Previous screen"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={() => navigate(1)}
        className="absolute right-[-24px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-fw-border shadow-card-premium hover:shadow-lg hover:border-fw-accent/40 transition-all duration-200 z-10"
        aria-label="Next screen"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Tab labels */}
      <div className="flex items-center justify-center gap-3 mt-6">
        {screens.map((s, i) => (
          <button
            key={s.label}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              i === current
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-fw-surface"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}