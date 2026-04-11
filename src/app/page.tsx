"use client";

import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { GradientButton } from "@/components/ui/gradient-button";
import { OutlineButton } from "@/components/ui/outline-button";
import { AppCarousel } from "@/components/app-carousel";
import { AnimatedSection } from "@/components/animated-section";
import { MacroCalculator } from "@/components/macro-calculator";
import { InteractiveCoach } from "@/components/interactive-coach";
import {
  Brain,
  DollarSign,
  Dumbbell,
  TrendingUp,
  Users,
  Camera,
  ChefHat,
  Wallet,
  BookOpen,
  BarChart3,
  XCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Smartphone,
  Tablet,
  Watch,
  Heart,
  Activity,
  Zap,
} from "lucide-react";

const credibilityItems = [
  { icon: Brain, label: "AI-guided nutrition" },
  { icon: DollarSign, label: "Budget-friendly planning" },
  { icon: Dumbbell, label: "Adaptive workouts" },
  { icon: TrendingUp, label: "Progress insights" },
  { icon: Users, label: "Supports trainers" },
];

const problemBullets = [
  "You eat out and don\u2019t know what to order.",
  "Weekends throw you off and you can\u2019t recover.",
  "Your weight jumps around and nobody explains why.",
  "Eating healthy feels like a second job.",
  "Your workout plan ignores how your body actually feels.",
];

const howItWorksSteps = [
  {
    number: 1,
    title: "Tell",
    description:
      "Share your goals, preferences, dietary needs, and budget. FuelWell adapts to who you are and how you live.",
    color: "from-emerald-400 to-teal-400",
    image: "/features/ate-more.png",
    imageAlt: "FuelWell profile and goals setup",
    width: 375,
    height: 1600,
  },
  {
    number: 2,
    title: "Get",
    description:
      "Receive personalized meal suggestions, grocery lists, workout plans, and real-time coaching \u2014 all tailored to your day.",
    color: "from-orange-400 to-amber-400",
    image: "/features/progress-tracking.png",
    imageAlt: "FuelWell personalized meal and workout plan",
    width: 563,
    height: 1600,
  },
  {
    number: 3,
    title: "Track",
    description:
      "See your progress clearly with trends, insights, and smart nudges that keep you moving forward without obsessing over numbers.",
    color: "from-cyan-400 to-blue-400",
    image: "/features/body-insights.png",
    imageAlt: "FuelWell activity insights and progress tracking",
    width: 494,
    height: 1600,
  },
];

/* Feature showcase items — each pairs a Stitch image with text in an alternating layout */
const featureShowcases = [
  {
    image: "/features/smarter-food.png",
    imageAlt: "FuelWell AI insight for smarter food decisions",
    width: 688,
    height: 1559,
    title: "Make smarter food decisions",
    description:
      "Snap a photo of your meal or describe what you\u2019re eating. FuelWell gives you instant feedback, alternatives, and coaching \u2014 not just calorie counts.",
    icon: Camera,
  },
  {
    image: "/features/build-meals.png",
    imageAlt: "FuelWell AI-personalized meal with macro breakdown and preparation guide",
    width: 276,
    height: 1600,
    title: "Build meals that taste good",
    description:
      "Optimized nutrition doesn\u2019t mean sacrificing flavor. Get AI-personalized recipes engineered for your macros, inflammatory markers, and taste preferences \u2014 with step-by-step prep guides.",
    icon: ChefHat,
  },
  {
    image: "/features/stay-on-budget.png",
    imageAlt: "FuelWell smart spending tracker with grocery list and budget optimization",
    width: 274,
    height: 1600,
    title: "Stay on budget",
    description:
      "Fueling your body shouldn\u2019t break the bank. Your AI assistant optimizes your cart for maximum nutrition at minimal cost \u2014 with real-time spending tracking and smart swap suggestions.",
    icon: Wallet,
  },
];

