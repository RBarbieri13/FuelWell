import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Camera,
  Check,
  ChefHat,
  Dumbbell,
  Leaf,
  MessageCircle,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
  Target,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const WORKFLOWS = [
  {
    icon: UtensilsCrossed,
    title: "Log the real meal",
    copy: "Search, scan, snap a photo, or add a custom plate without turning dinner into data entry.",
  },
  {
    icon: Brain,
    title: "Ask the coach",
    copy: "Get a next move based on what you already ate, what you still need, and how your day is going.",
  },
  {
    icon: BarChart3,
    title: "Watch the pattern",
    copy: "Progress reads like direction over time, not a pass/fail scoreboard for one imperfect day.",
  },
] satisfies { icon: LucideIcon; title: string; copy: string }[];

const FEATURE_ROWS = [
  { icon: Target, title: "Daily targets", detail: "Calories and macros sized from setup." },
  { icon: Camera, title: "Photo estimates", detail: "Draft meals from a plate image." },
  { icon: ScanBarcode, title: "Barcode lookup", detail: "Fast grocery and packaged-food logging." },
  { icon: ChefHat, title: "Recipes", detail: "Meals that respect goals and preferences." },
  { icon: Dumbbell, title: "Workouts", detail: "Suggestions that fit energy and recovery." },
  { icon: ShieldCheck, title: "Food rules", detail: "Diet and allergy context stays attached." },
] satisfies { icon: LucideIcon; title: string; detail: string }[];

const COACH_MESSAGES = [
  {
    question: "I have 1,400 calories and 102g protein left. What should dinner be?",
    answer: "Build dinner around lean protein first. Chicken quinoa bowl or salmon with sweet potatoes both close the gap cleanly.",
  },
  {
    question: "I only have 20 minutes to move. Is that worth logging?",
    answer: "Yes. Pick a low-impact full-body circuit and keep intensity moderate so tomorrow still works.",
  },
  {
    question: "Why did my weight jump after a good day?",
    answer: "Likely water, sodium, stress, or sleep. Your trend matters more than one weigh-in.",
  },
] satisfies { question: string; answer: string }[];

