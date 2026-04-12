"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Screen = {
  image: string;
  alt: string;
  title: string;
  width: number;
  height: number;
};

const SCREENS: Screen[] = [
  {
    image: "/features/screen-dashboard.png",
    alt: "FuelWell dashboard showing daily calorie ring, macro breakdown, sleep, heart rate, and hydration",
    title: "Today's Dashboard",
    width: 706,
    height: 1600,
  },
  {
    image: "/features/screen-activity.png",
    alt: "FuelWell activity page with daily steps, calorie deficit, body weight, fat mass, and heart rate trends",
    title: "Activity Tracking",
    width: 494,
    height: 1600,
  },
  {
    image: "/features/screen-workout.png",
    alt: "FuelWell hypertrophy workout with set logging, bench press animation, and performance insights",
    title: "Workout Logging",
    width: 434,
    height: 1600,
  },
  {
    image: "/features/screen-insights.png",
    alt: "FuelWell daily insight and action page with personalized tips, consistency score, and meal log",
    title: "Insight & Action",
    width: 481,
    height: 1600,
  },
  {
    image: "/features/screen-nutrition.png",
    alt: "FuelWell AI nutrition insight with smart food decisions, macro breakdown, and harvest bowl recipe",
    title: "AI Nutrition",
    width: 688,
    height: 1559,
  },
];

export function AppScreensCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + SCREENS.length) % SCREENS.length);
    },
    [],
  );

  const screen = SCREENS[current];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative flex flex-col items-center gap-6">
        {/* Phone frame with animated slide */}
        <div className="relative flex items-center gap-4 md:gap-8">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous screen"
            className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border-2 border-fw-border bg-white shadow-card hover:border-fw-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          {/* Phone */}
          <div className="w-[280px] md:w-[320px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ x: direction >= 0 ? 80 : -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction >= 0 ? -80 : 80, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                  <div className="rounded-[2rem] overflow-hidden bg-white">
                    <Image
                      src={screen.image}
                      alt={screen.alt}
                      width={screen.width}
                      height={screen.height}
                      className="w-full h-[560px] md:h-[640px] object-cover object-top"
                      priority={current === 0}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next screen"
            className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border-2 border-fw-border bg-white shadow-card hover:border-fw-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Title + dot indicators */}
        <div className="flex flex-col items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={current}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-lg md:text-xl font-semibold text-foreground"
            >
              {screen.title}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {SCREENS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                aria-label={`Go to screen ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === current
                    ? "w-8 bg-fw-accent"
                    : "w-2 bg-fw-border hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
