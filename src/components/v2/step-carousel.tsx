"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: 1,
    title: "Tell",
    icon: "💬",
    description: "Share your goals, preferences, dietary needs, and budget. FuelWell adapts to who you are and how you live.",
  },
  {
    number: 2,
    title: "Get",
    icon: "🍎",
    description: "Receive personalized meal suggestions, grocery lists, workout plans, and real-time coaching — all tailored to your day.",
  },
  {
    number: 3,
    title: "Track",
    icon: "📊",
    description: "See your progress clearly with trends, insights, and smart nudges that keep you moving forward without obsessing over numbers.",
  },
];

export function StepCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const scrollLeft = el.scrollLeft;
      const cardWidth = el.scrollWidth / steps.length;
      setActiveIndex(Math.round(scrollLeft / cardWidth));
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-4 md:grid md:grid-cols-3 md:overflow-visible"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {steps.map((step) => (
          <div
            key={step.number}
            className="snap-center flex-shrink-0 w-[280px] md:w-auto rounded-2xl bg-white border border-[#e7e8e8] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ background: "linear-gradient(135deg, #006c49, #10b981)" }}>
                <span className="text-white font-bold text-lg">{step.number}</span>
              </div>
              <span className="text-3xl">{step.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1d] mb-2" style={{ fontFamily: "var(--v2-font-heading)" }}>
              {step.title}
            </h3>
            <p className="text-sm text-[#3c4a42] leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination dots — mobile only */}
      <div className="flex items-center justify-center gap-2 mt-4 md:hidden">
        {steps.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => {
              scrollRef.current?.children[i]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              });
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === activeIndex ? "w-6 bg-[#10b981]" : "w-2 bg-[#e7e8e8]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