/* Real-life scenario showcases — full phone mockups */
const scenarioShowcases = [
  {
    image: "/features/at-restaurant.png",
    imageAlt: "FuelWell dining mode showing macro allowance, AI smart tips, and menu scanning",
    width: 318,
    height: 1600,
    title: "At a restaurant?",
    subtitle: "Dining Mode activates automatically.",
    description:
      "FuelWell analyzes your remaining macros in real-time, gives you AI-powered tips for the best menu choices, and even lets you scan the menu for instant recommendations.",
  },
  {
    image: "/features/ate-more.png",
    imageAlt: "FuelWell auto-balance feature adjusting macros after overeating",
    width: 375,
    height: 1600,
    title: "Ate more than planned?",
    subtitle: "No guilt. Just recalibration.",
    description:
      "One meal doesn\u2019t define your journey. FuelWell automatically rebalances your day \u2014 adjusting dinner, snacks, and even suggesting a quick walk to offset the surplus.",
  },
  {
    image: "/features/sore-recovery.png",
    imageAlt: "FuelWell recovery mode with inflammation detection and AI coach recommendations",
    width: 272,
    height: 1600,
    title: "Sore or low energy?",
    subtitle: "Your body is telling you something.",
    description:
      "FuelWell detects when your body needs recovery, tracks inflammation markers and glycogen levels, and recommends the right fuel and movement to accelerate repair.",
  },
];

/* Additional feature showcases — upgraded from SVG placeholders to Stitch images */
const additionalShowcases = [
  {
    image: "/features/customized-workouts.png",
    imageAlt: "FuelWell Muscle Mass Mastery program with goals, milestones, and AI coach insights",
    width: 472,
    height: 1600,
    title: "Get customized workouts",
    description:
      "Whether you\u2019re at home, in a gym, or traveling \u2014 FuelWell builds workouts around your equipment, time, and fitness level. Track muscle mass, set milestones, and get real-time AI coaching.",
    icon: Dumbbell,
    premium: true,
  },
  {
    image: "/features/body-insights.png",
    imageAlt: "FuelWell activity insights showing steps, heart rate, calorie deficit, and body measurements",
    width: 494,
    height: 1600,
    title: "Understand your body",
    description:
      "See your daily steps, heart rate zones, calorie trends, and detailed body measurements in one place. Learn why your weight changes, what affects your energy, and how food and movement connect.",
    icon: BookOpen,
  },
  {
    image: "/features/progress-tracking.png",
    imageAlt: "FuelWell measurements dashboard with weight trends, hydration, muscle mass, and AI coach insights",
    width: 563,
    height: 1600,
    title: "Track progress clearly",
    description:
      "Visual dashboards that show trends over time \u2014 not just daily numbers. Monitor weight, hydration, muscle mass, and activity with AI-powered insights that keep you motivated.",
    icon: BarChart3,
  },
];

