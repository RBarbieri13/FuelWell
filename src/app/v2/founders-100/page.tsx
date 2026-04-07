"use client";

import { AnimatedSection } from "@/components/animated-section";
import { CountUp } from "@/components/count-up";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Sparkles,
  MessageSquare,
  Award,
  Lightbulb,
  Gift,
  Shield,
  Zap,
  Heart,
  Star,
  Check,
  Crown,
} from "lucide-react";

/* ───── Data ───── */

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
      'A permanent badge inside the app that marks you as one of the original 100.',
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

/* ───── Progress Ring ───── */

function SpotsRing() {
  const total = 100;
  const filled = 7;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = filled / total;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        className="v2-progress-ring"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#e7e8e8"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#v2-ring-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient
            id="v2-ring-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#006c49" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#191c1d] tabular-nums">
          <CountUp end={7} duration={1200} />
        </span>
        <span className="text-[10px] text-[#6c7a71] font-medium">
          of 100
        </span>
      </div>
    </div>
  );
}

/* ───── Page ───── */

export default function V2Founders100Page() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#f8f9fa] pt-24 md:pt-36 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#006c49]/10 border border-[#006c49]/20 px-4 py-1.5 text-sm font-semibold text-[#006c49] mb-6">
              <Star className="h-3.5 w-3.5 fill-current" />
              Limited to 100 Members
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191c1d] leading-[1.08] tracking-tight">
              Become one of the first 100 members shaping{" "}
              <span className="v2-gradient-text">FuelWell.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#3c4a42] leading-relaxed">
              A limited group of early supporters who get lifetime pricing, early
              access to every feature, and a direct feedback channel with the
              founders.
            </p>

            {/* Counter + Ring */}
            <div className="mt-10 inline-flex items-center gap-6 rounded-2xl border border-[#e7e8e8] bg-white shadow-[0_20px_40px_rgba(0,105,68,0.06)] px-8 py-6">
              <SpotsRing />
              <div className="text-left">
                <p className="text-sm text-[#6c7a71] font-medium">
                  spots claimed
                </p>
                <div className="h-px bg-[#e7e8e8] my-2" />
                <p className="text-2xl font-bold text-[#006c49]">93</p>
                <p className="text-xs text-[#6c7a71]">remaining</p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-1.5 text-xs text-[#6c7a71]"
                >
                  <badge.icon className="h-3.5 w-3.5 text-[#006c49]" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="v2-label">Exclusive Perks</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              What Founding Members Get
            </h2>
            <span className="v2-underline-bar mx-auto" />
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <AnimatedSection key={benefit.title} delay={i * 0.08}>
                  <div className="rounded-2xl border border-[#e7e8e8] bg-white p-6 h-full shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#006c49]/10">
                        <Icon className="h-5 w-5 text-[#006c49]" />
                      </div>
                      <span className="text-2xl">{benefit.emoji}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#191c1d] mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-[#3c4a42] leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="v2-label">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Founders 100 Pricing
            </h2>
            <span className="v2-underline-bar mx-auto" />
            <p className="mt-4 text-[#3c4a42] leading-relaxed">
              Lock in these rates for life. Once all 100 spots are filled,
              pricing moves to standard launch rates.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Card */}
            <AnimatedSection delay={0.1}>
              <div className="rounded-2xl border border-[#e7e8e8] bg-white p-8 h-full flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] transition-all duration-300">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006c49]/10">
                    <Zap className="h-5 w-5 text-[#006c49]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#191c1d]">
                    FuelWell Pro
                  </h3>
                </div>
                <p className="text-sm text-[#6c7a71] mb-6 ml-[52px]">
                  AI-powered nutrition coaching
                </p>

                <div className="mb-6 p-4 rounded-2xl bg-[#006c49]/5 border border-[#006c49]/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#191c1d]">
                      $9.99
                    </span>
                    <span className="text-[#6c7a71]">/month for life</span>
                  </div>
                  <p className="text-sm text-[#6c7a71] mt-1">
                    or{" "}
                    <span className="text-[#191c1d] font-semibold">
                      $89/year
                    </span>{" "}
                    for life —{" "}
                    <span className="text-[#006c49] font-semibold">
                      save 26%
                    </span>
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {proFeatures.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-center gap-3 text-sm text-[#191c1d]"
                    >
                      <span className="text-base">{feature.icon}</span>
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="v2-btn-primary flex items-center justify-center gap-2 h-12 text-base w-full"
                >
                  Join as Pro
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedSection>

            {/* Premium Card */}
            <AnimatedSection delay={0.2}>
              <div className="relative rounded-2xl border-2 border-[#006c49] bg-white p-8 h-full flex flex-col shadow-[0_20px_40px_rgba(0,105,68,0.06)]">
                {/* Badge */}
                <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md" style={{ background: "linear-gradient(135deg, #006c49, #10b981)" }}>
                  <Star className="h-3 w-3 fill-current" />
                  Most Popular
                </span>

                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006c49]/10">
                    <Crown className="h-5 w-5 text-[#006c49]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#191c1d]">
                    FuelWell Premium
                  </h3>
                </div>
                <p className="text-sm text-[#6c7a71] mb-6 ml-[52px]">
                  Nutrition + adaptive fitness coaching
                </p>

                <div className="mb-6 p-4 rounded-2xl bg-[#006c49]/5 border border-[#006c49]/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#191c1d]">
                      $16.99
                    </span>
                    <span className="text-[#6c7a71]">/month for life</span>
                  </div>
                  <p className="text-sm text-[#6c7a71] mt-1">
                    or{" "}
                    <span className="text-[#191c1d] font-semibold">
                      $149.99/year
                    </span>{" "}
                    for life —{" "}
                    <span className="text-[#006c49] font-semibold">
                      save 27%
                    </span>
                  </p>
                </div>

                <p className="text-xs text-[#006c49] font-semibold mb-3 flex items-center gap-1.5">
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
                      <span className="text-[#191c1d] font-medium">
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="v2-btn-primary flex items-center justify-center gap-2 h-12 text-base w-full"
                >
                  Join as Premium
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Guarantee */}
          <AnimatedSection delay={0.3} className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#e7e8e8] px-5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <Shield className="h-4 w-4 text-[#006c49]" />
              <span className="text-sm text-[#6c7a71]">
                30-day money-back guarantee · No questions asked
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Scarcity + CTA */}
      <section className="v2-cta-green py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm text-white font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              Limited availability — 93 spots remaining
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Secure Your Spot
            </h2>
            <p className="text-white/80 leading-relaxed">
              Secure your lifetime rate and help shape the future of AI-powered
              wellness coaching. Only 100 founding spots will be available.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-12 px-8 text-base font-semibold text-[#006c49] bg-white rounded-full hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
            >
              Claim Your Spot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
