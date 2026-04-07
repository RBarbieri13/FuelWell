"use client";

import Link from "next/link";
import { Section } from "@/components/ui/section";
import { GradientButton } from "@/components/ui/gradient-button";
import { OutlineButton } from "@/components/ui/outline-button";
import { AppCarousel } from "@/components/app-carousel";
import {
  FoodLoggingVisual,
  RecipeVisual,
  BudgetVisual,
  WorkoutVisual,
  BodyVisual,
  ProgressVisual,
} from "@/components/feature-visuals";
import { AnimatedSection } from "@/components/animated-section";
import { FeatureCard } from "@/components/feature-card";
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
  User,
  Bot,
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

const realLifeExamples = [
  {
    emoji: "🍽️",
    situation: "At a restaurant?",
    solution: "We help you pick the best option on the menu.",
  },
  {
    emoji: "🍕",
    situation: "Ate more than planned?",
    solution: "We adjust the rest of your day automatically.",
  },
  {
    emoji: "😓",
    situation: "Feeling sore or low energy?",
    solution: "We adapt your workout on the spot.",
  },
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
  },
  {
    number: 2,
    title: "Get",
    description:
      "Receive personalized meal suggestions, grocery lists, workout plans, and real-time coaching \u2014 all tailored to your day.",
    color: "from-orange-400 to-amber-400",
  },
  {
    number: 3,
    title: "Track",
    description:
      "See your progress clearly with trends, insights, and smart nudges that keep you moving forward without obsessing over numbers.",
    color: "from-cyan-400 to-blue-400",
  },
];

