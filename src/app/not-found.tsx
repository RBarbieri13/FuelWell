"use client";

import { GradientButton } from "@/components/ui/gradient-button";
import { OutlineButton } from "@/components/ui/outline-button";
import { AnimatedSection } from "@/components/animated-section";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dot-grid" />
      <div className="absolute top-[20%] left-[35%] w-[400px] h-[400px] rounded-full bg-emerald-200/20 blur-[120px] animate-float-slow" />
      <div className="absolute bottom-[20%] right-[25%] w-[300px] h-[300px] rounded-full bg-orange-200/15 blur-[100px] animate-float-slower" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <AnimatedSection>
          <p className="text-8xl md:text-9xl font-bold gradient-text mb-4 animate-pulse-glow">
            404
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Page not found
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <p className="text-muted-foreground mb-8 max-w-md">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <GradientButton href="/">Go Home</GradientButton>
            <OutlineButton href="/features">View Features</OutlineButton>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
