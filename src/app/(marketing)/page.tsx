import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Target,
  BarChart3,
  Utensils,
  Camera,
  Zap,
  ArrowRight,
  Check,
  MapPin,
  TrendingDown,
  Timer,
  Scale,
  Shuffle,
} from "lucide-react";

function CoachingViz({ type }: { type: "plate" | "trend" | "timer" | "scale" | "recipes" }) {
  const vizClass = "h-8 flex-1 flex items-center";

  switch (type) {
    case "plate":
      // Mini plate breakdown: protein / carbs / fat
      return (
        <div className={vizClass}>
          <div className="flex items-center gap-1.5">
            {[
              { w: "w-7", color: "bg-blue-400", label: "P" },
              { w: "w-5", color: "bg-amber-400", label: "C" },
              { w: "w-3", color: "bg-rose-400", label: "F" },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-0.5">
                <div className={`${bar.w} h-1.5 ${bar.color} rounded-full`} />
                <span className="text-[9px] text-neutral-400 leading-none">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "trend":
      // Mini sparkline showing a week of calories
      return (
        <div className={vizClass}>
          <svg viewBox="0 0 80 24" className="w-20 h-6" fill="none">
            <polyline
              points="2,18 14,14 26,20 38,12 50,10 62,8 78,6"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="38" cy="12" r="2.5" fill="#ef4444" stroke="white" strokeWidth="1" />
            <line x1="38" y1="12" x2="38" y2="22" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>
      );
    case "timer":
      // Mini circular timer
      return (
        <div className={vizClass}>
          <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
            <circle cx="14" cy="14" r="11" stroke="#e5e7eb" strokeWidth="2" />
            <circle
              cx="14"
              cy="14"
              r="11"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="69.1"
              strokeDashoffset="46"
              strokeLinecap="round"
              transform="rotate(-90 14 14)"
            />
            <text x="14" y="17" textAnchor="middle" className="text-[8px] font-bold fill-neutral-700">
              20m
            </text>
          </svg>
        </div>
      );
    case "scale":
      // Mini weight trend line going up slightly then down overall
      return (
        <div className={vizClass}>
          <svg viewBox="0 0 80 24" className="w-20 h-6" fill="none">
            <polyline
              points="2,10 14,8 26,12 38,14 50,11 62,9 78,6"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="2,14 78,8"
              stroke="#22c55e"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle cx="38" cy="14" r="2.5" fill="#f59e0b" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      );
    case "recipes":
      // Three mini recipe cards
      return (
        <div className={`${vizClass} gap-1`}>
          {["#22c55e", "#3b82f6", "#f59e0b"].map((color) => (
            <div
              key={color}
              className="w-6 h-7 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center"
            >
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.6 }} />
            </div>
          ))}
        </div>
      );
  }
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo size="lg" href="/" />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-100/40 rounded-full blur-3xl" />
            <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" />
                AI-powered nutrition coaching
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
                Eat smarter.
                <br />
                <span className="text-primary-600">Feel better.</span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-neutral-500 leading-relaxed max-w-xl mx-auto">
                FuelWell learns your habits and goals to deliver personalized
                meal coaching — so you can stop guessing and start fueling.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start free — no credit card
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    See how it works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-neutral-100 bg-neutral-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary-500" />
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary-500" />
              No calorie counting required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary-500" />
              Personalized to your body
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary-500" />
              Works with any diet
            </span>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Three steps to better nutrition
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-8">
              {[
                {
                  step: "01",
                  icon: Target,
                  title: "Set your goals",
                  desc: "Tell us about your body, activity level, and what you want to achieve. We calculate your perfect macro split.",
                },
                {
                  step: "02",
                  icon: Camera,
                  title: "Log effortlessly",
                  desc: "Snap a photo, scan a barcode, or search our database. Logging a meal takes under 15 seconds.",
                },
                {
                  step: "03",
                  icon: Brain,
                  title: "Get coached",
                  desc: "Your AI coach adapts daily — suggesting meals, flagging gaps, and keeping you on track without the guilt.",
                },
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-primary-400 tracking-wider">
                      {item.step}
                    </span>
                    <div className="h-px flex-1 bg-neutral-200" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-neutral-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 sm:py-28 bg-neutral-50/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Everything you need to fuel your goals
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI Meal Coaching",
                  desc: "Get real-time suggestions based on your goals, today's intake, and what you actually enjoy eating.",
                  accent: "bg-violet-50 text-violet-600",
                },
                {
                  icon: Target,
                  title: "Smart Macro Tracking",
                  desc: "Automatic calorie and macro calculations using Mifflin-St Jeor science, tailored to your body.",
                  accent: "bg-blue-50 text-blue-600",
                },
                {
                  icon: BarChart3,
                  title: "Progress Insights",
                  desc: "Visual dashboards showing trends, streaks, and patterns you'd never notice on your own.",
                  accent: "bg-amber-50 text-amber-600",
                },
                {
                  icon: Camera,
                  title: "Photo Logging",
                  desc: "Snap a photo of your meal and AI identifies the food, estimates portions, and logs it for you.",
                  accent: "bg-rose-50 text-rose-600",
                },
                {
                  icon: Utensils,
                  title: "Recipe Library",
                  desc: "Browse recipes that fit your macros and dietary preferences. Save favorites for quick logging.",
                  accent: "bg-emerald-50 text-emerald-600",
                },
                {
                  icon: Zap,
                  title: "Quick Actions",
                  desc: "Log meals in under 15 seconds. Scan barcodes, use recent foods, or save custom combinations.",
                  accent: "bg-orange-50 text-orange-600",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-6 border border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.accent}`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real-time Coaching Examples */}
        <section className="py-20 sm:py-28 bg-neutral-50/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
                Real coaching
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Real-time coaching for real-life situations
              </h2>
              <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
                FuelWell doesn&apos;t just track — it coaches. Here&apos;s what
                that looks like in practice.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: MapPin,
                  iconBg: "bg-orange-50",
                  iconColor: "text-orange-500",
                  vizType: "plate" as const,
                  question:
                    "I'm at a Mexican restaurant. What should I order?",
                  answer:
                    "Go for grilled chicken fajitas with extra veggies. Skip the sour cream, keep the guac — it's healthy fat. Ask for corn tortillas instead of flour.",
                },
                {
                  icon: TrendingDown,
                  iconBg: "bg-blue-50",
                  iconColor: "text-blue-500",
                  vizType: "trend" as const,
                  question:
                    "I went over my calories yesterday. Should I eat less today?",
                  answer:
                    "No need to punish yourself. One day doesn't define your progress. Stick to your normal plan today and focus on hydration.",
                },
                {
                  icon: Timer,
                  iconBg: "bg-violet-50",
                  iconColor: "text-violet-500",
                  vizType: "timer" as const,
                  question:
                    "I only have 20 minutes to work out. Is it even worth it?",
                  answer:
                    "Absolutely. Here's a quick full-body circuit with no equipment. 20 minutes of focused effort beats skipping it entirely.",
                },
                {
                  icon: Scale,
                  iconBg: "bg-amber-50",
                  iconColor: "text-amber-500",
                  vizType: "scale" as const,
                  question:
                    "Why did my weight go up even though I've been eating well?",
                  answer:
                    "Weight fluctuates daily due to water retention, sodium, sleep, and stress. Your 7-day trend is still heading down.",
                },
                {
                  icon: Shuffle,
                  iconBg: "bg-emerald-50",
                  iconColor: "text-emerald-500",
                  vizType: "recipes" as const,
                  question:
                    "I'm bored with my meals. Can you mix it up?",
                  answer:
                    "Let's refresh your rotation. Here are 3 new recipes that hit your macros and budget with prep time under 30 minutes.",
                },
              ].map((item) => (
                <div
                  key={item.question}
                  className="bg-white rounded-2xl border border-neutral-200/80 p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
                >
                  {/* Mini visualization */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
                    >
                      <item.icon className={`w-4.5 h-4.5 ${item.iconColor}`} />
                    </div>
                    <CoachingViz type={item.vizType} />
                  </div>

                  {/* Question */}
                  <div className="bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100">
                    <p className="text-sm font-medium text-neutral-800 leading-relaxed">
                      {item.question}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="bg-primary-50/60 rounded-xl px-4 py-3 border border-primary-100/60">
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
                About us
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Built by people who get it
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <p className="text-neutral-600 leading-relaxed text-center mb-12">
                We&apos;re Max and Robby — two guys who got tired of nutrition
                apps that felt like spreadsheets. We&apos;ve both been through
                the cycle of tracking obsessively, burning out, and quitting.
                FuelWell is what we wished existed: a coach that meets you where
                you are, adapts to your life, and never makes you feel bad about
                a slice of pizza.
              </p>

              <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
                {/* Max */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
                    {/* Replace with <Image src="..." alt="Max" fill className="object-cover" /> */}
                    <span className="text-sm text-neutral-400">Photo</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">Max</p>
                </div>

                {/* Robby */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
                    {/* Replace with <Image src="..." alt="Robby" fill className="object-cover" /> */}
                    <span className="text-sm text-neutral-400">Photo</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">Robby</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Ready to eat smarter?
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Join FuelWell and get a personalized nutrition plan in under 2
              minutes. No credit card, no commitment.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg">
                  Create your free account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" href="/" />
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} FuelWell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
