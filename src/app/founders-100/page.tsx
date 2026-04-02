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
  Shield,
  Zap,
  Heart,
  Gift,
  Trophy,
  Gem,
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
    emoji: "🔒",
  },
  {
    icon: Sparkles,
    title: "Early Access to New Features",
    description:
      "Be the first to try new capabilities before they roll out to the general public.",
    emoji: "✨",
  },
  {
    icon: MessageSquare,
    title: "Direct Feedback Channel",
    description:
      "A private line to the founders. Share ideas, report issues, and help shape the product roadmap.",
    emoji: "💬",
  },
  {
    icon: Award,
    title: "Founding Member Badge",
    description:
      "A permanent badge inside the app that marks you as one of the original 100.",
    emoji: "🏆",
  },
  {
    icon: Lightbulb,
    title: "Influence Future Features",
    description:
      "Vote on what we build next. Founders 100 members get priority input on the product roadmap.",
    emoji: "💡",
  },
  {
    icon: Gift,
    title: "Exclusive Content & Perks",
    description:
      "Get founder-only guides, templates, and surprise perks as we grow together.",
    emoji: "🎁",
  },
];

const proFeatures = [
  { label: "AI nutrition coaching", icon: "🧠" },
  { label: "Macro tracking", icon: "📊" },
  { label: "Restaurant guidance", icon: "🍽️" },
  { label: "Recipe generation", icon: "👨‍🍳" },
  { label: "Grocery planning", icon: "🛒" },
  { label: "Progress reports", icon: "📈" },
];

const premiumExtras = [
  { label: "Adaptive AI workout builder", icon: "💪" },
  { label: "Soreness-aware customization", icon: "🔄" },
  { label: "Advanced coaching insights", icon: "🎯" },
  { label: "Expanded progress analysis", icon: "📉" },
];

const trustBadges = [
  { icon: Shield, label: "Privacy-first" },
  { icon: Zap, label: "No contracts" },
  { icon: Heart, label: "Cancel anytime" },
];

export default function Founders100Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-15%] left-[20%] w-[400px] h-[400px] rounded-full bg-fw-premium/10 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] rounded-full bg-fw-accent/8 blur-[100px] animate-float-slower" />
        <div className="absolute top-[30%] right-[30%] w-[200px] h-[200px] rounded-full bg-orange-200/15 blur-[80px] animate-pulse-glow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12 md:pb-16">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-violet-100 text-violet-600 border-violet-200 px-5 py-2 text-sm font-semibold">
              <Star className="h-3.5 w-3.5 mr-2 fill-current" />
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
            <div className="mt-10 inline-flex items-center gap-5 rounded-2xl border-2 border-violet-200 bg-white shadow-lg backdrop-blur-sm px-10 py-6 glow-premium">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200">
                <Crown className="h-7 w-7 text-fw-premium" />
              </div>
              <div className="text-left">
                <span className="text-4xl font-bold tabular-nums text-foreground">
                  <CountUp end={7} duration={1200} suffix="/100" />
                </span>
                <p className="text-sm text-muted-foreground font-medium">spots claimed</p>
              </div>
              <div className="hidden sm:block h-10 w-px bg-violet-200" />
              <div className="hidden sm:block text-left">
                <p className="text-2xl font-bold text-fw-premium">93</p>
                <p className="text-xs text-muted-foreground">remaining</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <badge.icon className="h-3.5 w-3.5 text-fw-accent" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <Section id="benefits">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4 bg-emerald-50 text-emerald-600 border-emerald-200 px-3 py-1">
            <Trophy className="h-3 w-3 mr-1.5" />
            Exclusive Perks
          </Badge>
          <h2>What Founding Members Get</h2>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <AnimatedSection key={benefit.title} delay={i * 0.08}>
                <div className="group rounded-2xl border-2 border-fw-border bg-white p-6 h-full hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 shadow-card hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 ring-2 ring-violet-100 group-hover:ring-violet-200 group-hover:from-violet-100 group-hover:to-purple-100 transition-all duration-300">
                      <Icon className="h-5 w-5 text-violet-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-2xl">{benefit.emoji}</span>
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
          <Badge className="mb-4 bg-violet-50 text-violet-600 border-violet-200 px-3 py-1">
            <Gem className="h-3 w-3 mr-1.5" />
            Founders Pricing
          </Badge>
          <h2>Founders 100 Pricing</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Lock in these rates for life. Once all 100 spots are filled,
            pricing moves to standard launch rates.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pro Card */}
          <AnimatedSection delay={0.1}>
            <div className="rounded-3xl border-2 border-fw-border bg-white p-8 h-full flex flex-col hover:border-fw-accent/40 transition-all duration-300 shadow-card hover:shadow-lg relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-[3rem]" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                    <Zap className="h-5 w-5 text-fw-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">FuelWell Pro</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-[52px]">
                  AI-powered nutrition coaching
                </p>
              </div>

              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$10.99</span>
                  <span className="text-muted-foreground">/month for life</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  or <span className="text-foreground font-semibold">$99/year</span>{" "}
                  for life — <span className="text-fw-accent font-semibold">save 25%</span>
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-base">{feature.icon}</span>
                    <span>{feature.label}</span>
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
            <div className="relative rounded-3xl border-3 border-violet-300 bg-gradient-to-b from-violet-50 to-white p-8 h-full flex flex-col glow-premium overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100/80 to-transparent rounded-bl-[4rem]" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-100/50 to-transparent rounded-tr-[3rem]" />

              <div className="relative">
                <Badge className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-violet-400 px-3 py-1 shadow-md">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Most Popular
                </Badge>

                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 border border-violet-200">
                    <Crown className="h-5 w-5 text-violet-600" />
                  </div>
                  <h3 className="text-2xl font-bold">FuelWell Premium</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-[52px]">
                  Nutrition + adaptive fitness coaching
                </p>
              </div>

              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-100/80 to-purple-50 border border-violet-200 relative">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$16.99</span>
                  <span className="text-muted-foreground">/month for life</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <span className="text-foreground font-semibold">$149.99/year</span>{" "}
                  for life — <span className="text-violet-600 font-semibold">save 26%</span>
                </p>
              </div>

              <p className="text-xs text-violet-600 font-semibold mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Everything in Pro, plus:
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {premiumExtras.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-base">{feature.icon}</span>
                    <span className="text-foreground font-medium">
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              <GradientButton href="/signup" className="w-full">
                Join as Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </GradientButton>
            </div>
          </AnimatedSection>
        </div>

        {/* Guarantee */}
        <AnimatedSection delay={0.3} className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-fw-border px-5 py-2.5 shadow-card">
            <Shield className="h-4 w-4 text-fw-accent" />
            <span className="text-sm text-muted-foreground">30-day money-back guarantee • No questions asked</span>
          </div>
        </AnimatedSection>
      </Section>

      {/* Scarcity + CTA */}
      <Section>
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-fw-orange/30 bg-fw-orange/5 px-5 py-2 text-sm text-fw-orange font-semibold mb-6 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fw-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fw-orange" />
            </span>
            Limited availability — 93 spots remaining
          </div>
          <h2 className="mb-4">Secure Your Spot</h2>
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
