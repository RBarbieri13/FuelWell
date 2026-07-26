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
import { Card } from "@/components/ui/card";
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
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Logo size="lg" href="/" />
          {/* Nav CTAs step down to ghost/tonal so the hero owns the page's one
              primary action. */}
          <div className="flex items-center gap-1.5">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="tonal" size="sm">
                Get started
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-12 xl:py-16">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-700 shadow-e1 ring-1 ring-inset ring-primary-100">
              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              Daily decision system
            </div>
            <h1 className="fw-heading max-w-xl text-4xl leading-[1.06] sm:text-5xl lg:text-6xl">
              A nutrition coach for the next choice, not a spreadsheet for
              the last mistake.
            </h1>
            {/* The Link must carry the width too, or the full-width button
                inside an inline anchor collapses on mobile. */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start free
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                </Button>
              </Link>
              <Link href="/app/dashboard" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Preview the app
                </Button>
              </Link>
            </div>
            <ul className="flex flex-wrap gap-2">
              <TrustPill>Free to start</TrustPill>
              <TrustPill>No credit card</TrustPill>
              <TrustPill>Works with any diet</TrustPill>
            </ul>
          </div>

          <AppPreview />
        </section>

        <section id="how-it-works" className="border-y border-hairline bg-surface/60 py-16 sm:py-20">
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
              <Card variant="tinted" padding="sm" className="mt-7">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-700">
                  The point is not perfect tracking.
                </p>
                <p className="mt-2 text-lg font-semibold leading-7 text-ink-muted">
                  The point is making the next clean choice obvious enough to
                  act on when your day is already moving.
                </p>
              </Card>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURE_ROWS.map((feature) => (
                <FeatureRow key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-hairline bg-surface/60 py-16 sm:py-20">
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
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto">
                      Create account
                      <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full border-transparent bg-white/10 text-white shadow-none ring-1 ring-inset ring-white/20 hover:border-transparent hover:bg-white/20 active:bg-white/25 sm:w-auto"
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

      <footer className="border-t border-hairline bg-surface/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <Logo size="sm" href="/" />
          <p className="text-sm font-semibold text-ink-muted">
            &copy; {new Date().getFullYear()} FuelWell. Built for the next clean choice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AppPreview() {
  return (
    // One elevation for the whole mock. Everything nested inside steps down to
    // hairlines and tints rather than stacking a second drop shadow.
    <div className="rounded-[2.25rem] border border-hairline-strong bg-surface/90 p-4 shadow-e4 backdrop-blur">
      <div className="fw-dark-panel rounded-[1.75rem] border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
              Today&apos;s decision
            </p>
            <h2 className="mt-3 max-w-lg text-3xl font-black leading-tight text-white sm:text-4xl">
              You have room to make a clean next choice.
            </h2>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-primary-400 text-primary-950">
            <Sparkles className="h-6 w-6" strokeWidth={2} />
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DarkMetric label="Calories left" value="1400" />
          <DarkMetric label="Protein left" value="102g" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1fr]">
        <div className="rounded-[1.75rem] border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-ink">Today&apos;s plate</h3>
              <p className="text-sm font-semibold text-ink-muted">Logged meals only.</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
              <Leaf className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            </span>
          </div>
          <CalorieRing />
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

// Product mock for the marketing hero. The geometry is derived from the two
// figures the panel already states (1,400 kcal remaining of a 3,300 kcal day),
// so the arc, the centre number, and the aria-label cannot drift apart.
const RING_TARGET = 3300;
const RING_REMAINING = 1400;
const RING_RADIUS = 66;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CalorieRing() {
  const consumedRatio = (RING_TARGET - RING_REMAINING) / RING_TARGET;

  return (
    <div className="relative mx-auto mt-5 flex h-40 w-40 items-center justify-center">
      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 h-full w-full -rotate-90 animate-in fade-in-0 zoom-in-95 duration-700 ease-out-soft"
        role="img"
        aria-label={`Calories: ${RING_REMAINING.toLocaleString()} of ${RING_TARGET.toLocaleString()} remaining, ${Math.round(consumedRatio * 100)} percent used.`}
      >
        <defs>
          <linearGradient id="fw-ring-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-400)" />
            <stop offset="100%" stopColor="var(--color-teal-600)" />
          </linearGradient>
        </defs>
        <circle
          cx="80"
          cy="80"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-surface-sunken)"
          strokeWidth="14"
        />
        {/* Quarter ticks give the ring a scale — without them the arc length
            is unreadable as a proportion. */}
        {[0, 90, 180, 270].map((angle) => (
          <line
            key={angle}
            x1="80"
            y1="7"
            x2="80"
            y2="15"
            stroke="var(--color-hairline-strong)"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${angle} 80 80)`}
          />
        ))}
        <circle
          cx="80"
          cy="80"
          r={RING_RADIUS}
          fill="none"
          stroke="url(#fw-ring-fill)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - consumedRatio)}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-black tabular-nums leading-none text-ink">
          {RING_REMAINING.toLocaleString()}
        </p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
          remaining
        </p>
        <p className="mt-1.5 text-[0.6875rem] font-bold tabular-nums text-ink-faint">
          of {RING_TARGET.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function TrustPill({ children }: { children: React.ReactNode }) {
  return (
    // Supporting reassurance, not a heading — text-xl made these outweigh the
    // CTA row directly above them.
    <li className="inline-flex items-center gap-2 rounded-full bg-surface/70 px-3.5 py-2 text-sm font-bold text-ink-muted ring-1 ring-inset ring-hairline-strong">
      <Check className="h-4 w-4 shrink-0 text-primary-600" strokeWidth={2.75} />
      {children}
    </li>
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
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-700">
        {kicker}
      </p>
      <h2 className="fw-heading mt-3 text-3xl sm:text-4xl">{title}</h2>
      <p
        className={cn(
          "mt-3 text-lg font-semibold leading-8 text-ink-muted",
          align === "center" && "mx-auto max-w-2xl"
        )}
      >
        {copy}
      </p>
    </div>
  );
}

// Every card below sits at one elevation (Card's own), with a single icon
// size and stroke weight per context.
function FeatureCard({ icon: Icon, title, copy }: { icon: LucideIcon; title: string; copy: string }) {
  return (
    <article className="h-full">
      <Card padding="md" className="h-full">
        <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
        <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
        <p className="mt-2 text-base font-semibold leading-7 text-ink-muted">{copy}</p>
      </Card>
    </article>
  );
}

function FeatureRow({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <article className="h-full">
      <Card variant="tinted" padding="sm" className="flex h-full gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="font-black text-ink">{title}</h3>
          <p className="mt-0.5 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
        </div>
      </Card>
    </article>
  );
}

function CoachExample({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="h-full">
      <Card padding="sm" className="flex h-full flex-col">
        {/* Nested blocks are tints, never a second shadow. */}
        <p className="rounded-[1.25rem] bg-surface-muted p-4 text-sm font-black leading-6 text-ink">
          {question}
        </p>
        <p className="mt-2.5 rounded-[1.25rem] bg-primary-50 p-4 text-sm font-semibold leading-6 text-ink-muted ring-1 ring-inset ring-primary-100">
          {answer}
        </p>
      </Card>
    </article>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/10 p-4 ring-1 ring-inset ring-white/15">
      <p className="text-3xl font-black tabular-nums leading-none text-white">{value}</p>
      <p className="mt-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/60">
        {label}
      </p>
    </div>
  );
}

function MiniSurface({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="font-black text-ink">{title}</p>
        <p className="mt-0.5 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
      </div>
    </div>
  );
}
