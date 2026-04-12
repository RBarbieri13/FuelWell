"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  alt: string;
  title: string;
  description: string;
  tag: string;
};

const SLIDES: Slide[] = [
  {
    image: "/features/stitch-precision-workout.png",
    alt: "FuelWell precision workout system with optimized training, injury prevention, and recovery tracking",
    title: "Achieve your fitness goals",
    description:
      "Pre-workout prep, optimized training, injury prevention, and recovery tracking — all tuned to your body's signals.",
    tag: "Precision Workouts",
  },
  {
    image: "/features/stitch-precision-support.png",
    alt: "FuelWell supplement advisor with targeted support and scientific backing",
    title: "Optimize with precision support",
    description:
      "Get wellness recommendations backed by science — targeted support, simplified choices, only what your body actually needs.",
    tag: "Smart Supplements",
  },
  {
    image: "/features/stitch-nutrition-goals.png",
    alt: "FuelWell nutrition intelligence with goal alignment, nutrient balance, and habit formation",
    title: "Master your nutrition goals",
    description:
      "Personalized nutrition intelligence that balances goals, nutrients, and habits — then tracks your progress week over week.",
    tag: "Nutrition IQ",
  },
  {
    image: "/features/stitch-dine-out.png",
    alt: "FuelWell AI nutrition guide for dining out with allergen alerts and macro insights",
    title: "Dine out with confidence",
    description:
      "Turn any menu into a personalized wellness guide. Allergen alerts, macro insights, and dietary compliance — every time.",
    tag: "Dining Out",
  },
];

export function StitchCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + SLIDES.length) % SLIDES.length);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative rounded-3xl border-2 border-fw-border bg-gradient-to-br from-emerald-50/50 via-white to-violet-50/40 p-6 md:p-10 shadow-card-premium overflow-hidden">
        {/* Decorative background orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-violet-200/25 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-8 md:gap-10">
          {/* Device frame — tablet / widescreen */}
          <div className="flex justify-center">
            <div className="w-full max-w-3xl relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  initial={{ x: direction >= 0 ? 60 : -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction >= 0 ? -60 : 60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {/* Tablet-style bezel */}
                  <div className="rounded-[1.75rem] border-[10px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                    <div className="relative w-full aspect-[4/3] bg-white flex items-center justify-center rounded-[0.6rem] overflow-hidden">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        width={279}
                        height={1600}
                        sizes="(min-width: 768px) 720px, 100vw"
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Text + controls */}
          <div className="text-center max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-fw-accent/10 border border-fw-accent/20 px-3 py-1 text-xs font-bold text-fw-accent uppercase tracking-wider mb-4">
                  <Sparkles className="h-3 w-3" />
                  {slide.tag}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {slide.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-[1.7] mx-auto">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-7">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-fw-border bg-white shadow-card hover:border-fw-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-fw-border bg-white shadow-card hover:border-fw-accent/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>

              <div className="flex items-center gap-1.5 ml-3">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === current ? "w-8 bg-fw-accent" : "w-2 bg-fw-border hover:bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>

              <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
                {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
