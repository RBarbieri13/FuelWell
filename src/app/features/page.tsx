"use client";

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
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";

const coreFeatures = [
  {
    icon: MessageCircle,
    title: "24/7 AI Coaching",
    description:
      "Get conversational coaching that understands your goals, schedule, and preferences. Ask anything from meal ideas to motivation \u2014 day or night.",
    bullets: [
      "\"What should I eat before a morning workout?\"",
      "\"I'm at a party and there's only pizza \u2014 what do I do?\"",
      "\"I missed my protein goal yesterday, how do I make up for it?\"",
      "\"Can I have a cheat meal and still stay on track?\"",
    ],
    gradient: "from-emerald-500/20 to-cyan-500/20",
    accentColor: "text-emerald-600",
    mockupLines: [
      { label: "Messages", value: "1,247" },
      { label: "Avg Response", value: "< 2s" },
      { label: "Topics Covered", value: "86" },
    ],
  },
  {
    icon: Utensils,
    title: "Smart Real-World Food Suggestions",
    description:
      "FuelWell knows that life happens outside the kitchen. Get macro-friendly suggestions for restaurants, fast food, and social situations.",
    bullets: [
      "Ask for dressing on the side and dip your salad",
      "Half rice, half beans at Chipotle for better macros",
      "Protein-first ordering at any restaurant menu",
      "Smart swaps that save 200+ calories without sacrificing flavor",
    ],
    gradient: "from-orange-500/20 to-amber-500/20",
    accentColor: "text-orange-500",
    mockupLines: [
      { label: "Restaurants", value: "500+" },
      { label: "Avg Saved", value: "280 cal" },
      { label: "Suggestions", value: "Real-time" },
    ],
  },
  {
    icon: Camera,
    title: "Photo-Based Food Logging",
    description:
      "Snap a photo of your plate or scan a barcode \u2014 FuelWell auto-identifies foods, estimates portions, and logs your macros instantly.",
    bullets: [
      "Take a photo and let AI identify everything on your plate",
      "Scan packaged items for instant nutrition data",
      "Auto-estimate portions with visual recognition",
      "Edit and refine entries with a single tap",
    ],
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    accentColor: "text-violet-600",
    mockupLines: [
      { label: "Accuracy", value: "94%" },
      { label: "Log Time", value: "< 5s" },
      { label: "Foods in DB", value: "1M+" },
    ],
  },
  {
    icon: ChefHat,
    title: "AI Recipe Creation",
    description:
      "Generate meals tailored to your exact macro goals, available ingredients, time constraints, and budget. Every recipe comes with full nutrition details.",
    bullets: [
      "Calories, protein, carbs, and fat per serving",
      "Adjustable portion sizes for meal prep",
      "Estimated cost per meal and prep time",
      "Filter by cuisine, dietary restrictions, or pantry items",
    ],
    gradient: "from-pink-500/20 to-rose-500/20",
    accentColor: "text-pink-600",
    mockupLines: [
      { label: "Recipes", value: "10K+" },
      { label: "Avg Prep", value: "25 min" },
      { label: "Avg Cost", value: "$4.50" },
    ],
  },
  {
    icon: ShoppingCart,
    title: "Budget-Friendly Meal Planning",
    description:
      "Set a weekly grocery budget and let FuelWell build meal plans with a matching grocery list \u2014 hitting your macros without breaking the bank.",
    bullets: [
      "Weekly meal plans that respect your budget",
      "Auto-generated grocery lists organized by store section",
      "Macro-optimized meals at $3\u20135 per serving",
      "Swap suggestions when ingredients are on sale",
    ],
    gradient: "from-green-500/20 to-emerald-500/20",
    accentColor: "text-green-600",
    mockupLines: [
      { label: "Budget Fit", value: "98%" },
      { label: "Per Serving", value: "$3\u20135" },
      { label: "Weekly Plans", value: "Custom" },
    ],
  },
  {
    icon: Dumbbell,
    title: "Adaptive Training Programs",
    description:
      "Personalized workout plans that evolve with you. FuelWell factors in soreness, energy levels, injury history, and wearable data to keep you progressing safely.",
    bullets: [
      "Injury-aware exercise selection and modifications",
      "Energy-based intensity adjustments from wearable data",
      "Progressive overload tracking and deload recommendations",
      "Integrates with Apple Watch, WHOOP, Oura, and Garmin",
    ],
    premium: true,
    gradient: "from-purple-500/20 to-indigo-500/20",
    accentColor: "text-violet-600",
    mockupLines: [
      { label: "Exercises", value: "500+" },
      { label: "Adapts To", value: "Energy" },
      { label: "Wearables", value: "4+" },
    ],
  },
] as const;

