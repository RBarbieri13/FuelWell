"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  alt: string;
  width: number;
  height: number;
};

const SLIDES: Slide[] = [
  {
    image: "/features/showcase-muscle-mastery.png",
    alt: "FuelWell Muscle Mass Mastery desktop dashboard with lean mass target, performance roadmap, and optimization alerts",
    width: 1239,
    height: 1600,
  },
  {
    image: "/features/showcase-dine-out.png",
    alt: "FuelWell Smart Menu Scanner with AI food detection, macro insights, meal summary, and allergen alerts",
    width: 1600,
    height: 1280,
  },
  {
    image: "/features/showcase-smart-food-v2.png",
    alt: "FuelWell smarter food decisions with AI-powered meal analysis, macro tracking, and harvest bowl breakdown",
    width: 256,
    height: 1600,
  },
  {
    image: "/features/showcase-supplements.png",
    alt: "FuelWell precision supplement dashboard with nutrient absorption timeline, daily stack, and optimization process",
    width: 1423,
    height: 1600,
  },
  {
    image: "/features/showcase-withings.png",
    alt: "Withings Health Mate integration showing body composition tracking and muscle mass goals",
    width: 706,
    height: 1600,
  },
];

export function AppScreensCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + SLIDES.length) % SLIDES.length);
    },
    [],
  );

  const slide = SLIDES[current];
  const isWide = slide.width >= slide.height;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative flex items-center gap-3 md:gap-6">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous image"
          className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border-2 border-fw-border bg-white shadow-card hover:border-fw-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 z-10"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Image container */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ x: direction >= 0 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex justify-center w-full"
            >
              <div
                className={cn(
                  "rounded-2xl overflow-hidden shadow-card-premium border border-fw-border/60",
                  isWide ? "w-full" : "max-h-[600px] md:max-h-[700px]",
                )}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  className={cn(
                    "object-contain",
                    isWide ? "w-full h-auto" : "h-[600px] md:h-[700px] w-auto mx-auto",
                  )}
                  priority={current === 0}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next image"
          className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border-2 border-fw-border bg-white shadow-card hover:border-fw-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 z-10"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            aria-label={`Go to image ${i + 1}`}
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
  );
}
