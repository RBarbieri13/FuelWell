"use client";

import { AnimatedSection } from "@/components/animated-section";
import { BentoFeatureCard } from "@/components/v2/bento-feature-card";
import Link from "next/link";
import {
  MessageCircle,
  Utensils,
  Camera,
  ChefHat,
  ShoppingCart,
  Dumbbell,
  TrendingUp,
  ImageIcon,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Search,
  MapPin,
} from "lucide-react";

/* ───── Mockup Sub-Components ───── */

function AiCoachingMockup() {
  return (
    <div className="flex flex-col h-full p-3 space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-[#e7e8e8]">
        <div className="h-5 w-5 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[10px]">
          🤖
        </div>
        <span className="text-[10px] font-semibold text-[#191c1d]">
          FuelCoach AI
        </span>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[9px] text-[#006c49]">Online</span>
        </span>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-[#006c49] text-white text-[10px] leading-snug rounded-2xl rounded-br-sm px-2.5 py-1.5">
          What should I eat before my 7am workout?
        </div>
      </div>
      <div className="flex justify-start gap-1.5">
        <div className="h-4 w-4 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[8px] shrink-0">
          🤖
        </div>
        <div className="max-w-[78%] bg-[#f0f1f1] border border-[#e7e8e8] text-[10px] leading-snug rounded-2xl rounded-bl-sm px-2.5 py-1.5 text-[#191c1d]">
          Banana + 1 tbsp almond butter. Fast carbs + protein. Eat 15 min
          before.
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-[#006c49] text-white text-[10px] leading-snug rounded-2xl rounded-br-sm px-2.5 py-1.5">
          Will that hurt my fat loss?
        </div>
      </div>
      <div className="flex justify-start gap-1.5">
        <div className="h-4 w-4 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[8px] shrink-0">
          🤖
        </div>
        <div className="max-w-[78%] bg-[#f0f1f1] border border-[#e7e8e8] text-[10px] leading-snug rounded-2xl rounded-bl-sm px-2.5 py-1.5 text-[#191c1d]">
          Only ~200 cal, helps you push harder so you burn more. Deficit stays
          intact.
        </div>
      </div>
    </div>
  );
}

function FoodSuggestionMockup() {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-[#e7e8e8] bg-[#f8f9fa] px-2.5 py-1.5">
        <Search className="h-3 w-3 text-[#6c7a71]" />
        <span className="text-[10px] text-[#6c7a71]">Chipotle</span>
        <MapPin className="h-3 w-3 text-[#006c49] ml-auto" />
      </div>
      {[
        { name: "Chicken Bowl (half rice)", cal: 520, badge: "Best Macros" },
        { name: "Steak Salad + vinaigrette", cal: 440, badge: "High Protein" },
      ].map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2 rounded-lg bg-[#006c49]/5 border border-[#006c49]/10 px-2.5 py-2"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-[#191c1d] truncate">
              {item.name}
            </p>
            <span className="text-[9px] text-[#6c7a71]">{item.cal} cal</span>
          </div>
          <span className="text-[8px] bg-[#006c49]/10 text-[#006c49] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {item.badge}
          </span>
        </div>
      ))}
    </div>
  );
}

function PhotoLoggingMockup() {
  return (
    <div className="p-3 space-y-2">
      <div className="rounded-lg bg-[#191c1d] h-20 relative flex items-center justify-center overflow-hidden">
        <span className="text-3xl opacity-60">🍽️</span>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
          <span className="text-[9px] bg-[#006c49]/80 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
            Scanning...
          </span>
        </div>
      </div>
      {[
        { name: "Grilled Chicken", portion: "6 oz", cal: 220, confidence: 97 },
        { name: "Brown Rice", portion: "1 cup", cal: 216, confidence: 92 },
      ].map((f) => (
        <div
          key={f.name}
          className="flex items-center gap-2 rounded-lg border border-[#e7e8e8] px-2 py-1.5"
        >
          <div className="flex-1">
            <p className="text-[10px] font-medium text-[#191c1d]">{f.name}</p>
            <span className="text-[9px] text-[#6c7a71]">
              {f.portion} · {f.cal} cal
            </span>
          </div>
          <span className="text-[9px] font-semibold text-[#006c49]">
            {f.confidence}%
          </span>
        </div>
      ))}
    </div>
  );
}

function RecipeMockup() {
  return (
    <div className="p-3 space-y-2">
      <div className="rounded-lg bg-[#006c49]/5 border border-[#006c49]/10 p-2.5">
        <p className="text-[10px] font-bold text-[#191c1d]">
          Garlic Herb Chicken Bowl
        </p>
        <div className="flex gap-2 mt-1">
          <span className="text-[9px] text-[#6c7a71]">485 cal</span>
          <span className="text-[9px] text-[#006c49] font-medium">42g P</span>
          <span className="text-[9px] text-[#6c7a71]">38g C</span>
          <span className="text-[9px] text-[#6c7a71]">16g F</span>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="text-[8px] bg-[#006c49]/10 text-[#006c49] rounded-full px-1.5 py-0.5">
            25 min
          </span>
          <span className="text-[8px] bg-[#006c49]/10 text-[#006c49] rounded-full px-1.5 py-0.5">
            $4.20
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-semibold text-[#6c7a71] uppercase tracking-wide">
          Ingredients
        </p>
        {["Chicken breast", "Quinoa", "Broccoli", "Garlic & herbs"].map(
          (ing) => (
            <div
              key={ing}
              className="flex items-center gap-1.5 text-[9px] text-[#3c4a42]"
            >
              <Check className="h-2.5 w-2.5 text-[#006c49]" />
              {ing}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function BudgetMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const budget = [12, 8, 15, 6, 11, 18, 10];
  const max = 20;

  return (
    <div className="p-4 flex items-start gap-6">
      <div className="flex-1">
        <p className="text-[10px] font-bold text-[#191c1d] mb-2">
          Weekly Budget: $80
        </p>
        <div className="flex items-end gap-1 h-12">
          {budget.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(b / max) * 100}%`,
                  background:
                    b > 15
                      ? "#f59e0b"
                      : "linear-gradient(to top, #006c49, #10b981)",
                }}
              />
              <span className="text-[7px] text-[#6c7a71]">{days[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-[#6c7a71]">
          <span>
            Spent:{" "}
            <span className="font-semibold text-[#191c1d]">$80</span>
          </span>
          <span className="text-[#006c49] font-semibold">On target</span>
        </div>
      </div>
      <div className="relative shrink-0">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          className="v2-progress-ring"
        >
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#e7e8e8"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 26}
            strokeDashoffset={2 * Math.PI * 26 * 0.32}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-[#191c1d]">68%</span>
        </div>
      </div>
    </div>
  );
}

function WorkoutMockup() {
  return (
    <div className="p-3 space-y-2">
      <div className="rounded-lg bg-[#006c49]/5 border border-[#006c49]/10 p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-[#191c1d]">
            Today: Upper Body
          </p>
          <span className="text-[8px] bg-[#006c49]/10 text-[#006c49] rounded-full px-1.5 py-0.5">
            45 min
          </span>
        </div>
        {[
          { name: "Bench Press", sets: "4×8", status: "done" },
          { name: "Pull-ups", sets: "3×10", status: "done" },
          { name: "Shoulder Press", sets: "3×12", status: "current" },
          { name: "Bicep Curls", sets: "3×15", status: "pending" },
        ].map((ex) => (
          <div
            key={ex.name}
            className="flex items-center gap-2 py-1 text-[9px]"
          >
            <div
              className={`h-3 w-3 rounded-full border-2 flex items-center justify-center ${
                ex.status === "done"
                  ? "bg-[#10b981] border-[#10b981]"
                  : ex.status === "current"
                  ? "border-[#006c49] bg-[#006c49]/10"
                  : "border-[#e7e8e8]"
              }`}
            >
              {ex.status === "done" && (
                <Check className="h-2 w-2 text-white" />
              )}
            </div>
            <span
              className={
                ex.status === "done"
                  ? "text-[#6c7a71] line-through"
                  : "text-[#191c1d]"
              }
            >
              {ex.name}
            </span>
            <span className="ml-auto text-[#6c7a71]">{ex.sets}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-[#006c49]" />
        <span className="text-[9px] text-[#006c49] font-medium">
          Intensity reduced — low energy detected
        </span>
      </div>
    </div>
  );
}

/* ───── Core Features Data ───── */

const coreFeatures = [
  {
    label: "AI Coaching",
    title: "24/7 AI Coaching",
    description:
      "A conversational AI coach available around the clock — ask anything about your nutrition, workouts, or wellness goals.",
    bullets: [
      "Natural language conversations about food and fitness",
      "Personalized advice based on your goals and habits",
      "Real-time adjustments based on your day",
      "Learns your preferences over time",
    ],
    mockup: <AiCoachingMockup />,
    span: "wide" as const,
    icon: <MessageCircle className="h-5 w-5 text-[#006c49]" />,
  },
  {
    label: "Food Intelligence",
    title: "Smart Real-World Food Suggestions",
    description:
      "Eating out? FuelWell scans the menu and suggests macro-optimized combos at your favorite restaurants.",
    bullets: [
      "AI-suggested combos ranked by macros",
      "Macro breakdown per item",
      "Tips to save calories without losing flavor",
      "Works with any restaurant",
    ],
    mockup: <FoodSuggestionMockup />,
    span: "narrow" as const,
    icon: <Utensils className="h-5 w-5 text-[#006c49]" />,
  },
  {
    label: "Food Logging",
    title: "Photo-Based Food Logging",
    description:
      "Snap a photo or describe your meal. FuelWell detects individual items, estimates portions, and logs everything automatically.",
    bullets: [
      "AI food detection with confidence scores",
      "Automatic portion estimation",
      "Instant macro breakdown",
      "Edit and refine entries with a single tap",
    ],
    mockup: <PhotoLoggingMockup />,
    span: "narrow" as const,
    icon: <Camera className="h-5 w-5 text-[#006c49]" />,
  },
  {
    label: "Recipes",
    title: "AI Recipe Creation",
    description:
      "Generate meals tailored to your exact macro goals, available ingredients, time constraints, and budget.",
    bullets: [
      "Calories, protein, carbs, and fat per serving",
      "Adjustable portion sizes for meal prep",
      "Estimated cost per meal and prep time",
      "Filter by cuisine, dietary restrictions, or pantry items",
    ],
    mockup: <RecipeMockup />,
    span: "wide" as const,
    icon: <ChefHat className="h-5 w-5 text-[#006c49]" />,
  },
  {
    label: "Budget",
    title: "Budget-Friendly Meal Planning",
    description:
      "Set a weekly grocery budget and let FuelWell build meal plans with a matching grocery list — hitting your macros without breaking the bank.",
    bullets: [
      "Weekly meal plans that respect your budget",
      "Auto-generated grocery lists organized by store section",
      "Macro-optimized meals at $3–5 per serving",
      "Swap suggestions when ingredients are on sale",
    ],
    mockup: <BudgetMockup />,
    span: "full" as const,
    icon: <ShoppingCart className="h-5 w-5 text-[#006c49]" />,
  },
  {
    label: "Premium · Fitness",
    title: "Adaptive Training Programs",
    description:
      "Personalized workout plans that evolve with you. FuelWell factors in soreness, energy levels, injury history, and wearable data.",
    bullets: [
      "Injury-aware exercise selection and modifications",
      "Energy-based intensity adjustments from wearable data",
      "Progressive overload tracking and deload recommendations",
      "Integrates with Apple Watch, WHOOP, Oura, and Garmin",
    ],
    mockup: <WorkoutMockup />,
    span: "full" as const,
    icon: <Dumbbell className="h-5 w-5 text-[#006c49]" />,
    premium: true,
  },
];

/* ───── Progress Items ───── */

const progressItems = [
  {
    icon: BarChart3,
    title: "Weekly Performance Reports",
    description:
      "Calorie trends, protein consistency, workout completion rate, and weekly deficit or surplus estimates — delivered every Sunday.",
    stat: "Weekly",
    statLabel: "Delivery",
  },
  {
    icon: ImageIcon,
    title: "Visual Progress Tracking",
    description:
      "Log weekly photos with guided poses. FuelWell generates side-by-side comparisons and transformation collages.",
    stat: "Side-by-side",
    statLabel: "Comparisons",
  },
  {
    icon: TrendingUp,
    title: "Body Recomposition Timeline",
    description:
      "Track weight, measurements, and body composition estimates over weeks and months. See projected milestones.",
    stat: "Projected",
    statLabel: "Milestones",
  },
];

/* ───── Integrations ───── */

const integrationItems = [
  { name: "Apple Health", icon: Zap },
  { name: "WHOOP", icon: Sparkles },
  { name: "Oura Ring", icon: Shield },
  { name: "Garmin", icon: TrendingUp },
  { name: "Smart Scales", icon: BarChart3 },
];

/* ───── Page ───── */

export default function V2FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#f8f9fa] pt-24 md:pt-36 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="v2-label">Full Feature Breakdown</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191c1d] mt-3 leading-[1.08] tracking-tight">
              Everything you need to{" "}
              <span className="v2-gradient-text">stay on track</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#3c4a42] leading-relaxed">
              From real-time AI coaching and photo-based food logging to
              budget-friendly meal plans and adaptive workouts — FuelWell is your
              all-in-one wellness platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Features — Bento Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-12">
            <span className="v2-label">Core Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Smart Tools for Real Results
            </h2>
            <span className="v2-underline-bar" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreFeatures.map((feature, i) => (
              <BentoFeatureCard
                key={feature.title}
                label={feature.label}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                span={feature.span}
                className={feature.premium ? "border-[#006c49]/30" : undefined}
                visual={
                  <div>
                    {feature.mockup}
                    <div className="px-4 pb-4">
                      <ul className="space-y-1.5 mt-2">
                        {feature.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2 text-[11px] text-[#3c4a42]"
                          >
                            <Check className="h-3 w-3 mt-0.5 shrink-0 text-[#006c49]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Progress & Reporting */}
      <section className="py-16 md:py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="v2-label">Insights</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2">
              Progress &amp; Reporting
            </h2>
            <span className="v2-underline-bar mx-auto" />
            <p className="mt-4 text-[#3c4a42] leading-relaxed">
              See where you&apos;ve been, where you are, and where you&apos;re
              headed — with data-driven insights delivered weekly.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {progressItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.title} delay={i * 0.1}>
                  <div className="rounded-2xl border border-[#e7e8e8] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,105,68,0.06)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#006c49]/10">
                        <Icon className="h-5 w-5 text-[#006c49]" />
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#006c49]">
                          {item.stat}
                        </p>
                        <p className="text-[10px] text-[#6c7a71] uppercase tracking-wider">
                          {item.statLabel}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#191c1d] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#3c4a42] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <span className="v2-label">Integrations</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#191c1d] mt-2 mb-4">
              Connects With Your Favorite Devices
            </h2>
            <span className="v2-underline-bar mx-auto" />
            <p className="text-[#3c4a42] mb-10 max-w-xl mx-auto mt-4">
              FuelWell syncs with the wearables and health platforms you already
              use for a complete picture of your wellness.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {integrationItems.map((item) => {
                const IntIcon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[#e7e8e8] bg-white hover:border-[#006c49]/30 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <IntIcon className="h-4 w-4 text-[#006c49]" />
                    <span className="text-sm font-medium text-[#191c1d]">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="v2-cta-green py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Be one of the first 100 members to experience AI-powered nutrition
              and fitness coaching.
            </p>
            <Link
              href="/v2/founders-100"
              className="inline-flex items-center gap-2 h-12 px-8 text-base font-semibold text-[#006c49] bg-white rounded-full hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
            >
              Secure Your Spot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