const progressItems = [
  {
    icon: BarChart3,
    title: "Weekly Performance Reports",
    description:
      "Calorie trends, protein consistency, workout completion rate, and weekly deficit or surplus estimates \u2014 delivered every Sunday.",
    stat: "Weekly",
    statLabel: "Delivery",
  },
  {
    icon: ImageIcon,
    title: "Visual Progress Tracking",
    description:
      "Log weekly photos with guided poses. FuelWell generates side-by-side comparisons and transformation collages so you can see the change over time.",
    stat: "Side-by-side",
    statLabel: "Comparisons",
  },
  {
    icon: TrendingUp,
    title: "Body Recomposition Timeline",
    description:
      "Track weight, measurements, and body composition estimates over weeks and months. See projected milestones based on your current trajectory.",
    stat: "Projected",
    statLabel: "Milestones",
  },
];

const integrations = [
  { name: "Apple Health", icon: Zap },
  { name: "WHOOP", icon: Sparkles },
  { name: "Oura Ring", icon: Shield },
  { name: "Garmin", icon: TrendingUp },
  { name: "Smart Scales", icon: BarChart3 },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-fw-accent/6 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12 md:pb-16">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-fw-accent/10 text-fw-accent border-fw-accent/20 px-4 py-1.5">
              Full Feature Breakdown
            </Badge>
            <h1 className="gradient-text">
              Everything you need to stay on track
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              From real-time AI coaching and photo-based food logging to
              budget-friendly meal plans and adaptive workouts \u2014 FuelWell is
              your all-in-one wellness platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Features \u2014 alternating layout */}
      <Section id="core-features" className="py-12 md:py-16">
        <div className="space-y-24 md:space-y-32">
          {coreFeatures.map((feature, index) => {
            const isReversed = index % 2 !== 0;
            const Icon = feature.icon;

            return (
              <AnimatedSection key={feature.title} delay={0.1}>
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Text side */}
                  <div className={isReversed ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <Icon className="h-5 w-5 text-fw-accent" />
                      </div>
                      {"premium" in feature && feature.premium && (
                        <Badge className="bg-violet-100 text-violet-600 border-violet-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-5">
                      {feature.description}
                    </p>
                    <ul className="space-y-2.5">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-fw-accent" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* App-style mockup */}
                  <div className={isReversed ? "md:order-1" : ""}>
                    <div
                      className={`relative aspect-[4/3] rounded-2xl bg-gradient-to-br ${feature.gradient} border border-fw-border overflow-hidden group`}
                    >
                      {/* Mockup chrome */}
                      <div className="absolute inset-3 rounded-xl bg-white border border-fw-border/50 flex flex-col overflow-hidden shadow-sm">
                        {/* Title bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-fw-border/50">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-fw-error/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-fw-warning/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-fw-accent/60" />
                          </div>
                          <span className="text-xs text-muted-foreground/60 ml-2 font-mono">
                            FuelWell
                          </span>
                        </div>

                        {/* Content area */}
                        <div className="flex-1 p-4 flex flex-col gap-3 justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-5 w-5 ${feature.accentColor}`} />
                            <span className="text-sm font-medium text-foreground">
                              {feature.title}
                            </span>
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-3 gap-2">
                            {feature.mockupLines.map((line) => (
                              <div
                                key={line.label}
                                className="rounded-lg bg-fw-surface border border-fw-border/50 p-2.5 text-center"
                              >
                                <p className={`text-sm font-semibold ${feature.accentColor}`}>
                                  {line.value}
                                </p>
                                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                  {line.label}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Skeleton lines */}
                          <div className="space-y-2 mt-1">
                            <div className="h-2 rounded-full bg-fw-border/60 w-full" />
                            <div className="h-2 rounded-full bg-fw-border/60 w-4/5" />
                            <div className="h-2 rounded-full bg-fw-border/60 w-3/5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Section>

      {/* Progress & Reporting */}
      <Section id="progress" className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <h2>Progress & Reporting</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            See where you&apos;ve been, where you are, and where you&apos;re headed
            &mdash; with data-driven insights delivered weekly.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {progressItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-fw-border bg-white p-6 hover:-translate-y-1 hover:border-fw-accent/30 transition-all duration-300 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                      <Icon className="h-5 w-5 text-fw-accent" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-fw-accent">{item.stat}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Section>

      {/* Integrations */}
      <Section id="integrations">
        <AnimatedSection className="text-center">
          <h2 className="mb-4">Connects With Your Favorite Devices</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            FuelWell syncs with the wearables and health platforms you already
            use for a complete picture of your wellness.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((item) => {
              const IntIcon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-fw-border bg-white hover:border-fw-accent/30 hover:bg-fw-surface transition-all duration-200 shadow-card"
                >
                  <IntIcon className="h-4 w-4 text-fw-accent" />
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </Section>

      {/* CTA */}
      <Section className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <h2 className="mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join the Founders 100 and be among the first to experience AI-powered
            nutrition and fitness coaching.
          </p>
          <GradientButton href="/founders-100" size="default">
            Join the Founders 100
          </GradientButton>
        </AnimatedSection>
      </Section>
    </>
  );
}
