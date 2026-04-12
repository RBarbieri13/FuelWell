"use client";

import Image from "next/image";
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
  Heart,
  Watch,
  Activity,
  Zap,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";
import { StitchCarousel } from "@/components/stitch-carousel";
import { MacroCalculator } from "@/components/macro-calculator";
import { InteractiveCoach } from "@/components/interactive-coach";

const coreFeatures = [
  {
    icon: MessageCircle,
    title: "24/7 AI Coaching",
    description:
      "Conversational coaching that understands your goals, schedule, and preferences. Ask anything from meal ideas to motivation — day or night.",
    bullets: [
      "\"What should I eat before a morning workout?\"",
      "\"I\u2019m at a party and there\u2019s only pizza — what do I do?\"",
      "\"I missed my protein goal yesterday, how do I make up for it?\"",
      "\"Can I have a cheat meal and still stay on track?\"",
    ],
    image: "/features/sore-recovery.png",
    imageAlt: "FuelWell AI coach recovery recommendations",
    width: 272,
    height: 1600,
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
    image: "/features/at-restaurant.png",
    imageAlt: "FuelWell dining mode with macro allowance and AI smart tips",
    width: 318,
    height: 1600,
  },
  {
    icon: Camera,
    title: "Photo-Based Food Logging",
    description:
      "Snap a photo of your plate or scan a barcode — FuelWell auto-identifies foods, estimates portions, and logs your macros instantly.",
    bullets: [
      "Take a photo and let AI identify everything on your plate",
      "Scan packaged items for instant nutrition data",
      "Auto-estimate portions with visual recognition",
      "Edit and refine entries with a single tap",
    ],
    image: "/features/smarter-food.png",
    imageAlt: "FuelWell AI insight analyzing a harvest bowl with macro breakdown",
    width: 688,
    height: 1559,
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
    image: "/features/build-meals.png",
    imageAlt: "FuelWell AI-personalized meal with macro card and preparation guide",
    width: 276,
    height: 1600,
  },
  {
    icon: ShoppingCart,
    title: "Budget-Friendly Meal Planning",
    description:
      "Set a weekly grocery budget and let FuelWell build meal plans with a matching grocery list — hitting your macros without breaking the bank.",
    bullets: [
      "Weekly meal plans that respect your budget",
      "Auto-generated grocery lists organized by store section",
      "Macro-optimized meals at $3\u20135 per serving",
      "Swap suggestions when ingredients are on sale",
    ],
    image: "/features/stay-on-budget.png",
    imageAlt: "FuelWell smart budget tracker with grocery list and weekly budget",
    width: 274,
    height: 1600,
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
    image: "/features/customized-workouts.png",
    imageAlt: "FuelWell Muscle Mass Mastery program with weekly milestones and AI coach",
    width: 472,
    height: 1600,
    premium: true,
  },
] as const;

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
  { name: "Apple Health", icon: Heart, color: "from-red-50 to-pink-50", iconColor: "text-red-500" },
  { name: "Apple Watch", icon: Watch, color: "from-gray-50 to-slate-100", iconColor: "text-gray-700" },
  { name: "WHOOP", icon: Activity, color: "from-teal-50 to-emerald-50", iconColor: "text-teal-600" },
  { name: "Oura Ring", icon: Zap, color: "from-amber-50 to-yellow-50", iconColor: "text-amber-600" },
  { name: "Garmin", icon: TrendingUp, color: "from-blue-50 to-sky-50", iconColor: "text-blue-600" },
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
              budget-friendly meal plans and adaptive workouts — FuelWell is
              your all-in-one wellness platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Features — phone mockup alternating layout */}
      <Section id="core-features" className="py-12 md:py-16">
        <div className="space-y-20 md:space-y-28">
          {coreFeatures.map((feature, index) => {
            const isReversed = index % 2 !== 0;
            const Icon = feature.icon;

            return (
              <AnimatedSection key={feature.title} delay={0.1}>
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
                  {/* Text side */}
                  <div className={isReversed ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50 shadow-sm">
                        <Icon className="h-5 w-5 text-fw-accent" />
                      </div>
                      {"premium" in feature && feature.premium && (
                        <Badge className="bg-violet-100 text-violet-600 border-violet-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-base md:text-lg text-muted-foreground leading-[1.7] mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-sm md:text-base text-muted-foreground"
                        >
                          <Check className="h-4 w-4 md:h-5 md:w-5 mt-0.5 shrink-0 text-fw-accent" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phone mockup */}
                  <div className={`${isReversed ? "md:order-1" : ""} flex justify-center`}>
                    <div className="w-[260px] md:w-[300px]">
                      <div className="rounded-[2.5rem] border-[6px] border-gray-800 bg-gray-800 shadow-phone overflow-hidden">
                        <div className="rounded-[2rem] overflow-hidden bg-white">
                          <Image
                            src={feature.image}
                            alt={feature.imageAlt}
                            width={feature.width}
                            height={feature.height}
                            className="w-full h-[580px] md:h-[620px] object-cover object-top"
                          />
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

      {/* Progress & Reporting — text cards only (no mockup images) */}
      <Section id="progress" className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <h2>Progress &amp; Reporting</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            See where you&apos;ve been, where you are, and where you&apos;re headed
            — with data-driven insights delivered weekly.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {progressItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-fw-border bg-white p-7 hover:-translate-y-1 hover:border-fw-accent/30 transition-all duration-300 shadow-card h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/50 shadow-sm">
                      <Icon className="h-5 w-5 text-fw-accent" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-fw-accent">{item.stat}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Section>

      {/* More FuelWell capabilities — carousel */}
      <Section className="bg-gradient-to-b from-white via-fw-surface/40 to-white">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-10">
          <h2>More ways FuelWell has your back</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A few more capabilities baked into the app — click through to see each one.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <StitchCarousel />
        </AnimatedSection>
      </Section>

      {/* Interactive macro calculator */}
      <Section className="py-16 md:py-24">
        <AnimatedSection className="text-center mb-10">
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-foreground mb-4 leading-tight">
            Your personalized macros, calculated live.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Drag the sliders and watch your starting plan update in real time.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.1} className="max-w-6xl mx-auto">
          <MacroCalculator />
        </AnimatedSection>
      </Section>

      {/* Interactive coach chat */}
      <Section className="bg-fw-surface py-16 md:py-24">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-foreground mb-4 leading-tight">
            Coaching that sounds like a friend, not a textbook.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Tap a question and watch FuelCoach respond live.
          </p>
        </AnimatedSection>
        <AnimatedSection delay={0.1} className="max-w-6xl mx-auto">
          <InteractiveCoach />
        </AnimatedSection>
      </Section>

      {/* Integrations — larger branded device cards */}
      <Section id="integrations">
        <AnimatedSection className="text-center mb-12">
          <h2 className="mb-4">Connects With Your Favorite Devices</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            FuelWell syncs with the wearables and health platforms you already
            use for a complete picture of your wellness.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 max-w-5xl mx-auto">
          {integrations.map((item, i) => {
            const IntIcon = item.icon;
            return (
              <AnimatedSection key={item.name} delay={i * 0.06}>
                <div className="group rounded-2xl border border-fw-border bg-white p-5 text-center hover:-translate-y-1 hover:shadow-card-hover hover:border-fw-accent/30 transition-all duration-300 shadow-card h-full flex flex-col items-center gap-3">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} ring-1 ring-fw-border/40 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    <IntIcon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <h2 className="mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Be one of the first 100 members to experience AI-powered
            nutrition and fitness coaching.
          </p>
          <GradientButton href="/founders-100" size="default">
            Secure Your Spot
            <ArrowRight className="ml-2 h-4 w-4" />
          </GradientButton>
        </AnimatedSection>
      </Section>
    </>
  );
}