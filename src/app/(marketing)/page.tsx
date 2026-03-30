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
} from "lucide-react";

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
