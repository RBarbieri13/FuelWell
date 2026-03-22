"use client";

import {
  Crown,
  Sparkles,
  MessageSquare,
  Award,
  Lightbulb,
  Check,
  Lock,
  ArrowRight,
  Star,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { CountUp } from "@/components/count-up";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";

const benefits = [
  {
    icon: Lock,
    title: "Lifetime Discounted Pricing",
    description:
      "Lock in founding member rates for as long as you stay subscribed. Your price never goes up.",
  },
  {
    icon: Sparkles,
    title: "Early Access to New Features",
    description:
      "Be the first to try new capabilities before they roll out to the general public.",
  },
  {
    icon: MessageSquare,
    title: "Direct Feedback Channel",
    description:
      "A private line to the founders. Share ideas, report issues, and help shape the product roadmap.",
  },
  {
    icon: Award,
    title: "Founding Member Badge",
    description:
      "A permanent badge inside the app that marks you as one of the original 100.",
  },
  {
    icon: Lightbulb,
    title: "Influence Future Features",
    description:
      "Vote on what we build next. Founders 100 members get priority input on the product roadmap.",
  },
];

const proFeatures = [
  "AI nutrition coaching",
  "Macro tracking",
  "Restaurant guidance",
  "Recipe generation",
  "Grocery planning",
  "Progress reports",
];

const premiumExtras = [
  "Adaptive AI workout builder",
  "Soreness-aware customization",
  "Advanced coaching insights",
  "Expanded progress analysis",
];

export default function Founders100Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-15%] left-[20%] w-[400px] h-[400px] rounded-full bg-fw-premium/8 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] rounded-full bg-fw-accent/6 blur-[100px] animate-float-slower" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12 md:pb-16">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-violet-100 text-violet-600 border-violet-200 px-4 py-1.5">
              <Star className="h-3 w-3 mr-1.5 fill-current" />
              Limited to 100 Members
            </Badge>
            <h1>
              Become one of the first 100 members shaping{" "}
              <span className="gradient-text">FuelWell.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              A limited group of early supporters who get lifetime pricing, early
              access to every feature, and a direct feedback channel with the
              founders.
            </p>

            {/* Live counter */}
            <div className="mt-10 inline-flex items-center gap-4 rounded-2xl border border-violet-200 bg-white shadow-card backdrop-blur-sm px-8 py-5 glow-premium">
              <Crown className="h-6 w-6 text-fw-premium" />
              <div className="text-left">
                <span className="text-3xl font-bold tabular-nums text-foreground">
                  <CountUp end={7} duration={1200} suffix="/100" />
                </span>
                <p className="text-sm text-muted-foreground">spots claimed</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <Section id="benefits">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <h2>What Founding Members Get</h2>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <AnimatedSection key={benefit.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-fw-border bg-white p-6 h-full hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 shadow-card">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100">
                    <Icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <h2>Founders 100 Pricing</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Lock in these rates for life. Once all 100 spots are filled,
            pricing moves to standard launch rates.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pro Card */}
          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl border border-fw-border bg-white p-8 h-full flex flex-col hover:border-fw-accent/30 transition-colors duration-300 shadow-card">
              <h3 className="text-2xl font-bold mb-1">FuelWell Pro</h3>
              <p className="text-sm text-muted-foreground mb-6">
                AI-powered nutrition coaching
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$10.99</span>
                  <span className="text-muted-foreground">/month for life</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-foreground font-medium">$99/year</span>{" "}
                  for life
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <Check className="h-4 w-4 shrink-0 text-fw-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <GradientButton href="/signup" className="w-full">
                Join as Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </GradientButton>
            </div>
          </AnimatedSection>

          {/* Premium Card */}
          <AnimatedSection delay={0.2}>
            <div className="relative rounded-2xl border-2 border-violet-200 bg-violet-50 p-8 h-full flex flex-col glow-premium">
              <Badge className="absolute top-4 right-4 bg-violet-100 text-violet-600 border-violet-200">
                Most Popular
              </Badge>

              <h3 className="text-2xl font-bold mb-1">FuelWell Premium</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Nutrition + adaptive fitness coaching
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$16.99</span>
                  <span className="text-muted-foreground">/month for life</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <span className="text-foreground font-medium">$159/year</span>{" "}
                  for life
                </p>
              </div>

              <p className="text-xs text-violet-600 font-medium mb-3">
                Everything in Pro, plus:
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {[...proFeatures, ...premiumExtras].map((feature) => {
                  const isPremiumExtra = premiumExtras.includes(feature);
                  return (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          isPremiumExtra ? "text-violet-600" : "text-fw-accent"
                        }`}
                      />
                      <span
                        className={isPremiumExtra ? "text-foreground font-medium" : ""}
                      >
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <GradientButton href="/signup" className="w-full">
                Join as Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </GradientButton>
            </div>
          </AnimatedSection>
        </div>
      </Section>

      {/* Scarcity + CTA */}
      <Section>
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-fw-orange/20 bg-fw-orange/5 px-4 py-1.5 text-sm text-fw-orange font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fw-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fw-orange" />
            </span>
            Limited availability
          </div>
          <h2 className="mb-4">Join the Founders 100</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Secure your lifetime rate and help shape the future of AI-powered
            wellness coaching. Only 100 founding spots will be available.
          </p>
          <GradientButton href="/signup" size="default">
            Claim Your Spot
            <ArrowRight className="ml-2 h-4 w-4" />
          </GradientButton>
        </AnimatedSection>
      </Section>
    </>
  );
}