export default function HomePage() {
  return (
    <div className="fw-app-surface min-h-screen">
      <header className="sticky top-0 z-40 border-b border-primary-100/70 bg-[#e8f6f2]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo size="lg" href="/" />
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-12 xl:py-16">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Daily decision system
            </div>
            <div>
              <h1 className="fw-heading text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
                FuelWell
              </h1>
              <p className="mt-5 max-w-xl text-xl font-bold leading-8 text-[#516b63]">
                A nutrition coach for the next choice, not a spreadsheet for
                the last mistake.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Preview the app
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <TrustPill>Free to start</TrustPill>
              <TrustPill>No credit card</TrustPill>
              <TrustPill>Works with any diet</TrustPill>
            </div>
          </div>

          <AppPreview />
        </section>

        <section id="how-it-works" className="border-y border-primary-100/70 bg-white/56 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="How it works"
              title="The same loop, every day"
              copy="Log what happened, see what still matters, and let the coach pick the highest-leverage next move."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {WORKFLOWS.map((workflow) => (
                <FeatureCard key={workflow.title} {...workflow} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <SectionHeading
                align="left"
                kicker="Product"
                title="Built for messy real life"
                copy="FuelWell keeps the practical surfaces close together: food, coach, workouts, recipes, groceries, recovery, and progress."
              />
              <div className="mt-7 rounded-[1.75rem] border border-primary-100/80 bg-white/72 p-5 shadow-[0_18px_50px_rgba(22,48,42,0.08)]">
                <p className="text-sm font-black text-[#16302a]">
                  The point is not perfect tracking.
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#78928a]">
                  The point is making the next clean choice obvious enough to
                  act on when your day is already moving.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURE_ROWS.map((feature) => (
                <FeatureRow key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-primary-100/70 bg-white/56 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Coach"
              title="Answers that can carry structure"
              copy="The coach can respond with practical plans, comparisons, lists, tables, meal ideas, and progress explanations right in the chat."
            />
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {COACH_MESSAGES.map((message) => (
                <CoachExample key={message.question} {...message} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="fw-dark-panel overflow-hidden rounded-[2rem] border p-7 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-100">
                    Start in two minutes
                  </p>
                  <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                    Get a starting plan, then let the app adapt from real logs.
                  </h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full border-white/15 bg-white/10 text-white hover:bg-white/15 sm:w-auto"
                    >
                      Log in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary-100/70 bg-white/45 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <Logo size="sm" href="/" />
          <p className="text-sm font-semibold text-[#78928a]">
            &copy; {new Date().getFullYear()} FuelWell. Built for the next clean choice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AppPreview() {
  return (
    <div className="rounded-[2.25rem] border border-primary-100/80 bg-white/90 p-4 shadow-[0_28px_80px_rgba(22,48,42,0.16)] backdrop-blur">
      <div className="fw-dark-panel rounded-[1.75rem] border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
              Today&apos;s decision
            </p>
            <h2 className="mt-3 max-w-lg text-4xl font-black leading-tight text-white">
              You have room to make a clean next choice.
            </h2>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-400 text-primary-950">
            <Sparkles className="h-6 w-6" />
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DarkMetric label="Calories left" value="1400" />
          <DarkMetric label="Protein left" value="102g" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1fr]">
        <div className="rounded-[1.75rem] border border-primary-100/80 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#16302a]">Today&apos;s plate</h3>
              <p className="text-sm font-semibold text-[#78928a]">Logged meals only.</p>
            </div>
            <Leaf className="h-5 w-5 text-primary-600" />
          </div>
          <div className="mx-auto mt-5 flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-primary-100 border-t-primary-500">
            <div className="text-center">
              <p className="text-3xl font-black tabular-nums text-[#16302a]">1400</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#91a7a0]">
                remaining
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <MiniSurface icon={UtensilsCrossed} title="Log Meal" detail="Breakfast and lunch are already counted." />
          <MiniSurface icon={MessageCircle} title="Ask Coach" detail="Generate dinner options that close the gap." />
          <MiniSurface icon={Dumbbell} title="Move" detail="Pick a low-impact workout for today." />
        </div>
      </div>
    </div>
  );
}

function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/70 px-3 py-2 text-sm font-black text-[#516b63]">
      <Check className="h-4 w-4 text-primary-600" />
      {children}
    </span>
  );
}

function SectionHeading({
  kicker,
  title,
  copy,
  align = "center",
}: {
  kicker: string;
  title: string;
  copy: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("mx-auto max-w-3xl", align === "center" ? "text-center" : "mx-0 text-left")}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">
        {kicker}
      </p>
      <h2 className="fw-heading mt-3 text-3xl sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base font-semibold leading-7 text-[#78928a]">{copy}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, copy }: { icon: LucideIcon; title: string; copy: string }) {
  return (
    <article className="rounded-[1.75rem] border border-primary-100/80 bg-white p-6 shadow-[0_18px_50px_rgba(22,48,42,0.08)]">
      <div className="fw-icon-chip">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-black text-[#16302a]">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#78928a]">{copy}</p>
    </article>
  );
}

function FeatureRow({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <article className="fw-soft-row flex gap-4 p-4">
      <div className="fw-icon-chip h-12 w-12 shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-black text-[#16302a]">{title}</h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#78928a]">{detail}</p>
      </div>
    </article>
  );
}

function CoachExample({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-[1.75rem] border border-primary-100/80 bg-white p-5 shadow-[0_18px_50px_rgba(22,48,42,0.08)]">
      <div className="rounded-[1.25rem] bg-[#f3f8f6] p-4">
        <p className="text-sm font-black leading-6 text-[#16302a]">{question}</p>
      </div>
      <div className="mt-3 rounded-[1.25rem] bg-primary-50 p-4">
        <p className="text-sm font-semibold leading-6 text-[#516b63]">{answer}</p>
      </div>
    </article>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4">
      <p className="text-3xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/55">{label}</p>
    </div>
  );
}

function MiniSurface({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="fw-soft-row flex items-center gap-3 p-4">
      <div className="fw-icon-chip h-11 w-11 rounded-[1rem]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-black text-[#16302a]">{title}</p>
        <p className="text-sm font-semibold text-[#78928a]">{detail}</p>
      </div>
    </div>
  );
}