const features: {
  icon: typeof Camera;
  title: string;
  description: string;
  premium?: boolean;
  visual: React.ReactNode;
}[] = [
  {
    icon: Camera,
    title: "Make smarter food decisions",
    description:
      "Snap a photo of your meal or describe what you\u2019re eating. FuelWell gives you instant feedback, alternatives, and coaching \u2014 not just calorie counts.",
    visual: <FoodLoggingVisual />,
  },
  {
    icon: ChefHat,
    title: "Build meals that taste good",
    description:
      "Get recipe ideas and meal suggestions based on your preferences, what\u2019s in your fridge, and what fits your goals.",
    visual: <RecipeVisual />,
  },
  {
    icon: Wallet,
    title: "Stay on budget",
    description:
      "Set a weekly grocery budget and get meal plans that respect it. No more choosing between your health and your wallet.",
    visual: <BudgetVisual />,
  },
  {
    icon: Dumbbell,
    title: "Get customized workouts",
    description:
      "Whether you\u2019re at home, in a gym, or traveling \u2014 FuelWell builds workouts around your equipment, time, and fitness level.",
    premium: true,
    visual: <WorkoutVisual />,
  },
  {
    icon: BookOpen,
    title: "Understand your body",
    description:
      "Learn why your weight changes, what affects your energy, and how food and movement connect.",
    visual: <BodyVisual />,
  },
  {
    icon: BarChart3,
    title: "Track progress clearly",
    description:
      "Visual dashboards that show trends over time \u2014 not just daily numbers. See the big picture so you stay motivated.",
    visual: <ProgressVisual />,
  },
];

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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-44 pb-24 md:pb-32">
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-10">
            <Link
              href="/founders-100"
              className="group relative inline-flex items-center gap-3 rounded-full border-2 border-fw-accent/40 bg-white/90 px-8 py-3.5 text-lg font-bold text-foreground backdrop-blur-sm shadow-lg font-accent hover:shadow-2xl hover:border-fw-accent/60 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 via-orange-300/20 to-violet-400/20 animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="relative">Now accepting <span className="gradient-text font-extrabold text-xl">Founders 100</span> members</span>
              <ArrowRight className="relative h-5 w-5 text-fw-accent group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.035em] text-foreground leading-[1.05]">
              Build a healthier lifestyle{" "}
              <span className="gradient-text">without giving up real life.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Smarter food choices. Adaptive workouts. Real-time coaching.
              Habits that actually stick — because they fit your life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <GradientButton href="/founders-100" size="lg">
                Secure Your Spot
                <ArrowRight className="ml-2 h-5 w-5" />
              </GradientButton>
              <OutlineButton href="/features">
                See How It Works
              </OutlineButton>
            </div>

            <p className="text-base text-muted-foreground/80 max-w-xl mx-auto font-accent">
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
      <Section className="py-16 md:py-20">
        <AnimatedSection className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground leading-tight">
            Built to Guide, Not Judge
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-[1.7] max-w-2xl mx-auto">
            No guilt trips. No punishment days. FuelWell helps you make
            better choices while staying in control — and it works
            alongside your trainer, not against them.
          </p>
        </AnimatedSection>
      </Section>

      {/* ───── REAL-LIFE EXAMPLES ───── */}
      <Section className="py-14 md:py-20">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground leading-tight">
            FuelWell meets you where life happens.
          </h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {realLifeExamples.map((ex, i) => (
            <AnimatedSection key={ex.situation} delay={i * 0.1}>
              <div className="group rounded-2xl border-2 border-fw-border bg-white p-8 text-center hover:-translate-y-1 hover:border-fw-accent/40 transition-all duration-300 shadow-card hover:shadow-lg">
                <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">{ex.emoji}</span>
                <p className="text-xl font-bold text-foreground mb-2">{ex.situation}</p>
                <p className="text-muted-foreground text-base leading-relaxed">{ex.solution}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── CREDIBILITY STRIP ───── */}
      <Section className="py-10 md:py-14 border-y border-fw-border/50 bg-fw-surface/50">
        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
            {credibilityItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 text-muted-foreground group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-200">
                  <item.icon className="h-5 w-5 text-fw-accent" />
                </div>
                <span className="text-base font-semibold font-accent group-hover:text-foreground transition-colors duration-200">{item.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </Section>

      {/* ───── PROBLEM SECTION ───── */}
      <Section>
        <AnimatedSection className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground text-center mb-5 leading-tight">
            Most fitness plans break the moment life gets real.
          </h2>
          <p className="text-muted-foreground text-center text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-[1.7]">
            Rigid meal plans don&apos;t survive restaurant dinners, weekend plans, or tight budgets. Sound familiar?
          </p>
          <ul className="space-y-5 max-w-lg mx-auto">
            {problemBullets.map((bullet, i) => (
              <AnimatedSection key={bullet} delay={0.3 + i * 0.08}>
                <li className="flex items-start gap-4 group">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 mt-0.5 group-hover:bg-red-100 transition-colors duration-200">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-200">
                    {bullet}
                  </span>
                </li>
              </AnimatedSection>
            ))}
          </ul>
        </AnimatedSection>
      </Section>

      {/* ───── SOLUTION / HOW IT WORKS ───── */}
      <Section className="bg-fw-surface py-20 md:py-28">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-5 leading-tight">
            Your daily decision coach.
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Three steps. No overthinking.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-[2px] bg-gradient-to-r from-emerald-300 via-orange-300 to-cyan-300 opacity-30 overflow-hidden">
            <div className="h-full w-full shimmer" />
          </div>

          {howItWorksSteps.map((step) => (
            <AnimatedSection
              key={step.number}
              delay={step.number * 0.15}
              className="text-center relative"
            >
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} text-white text-2xl font-bold mb-6 shadow-md relative z-10`}>
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground leading-[1.7] max-w-xs mx-auto">
                {step.description}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── CORE FEATURES GRID ───── */}
      <Section>
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-5 leading-tight">
            What changes when you have FuelWell
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Eat smarter. Train better. Actually stay consistent.
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.08}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                premium={feature.premium}
                visual={feature.visual}
              />
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── SMART COACHING EXAMPLES ───── */}
      <Section className="bg-fw-surface py-20 md:py-28">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-5 leading-tight">
            Coaching that sounds like a friend, not a textbook.
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Real questions. Real answers. Zero judgment.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coachingExamples.map((example, i) => (
            <AnimatedSection key={i} delay={i * 0.08}>
              <div className="group rounded-2xl border border-fw-border bg-white p-6 h-full flex flex-col gap-5 hover:shadow-card-hover hover:border-fw-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-card">
                {/* User bubble */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-4 w-4 text-fw-orange" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-fw-surface border border-fw-border px-4 py-3">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {example.question}
                    </p>
                  </div>
                </div>

                {/* AI bubble */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 group-hover:scale-110 transition-transform duration-300">
                    <Bot className="h-4 w-4 text-fw-accent" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-emerald-50/50 border border-emerald-100 px-4 py-3 flex-1">
                    <p className="text-sm text-muted-foreground leading-[1.7]">
                      {example.answer}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Section>

      {/* ───── PLATFORM AVAILABILITY ───── */}
      <Section className="py-16 md:py-20 border-y border-fw-border/40">
        <AnimatedSection className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Available Everywhere You Are</h3>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Use FuelWell across all your devices, synced and seamless.
          </p>
        </AnimatedSection>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-12">
          {[
            { icon: Globe, label: "Web App", desc: "Any browser" },
            { icon: Smartphone, label: "iPhone", desc: "iOS 16+" },
            { icon: Tablet, label: "iPad", desc: "iPadOS 16+" },
            { icon: Smartphone, label: "Android", desc: "Android 12+" },
          ].map((p, i) => (
            <AnimatedSection key={p.label} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-2.5 group">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-200 shadow-sm">
                  <p.icon className="h-7 w-7 text-fw-accent" />
                </div>
                <p className="text-base font-semibold text-foreground">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Integrations</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Heart, label: "Apple Health" },
              { icon: Watch, label: "Apple Watch" },
              { icon: Activity, label: "WHOOP" },
              { icon: Zap, label: "Oura Ring" },
              { icon: TrendingUp, label: "Garmin" },
              { icon: BarChart3, label: "Smart Scales" },
            ].map((int) => (
              <div
                key={int.label}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-fw-border bg-white hover:border-fw-accent/30 hover:bg-fw-surface transition-all duration-200 shadow-card"
              >
                <int.icon className="h-4 w-4 text-fw-accent" />
                <span className="text-sm font-medium text-foreground">{int.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </Section>

      {/* ───── FINAL CTA ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-grid opacity-50" />
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] rounded-full bg-emerald-200/20 blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] rounded-full bg-orange-200/15 blur-[80px] animate-float-slower" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <AnimatedSection className="text-center max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              FuelWell. <span className="gradient-text">Feel well.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
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
