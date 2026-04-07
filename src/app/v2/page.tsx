"use client";

import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { StepCarousel } from "@/components/v2/step-carousel";
import { BentoFeatureCard } from "@/components/v2/bento-feature-card";
import {
  Camera,
  Dumbbell,
  Wallet,
  User,
  Bot,
  ArrowRight,
  Globe,
  Smartphone,
  Tablet,
  Heart,
  Watch,
  Activity,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";

/* ───── Data ───── */

const coachingExamples = [
  {
    question: "I\u2019m at a Mexican restaurant. What should I order?",
    answer:
      "Go for grilled chicken fajitas with extra veggies. Skip the sour cream, keep the guac \u2014 it\u2019s healthy fat. Ask for corn tortillas instead of flour.",
  },
  {
    question: "I went over my calories yesterday. Should I eat less today?",
    answer:
      "No need to punish yourself. One day doesn\u2019t define your progress. Stick to your normal plan today and focus on hydration.",
  },
  {
    question: "I only have 20 minutes to work out. Is it even worth it?",
    answer:
      "Absolutely. Here\u2019s a quick full-body circuit with no equipment. 20 minutes of focused effort beats skipping it entirely.",
  },
  {
    question: "Why did my weight go up even though I\u2019ve been eating well?",
    answer:
      "Weight fluctuates daily due to water retention, sodium, sleep, and stress. Your 7-day trend is still heading down.",
  },
  {
    question: "I\u2019m bored with my meals. Can you mix it up?",
    answer:
      "Let\u2019s refresh your rotation. Here are 3 new recipes that hit your macros and budget with prep time under 30 minutes.",
  },
];

const platforms = [
  { icon: Globe, label: "Web App", desc: "Any browser" },
  { icon: Smartphone, label: "iPhone", desc: "iOS 16+" },
  { icon: Tablet, label: "iPad", desc: "iPadOS 16+" },
  { icon: Smartphone, label: "Android", desc: "Android 12+" },
];

const integrations = [
  { icon: Heart, label: "Apple Health" },
  { icon: Watch, label: "Apple Watch" },
  { icon: Activity, label: "WHOOP" },
  { icon: Zap, label: "Oura Ring" },
  { icon: TrendingUp, label: "Garmin" },
  { icon: BarChart3, label: "Smart Scales" },
];

/* ───── Bento Visuals ───── */

function NutritionVisual() {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-full bg-[#006c49]/10 flex items-center justify-center text-xs">
          🤖
        </div>
        <span className="text-[10px] font-semibold text-[#191c1d]">
          FuelCoach AI
        </span>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[9px] text-[#006c49] font-medium">Online</span>
        </span>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-[#006c49] text-white text-[10px] leading-snug rounded-2xl rounded-br-sm px-3 py-2">
          What should I eat before my 7am workout?
        </div>
      </div>
      <div className="flex justify-start gap-1.5">
        <div className="h-4 w-4 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[8px] shrink-0 mt-0.5">
          🤖
        </div>
        <div className="max-w-[75%] bg-[#f0f1f1] border border-[#e7e8e8] text-[10px] leading-snug rounded-2xl rounded-bl-sm px-3 py-2 text-[#191c1d]">
          Banana + 1 tbsp almond butter. Fast carbs + protein. Eat 15 min
          before.
        </div>
      </div>
    </div>
  );
}

function WorkoutVisual() {
  const bars = [65, 80, 55, 90, 72, 45, 85];
  return (
    <div className="p-4">
      <p className="text-[10px] font-bold text-[#191c1d] mb-3">
        Weekly Intensity
      </p>
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md transition-all duration-500"
            style={{
              height: `${h}%`,
              background:
                h > 75
                  ? "linear-gradient(to top, #006c49, #10b981)"
                  : "#e7e8e8",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="flex-1 text-center text-[8px] text-[#6c7a71]">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

function BudgetVisual() {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.68;
  const offset = circumference * (1 - progress);

  return (
    <div className="p-4 flex items-center gap-6">
      <div className="relative">
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          className="v2-progress-ring"
        >
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="#e7e8e8"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[#191c1d]">$68</span>
          <span className="text-[8px] text-[#6c7a71]">of $100</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-[#191c1d]">Weekly Budget</p>
        <p className="text-[9px] text-[#6c7a71]">$32 remaining</p>
        <p className="text-[9px] text-[#006c49] font-semibold">
          On track for the week
        </p>
      </div>
    </div>
  );
}

/* ───── Page ───── */

export default function V2Home() {
  return (
    <>
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-36 pb-20 md:pb-28">
          <AnimatedSection className="max-w-3xl space-y-8">
            <span className="v2-label">AI-Powered Wellness</span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-[#191c1d] leading-[1.08] tracking-tight">
              Build a healthier lifestyle{" "}
              <span className="v2-gradient-text">
                without giving up real life.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#3c4a42] max-w-2xl leading-relaxed">
              Smarter food choices. Adaptive workouts. Real-time coaching.
              Habits that actually stick — because they fit your life.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
              <Link
                href="/v2/founders-100"
                className="v2-btn-primary inline-flex items-center gap-2 h-12 px-8 text-base"
              >
                Secure Your Spot
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/v2/features"
                className="v2-btn-outline inline-flex items-center gap-2 h-12 px-8 text-base"
              >
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-[#6c7a71]">
              No rigid diets. No guilt. Just smarter decisions, every day.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ───── STEP CAROUSEL ───── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <span className="v2-label">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Your daily decision coach.
            </h2>
            <span className="v2-underline-bar mx-auto" />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <StepCarousel />
          </AnimatedSection>
        </div>
      </section>

      {/* ───── FEATURE BENTO GRID ───── */}
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-12">
            <span className="v2-label">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Smart Tools for Real Results
            </h2>
            <span className="v2-underline-bar" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BentoFeatureCard
              label="Nutrition"
              title="AI Nutrition Coach"
              description="Snap a photo of your meal or describe what you're eating. FuelWell gives you instant feedback, alternatives, and coaching — not just calorie counts."
              icon={
                <Camera className="h-5 w-5 text-[#006c49]" />
              }
              visual={<NutritionVisual />}
              span="wide"
            />
            <BentoFeatureCard
              label="Fitness"
              title="Adaptive Workouts"
              description="Personalized workout plans that evolve with you, factoring in soreness, energy levels, and wearable data."
              icon={
                <Dumbbell className="h-5 w-5 text-[#006c49]" />
              }
              visual={<WorkoutVisual />}
              span="narrow"
            />
            <BentoFeatureCard
              label="Budget"
              title="Budget-Friendly Planning"
              description="Set a weekly grocery budget and let FuelWell build meal plans with a matching grocery list — hitting your macros without breaking the bank."
              icon={
                <Wallet className="h-5 w-5 text-[#006c49]" />
              }
              visual={<BudgetVisual />}
              span="full"
            />
          </div>
        </div>
      </section>

      {/* ───── COACHING EXAMPLES ───── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <span className="v2-label">AI Coaching</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Coaching that sounds like a friend, not a textbook.
            </h2>
            <span className="v2-underline-bar mx-auto" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coachingExamples.map((example, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="rounded-2xl border border-[#e7e8e8] bg-white p-5 h-full flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] hover:-translate-y-1 transition-all duration-300">
                  {/* User bubble */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0f1f1]">
                      <User className="h-3.5 w-3.5 text-[#3c4a42]" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-[#f0f1f1] border border-[#e7e8e8] px-4 py-2.5">
                      <p className="text-sm font-medium text-[#191c1d] leading-relaxed">
                        {example.question}
                      </p>
                    </div>
                  </div>

                  {/* AI bubble */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#006c49]/10">
                      <Bot className="h-3.5 w-3.5 text-[#006c49]" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-[#006c49]/5 border border-[#006c49]/15 px-4 py-2.5 flex-1">
                      <p className="text-sm text-[#3c4a42] leading-relaxed">
                        {example.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PLATFORM & INTEGRATIONS ───── */}
      <section className="py-12 md:py-16 bg-[#f8f9fa] border-y border-[#e7e8e8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <span className="v2-label">Platform</span>
            <h3 className="text-xl md:text-2xl font-bold text-[#191c1d] mt-2">
              Available Everywhere You Are
            </h3>
          </AnimatedSection>

          <AnimatedSection className="flex flex-wrap items-center justify-center gap-5 md:gap-8 mb-10">
            {platforms.map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-2 group">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#006c49]/10 border border-[#006c49]/15 group-hover:bg-[#006c49]/15 group-hover:scale-110 transition-all duration-200">
                  <p.icon className="h-6 w-6 text-[#006c49]" />
                </div>
                <p className="text-sm font-semibold text-[#191c1d]">{p.label}</p>
                <p className="text-[10px] text-[#6c7a71]">{p.desc}</p>
              </div>
            ))}
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="text-center">
            <p className="v2-label mb-4">Integrations</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {integrations.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e7e8e8] bg-white hover:border-[#006c49]/30 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <item.icon className="h-3.5 w-3.5 text-[#006c49]" />
                  <span className="text-xs font-medium text-[#191c1d]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ───── FULL-WIDTH GREEN CTA ───── */}
      <section className="v2-cta-green py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to redefine your health?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Make consistency actually stick — with real-time guidance that fits
              your life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/v2/founders-100"
                className="inline-flex items-center gap-2 h-12 px-8 text-base font-semibold text-[#006c49] bg-white rounded-full hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
              >
                Secure Your Spot
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/v2/about"
                className="inline-flex items-center gap-2 h-12 px-8 text-base font-semibold text-white border-2 border-white/30 rounded-full hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