export default function Home() {
  return (
    <>
      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden">
        {/* Pastel gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-200/30 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-200/25 blur-[100px] animate-float-slower" />
        <div className="absolute top-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-violet-200/20 blur-[80px] animate-pulse-glow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20 md:pb-28">
          <AnimatedSection className="max-w-3xl mx-auto text-center space-y-8">
            <Link
              href="/founders-100"
              className="group relative inline-flex items-center gap-2.5 rounded-full border border-fw-accent/30 bg-white/90 px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm shadow-sm font-accent hover:shadow-md hover:border-fw-accent/50 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/10 via-transparent to-violet-400/10" />
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="relative">Now accepting <span className="gradient-text font-bold">Founders 100</span> members</span>
              <ArrowRight className="relative h-4 w-4 text-fw-accent group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.035em] text-foreground leading-[1.05]">
              Build a healthier lifestyle{" "}
              <span className="gradient-text">without giving up real life.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-[1.6]">
              Smarter food choices. Adaptive workouts. Real-time coaching.
              Habits that actually stick — because they fit your life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <GradientButton href="/founders-100" size="lg">
                Secure Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </GradientButton>
              <OutlineButton href="/features">
                See How It Works
              </OutlineButton>
            </div>

            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto font-accent">
              No rigid diets. No guilt. Just smarter decisions, every day.
            </p>
          </AnimatedSection>

          {/* Hero app carousel */}
          <AnimatedSection delay={0.3} className="mt-16 px-6">
            <AppCarousel />
          </AnimatedSection>
        </div>
      </section>

      {/* ───── BUILT TO GUIDE, NOT JUDGE ───── */}
      <Section className="py-14 md:py-18">
        <AnimatedSection className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground leading-tight">
            Built to Guide, Not Judge
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-[1.7] max-w-xl mx-auto">
            No guilt trips. No punishment days. FuelWell helps you make
            better choices while staying in control — and it works
            alongside your trainer, not against them.
          </p>
        </AnimatedSection>
      </Section>

      {/* ───── REAL-LIFE SCENARIOS — FULL PHONE SHOWCASES ───── */}
      <Section className="py-16 md:py-24 bg-fw-surface/50">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground leading-tight">
            FuelWell meets you where life happens.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mt-3 leading-relaxed">
            Real situations. Real solutions. See exactly how FuelWell responds.
          </p>
        </AnimatedSection>

        <div className="space-y-20 md:space-y-28">
          {scenarioShowcases.map((scenario, i) => (
            <AnimatedSection key={scenario.title} delay={0.1}>
              <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 max-w-5xl mx-auto`}>
                {/* Phone mockup */}
                <div className="flex-shrink-0 w-[260px] md:w-[300px]">
                  <div className="rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                    <div className="rounded-[2rem] overflow-hidden bg-white">
                      <Image
                        src={scenario.image}
                        alt={scenario.imageAlt}
                        width={scenario.width}
                        height={scenario.height}
                        className="w-full h-[600px] md:h-[640px] object-cover object-top"
                        priority={i === 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 text-center md:text-left max-w-lg">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {scenario.title}
                  </h3>
                  <p className="text-fw-accent font-semibold text-sm uppercase tracking-wider mb-4">
                    {scenario.subtitle}
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground leading-[1.7]">
                    {scenario.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── CREDIBILITY STRIP ───── */}
      <Section className="py-8 md:py-10 border-y border-fw-border/50">
        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {credibilityItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 text-muted-foreground group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-200">
                  <item.icon className="h-4.5 w-4.5 text-fw-accent" />
                </div>
                <span className="text-sm font-semibold font-accent group-hover:text-foreground transition-colors duration-200">{item.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </Section>

      {/* ───── PROBLEM SECTION ───── */}
      <Section className="py-16 md:py-22">
        <AnimatedSection className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground text-center mb-5 leading-tight">
            Most fitness plans break the moment life gets real.
          </h2>
          <p className="text-muted-foreground text-center text-base md:text-lg mb-10 max-w-xl mx-auto leading-[1.7]">
            Rigid meal plans don&apos;t survive restaurant dinners, weekend plans, or tight budgets. Sound familiar?
          </p>
          <ul className="space-y-4 max-w-md mx-auto">
            {problemBullets.map((bullet, i) => (
              <AnimatedSection key={bullet} delay={0.3 + i * 0.08}>
                <li className="flex items-start gap-3 group">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 mt-0.5 group-hover:bg-red-100 transition-colors duration-200">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                  </div>
                  <span className="text-[15px] text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-200">
                    {bullet}
                  </span>
                </li>
              </AnimatedSection>
            ))}
          </ul>
        </AnimatedSection>
      </Section>

      {/* ───── SOLUTION / HOW IT WORKS ───── */}
      <Section className="bg-fw-surface py-16 md:py-22">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-5 leading-tight">
            Your daily decision coach.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Three steps. No overthinking.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-[2px] bg-gradient-to-r from-emerald-300 via-orange-300 to-cyan-300 opacity-30 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>

          {howItWorksSteps.map((step) => (
            <AnimatedSection
              key={step.number}
              delay={step.number * 0.15}
              className="text-center relative"
            >
              <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} text-white text-xl font-bold mb-5 shadow-md relative z-10`}>
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-[1.7] max-w-[280px] mx-auto mb-6">
                {step.description}
              </p>
              <div className="flex justify-center">
                <div className="w-[180px]">
                  <div className="rounded-[1.75rem] border-[5px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                    <div className="rounded-[1.35rem] overflow-hidden bg-white">
                      <Image
                        src={step.image}
                        alt={step.imageAlt}
                        width={step.width}
                        height={step.height}
                        className="w-full h-[340px] object-cover object-top"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── FEATURE SHOWCASES — FULL PHONE MOCKUPS ───── */}
      <Section className="py-16 md:py-24">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-5 leading-tight">
            What changes when you have FuelWell
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Eat smarter. Train better. Actually stay consistent.
          </p>
        </AnimatedSection>

        <div className="space-y-20 md:space-y-28">
          {featureShowcases.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={0.1}>
              <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 max-w-5xl mx-auto`}>
                {/* Phone mockup */}
                <div className="flex-shrink-0 w-[260px] md:w-[300px]">
                  <div className="rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                    <div className="rounded-[2rem] overflow-hidden bg-white">
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        width={feature.width}
                        height={feature.height}
                        className="w-full h-[600px] md:h-[640px] object-cover object-top"
                      />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 text-center md:text-left max-w-lg">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50 mb-5 shadow-sm">
                    <feature.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-[1.7]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Additional feature showcases — full phone mockups */}
        <div className="space-y-20 md:space-y-28 mt-20 md:mt-28">
          {additionalShowcases.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={0.1}>
              <div className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 max-w-5xl mx-auto`}>
                {/* Phone mockup */}
                <div className="flex-shrink-0 w-[260px] md:w-[300px]">
                  <div className="rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                    <div className="rounded-[2rem] overflow-hidden bg-white">
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        width={feature.width}
                        height={feature.height}
                        className="w-full h-[600px] md:h-[640px] object-cover object-top"
                      />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 text-center md:text-left max-w-lg">
                  <div className="inline-flex items-center gap-2 mb-5">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50 shadow-sm">
                      <feature.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    {feature.premium && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-[1.7]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── SMART COACHING EXAMPLES ───── */}
      <Section className="bg-fw-surface py-16 md:py-24">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-5 leading-tight">
            Coaching that sounds like a friend, not a textbook.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Real questions. Real answers. Zero judgment.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="max-w-6xl mx-auto">
          <InteractiveCoach />
        </AnimatedSection>
      </Section>

      {/* ───── PLATFORM AVAILABILITY ───── */}
      <Section className="py-12 md:py-16 border-y border-fw-border/40">
        <AnimatedSection className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">Available Everywhere You Are</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Use FuelWell across all your devices, synced and seamless.
          </p>
        </AnimatedSection>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-10">
          {[
            { icon: Globe, label: "Web App", desc: "Any browser" },
            { icon: Smartphone, label: "iPhone", desc: "iOS 16+" },
            { icon: Tablet, label: "iPad", desc: "iPadOS 16+" },
            { icon: Smartphone, label: "Android", desc: "Android 12+" },
          ].map((p, i) => (
            <AnimatedSection key={p.label} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-2 group">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-200 shadow-sm">
                  <p.icon className="h-6 w-6 text-fw-accent" />
                </div>
                <p className="text-sm font-semibold text-foreground">{p.label}</p>
                <p className="text-[11px] text-muted-foreground">{p.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Desktop dashboard preview */}
        <AnimatedSection delay={0.2} className="mb-12">
          <div className="max-w-4xl mx-auto rounded-2xl border border-fw-border bg-gray-900 shadow-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-800 border-b border-gray-700">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-[11px] text-gray-400 font-mono">app.fuelwell.ai</span>
            </div>
            <Image
              src="/features/desktop-dashboard.png"
              alt="FuelWell desktop performance overview with muscle activation, workload distribution, and AI fueling intelligence"
              width={1416}
              height={1600}
              className="w-full h-auto"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">Works with the tech you already wear</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Heart, label: "Apple Health", color: "from-red-50 to-pink-50", iconColor: "text-red-500" },
              { icon: Watch, label: "Apple Watch", color: "from-gray-50 to-slate-100", iconColor: "text-gray-700" },
              { icon: Activity, label: "WHOOP", color: "from-teal-50 to-emerald-50", iconColor: "text-teal-600" },
              { icon: Zap, label: "Oura Ring", color: "from-amber-50 to-yellow-50", iconColor: "text-amber-600" },
              { icon: TrendingUp, label: "Garmin", color: "from-blue-50 to-sky-50", iconColor: "text-blue-600" },
              { icon: BarChart3, label: "Smart Scales", color: "from-violet-50 to-purple-50", iconColor: "text-violet-600" },
            ].map((int) => (
              <div
                key={int.label}
                className="group rounded-2xl border border-fw-border bg-white p-4 text-center hover:-translate-y-0.5 hover:shadow-card-hover hover:border-fw-accent/30 transition-all duration-300 shadow-card flex flex-col items-center gap-2.5"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${int.color} ring-1 ring-fw-border/40 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  <int.icon className={`h-7 w-7 ${int.iconColor}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">{int.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </Section>

      {/* ───── INTERACTIVE MACRO CALCULATOR ───── */}
      <Section className="py-16 md:py-24">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-4 leading-tight">
            Your personalized macros, calculated live.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Drag the sliders below and see exactly where FuelWell would start you — then
            get in the app to let real weight and training data refine it every week.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.1} className="max-w-6xl mx-auto">
          <MacroCalculator />
        </AnimatedSection>
      </Section>

      {/* ───── FINAL CTA ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] rounded-full bg-emerald-200/20 blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] rounded-full bg-orange-200/15 blur-[80px] animate-float-slower" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <AnimatedSection className="text-center max-w-xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              FuelWell. <span className="gradient-text">Feel well.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
              Make consistency actually stick — with real-time guidance that fits your life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <GradientButton href="/founders-100" size="lg">
                Secure Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </GradientButton>
              <OutlineButton href="/about">
                Learn More
              </OutlineButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
