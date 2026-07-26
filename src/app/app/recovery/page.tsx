"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  Gauge,
  HeartPulse,
  Moon,
  PlugZap,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";

const readiness = {
  score: 72,
  label: "Train, but cap intensity",
  detail:
    "Sleep and hydration look adequate. Soreness is still elevated, so FuelWell recommends strength technique work or Zone 2 instead of intervals.",
  nextAction: "Pick a lower-intensity workout",
};

const checklist = [
  { label: "Sleep entered", detail: "7h 10m, quality marked good", done: true, source: "User-entered", href: "/app/daily-review" },
  { label: "Hydration check", detail: "2 of 3 bottles logged", done: true, source: "User-entered", href: "/app/daily-review" },
  { label: "Soreness check", detail: "Legs marked 6/10 after yesterday", done: true, source: "User-entered", href: "/app/daily-review" },
  { label: "Wearable sync", detail: "Heart-rate variability is not connected yet", done: false, source: "Missing", href: "/app/settings" },
];

const recoverySignals = [
  { label: "Sleep", value: "7h 10m", status: "Good", source: "User-entered", icon: Moon, tone: "sky" },
  { label: "Hydration", value: "2/3", status: "Bottles — one more to go", source: "User-entered", icon: Droplets, tone: "primary" },
  { label: "Soreness", value: "6/10", status: "High legs", source: "User-entered", icon: Zap, tone: "accent" },
  { label: "Inputs used", value: "3/4", status: "Wearable missing", source: "Estimated", icon: Gauge, tone: "lemon" },
] as const;

const nextActions = [
  { label: "Log a recovery snack", href: "/app/log", detail: "25g protein plus fruit keeps tomorrow's plan on track.", icon: UtensilsCrossed },
  { label: "Choose today's workout", href: "/app/workouts", detail: "Recommendations already account for soreness.", icon: Dumbbell },
  { label: "Review activity verdict", href: "/app/activity", detail: "See why the app is keeping intensity capped.", icon: HeartPulse },
] as const;

const readinessStack = [
  { label: "Sleep quality", value: 82, note: "Good", color: "var(--color-sky-500)", connected: true },
  { label: "Hydration", value: 66, note: "One bottle short", color: "var(--color-primary-500)", connected: true },
  { label: "Leg soreness", value: 58, note: "Cap intensity", color: "var(--color-accent-400)", connected: true },
  { label: "Wearable signal", value: 0, note: "Not connected", color: "var(--color-ink-faint)", connected: false },
];

const bodyAreas = [
  { label: "Upper", value: 2 },
  { label: "Core", value: 3 },
  { label: "Legs", value: 6 },
  { label: "Joints", value: 1 },
];

const toneMap = {
  primary: "bg-primary-50 text-primary-700 ring-primary-100",
  accent: "bg-accent-100 text-accent-700 ring-accent-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  lemon: "bg-lemon-50 text-lemon-700 ring-lemon-100",
};

/** 0-3 easy, 4-5 watch, 6+ cap intensity. Colour follows the same thresholds. */
function sorenessTone(value: number) {
  if (value >= 6) {
    return {
      plate: "bg-accent-50 text-accent-700 ring-accent-200",
      meter: "var(--color-accent-400)",
      word: "high",
    };
  }
  if (value >= 4) {
    return {
      plate: "bg-lemon-50 text-lemon-700 ring-lemon-200",
      meter: "var(--color-lemon-500)",
      word: "moderate",
    };
  }
  return {
    plate: "bg-primary-50 text-primary-800 ring-primary-100",
    meter: "var(--color-primary-500)",
    word: "low",
  };
}

function SourceBadge({ children }: { children: string }) {
  const variant =
    children === "Missing" ? "neutral" : children === "Estimated" ? "warning" : "success";

  return (
    <Badge variant={variant} size="sm">
      {children}
    </Badge>
  );
}

/**
 * Readiness dial. The old tile printed "72" with no scale, which reads as a
 * raw number rather than a position on a range — the arc puts 72 against its
 * 0-100 ceiling and keeps the endpoints labelled.
 */
function ReadinessDial({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  // Three-quarter sweep leaves a labelled gap at the bottom for the endpoints.
  const sweep = 0.75;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="relative h-28 w-28 md:h-32 md:w-32"
        role="img"
        aria-label={`Readiness estimate: ${clamped} out of 100`}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full rotate-[135deg]" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-surface-sunken)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circumference * sweep} ${circumference}`}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-primary-500)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circumference * sweep * (clamped / 100)} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700 ease-out-soft"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Gauge className="h-5 w-5 text-primary-600" strokeWidth={2} aria-hidden="true" />
          <span className="font-heading text-3xl font-black tabular-nums leading-none text-primary-700 md:text-4xl">
            {clamped}
          </span>
          <span className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-ink-subtle">
            of 100
          </span>
        </div>
      </div>
      <div className="flex w-28 items-center justify-between text-[10px] font-black tabular-nums text-ink-faint md:w-32">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

export default function RecoveryPage() {
  const readyCount = checklist.filter((item) => item.done).length;

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="fw-heading text-2xl md:text-4xl">Recovery</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">Sleep, soreness, hydration, and readiness signals</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/workouts"
              className="fw-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-teal-600 px-5 py-3 text-sm font-black text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:w-auto"
            >
              {readiness.nextAction}
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        <section className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Card variant="elevated" className="fw-mint-panel overflow-hidden px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 rounded-full bg-surface/70 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-700 ring-1 ring-inset ring-primary-100">
                  <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  Readiness estimate
                </p>
                <h2 className="mt-3 font-heading text-2xl font-black leading-tight tracking-tight text-ink md:text-4xl">
                  {readiness.label}
                </h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-ink-muted md:text-base md:leading-7">
                  {readiness.detail}
                </p>
              </div>
              <ReadinessDial score={readiness.score} />
            </div>
          </Card>

          <Card className="space-y-5">
            <SectionHeader
              icon={Sparkles}
              title="Next actions"
              description="Turn recovery data into tonight's plan."
            />
            <div className="grid gap-3">
              {nextActions.map((action) => (
                <ActionLink key={action.label} {...action} />
              ))}
            </div>
            <div className="rounded-[1.25rem] bg-primary-50/70 p-4 ring-1 ring-inset ring-primary-100">
              <div className="mb-2 flex items-center justify-between gap-3 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-800">
                <span>Tonight target</span>
                <span className="tabular-nums">2 tasks</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/app/daily-review"
                  className="fw-press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-surface px-3 py-2 text-center text-xs font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                >
                  <Droplets className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  <span className="tabular-nums">+1 bottle</span>
                </Link>
                <Link
                  href="/app/log"
                  className="fw-press inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-surface px-3 py-2 text-center text-xs font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                >
                  <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  <span className="tabular-nums">25g protein</span>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recoverySignals.map((signal) => (
            <Card key={signal.label} className="space-y-3 px-4 py-4 md:space-y-4 md:px-5 md:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] ring-1 ring-inset", toneMap[signal.tone])}>
                  <signal.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <SourceBadge>{signal.source}</SourceBadge>
              </div>
              <div className="min-w-0">
                <p className="truncate text-2xl font-black tabular-nums text-ink md:text-3xl">{signal.value}</p>
                <p className="mt-1 text-sm font-black text-ink md:text-base">{signal.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{signal.status}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
          <Card className="space-y-5 px-6 py-6">
            <SectionHeader
              icon={HeartPulse}
              title="Readiness makeup"
              description="The ingredients behind today's cap-intensity call."
              action={<Badge variant="warning" dot>mixed</Badge>}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] text-ink-faint">
                <span>0</span>
                <span>50</span>
                <span>100 contribution</span>
              </div>
              {readinessStack.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                    <span className="min-w-0 truncate text-ink">{item.label}</span>
                    <span className="shrink-0 text-ink-muted">
                      {item.connected ? (
                        <>
                          <span className="tabular-nums">{item.value}</span> · {item.note}
                        </>
                      ) : (
                        item.note
                      )}
                    </span>
                  </div>
                  {item.connected ? (
                    <div className="relative">
                      <ProgressMeter
                        value={item.value}
                        target={100}
                        color={item.color}
                        size="lg"
                        label={`${item.label}: ${item.value} out of 100 — ${item.note}`}
                        className="bg-surface-sunken"
                      />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                        {[25, 50, 75].map((tick) => (
                          <span
                            key={tick}
                            className="absolute inset-y-0 w-px bg-ink/10"
                            style={{ left: `${tick}%` }}
                          />
                        ))}
                      </span>
                    </div>
                  ) : (
                    // No series, no bar. A zero-width fill would read as "you
                    // scored zero" rather than "this input is missing".
                    <div className="flex h-4 items-center gap-2 rounded-full border border-dashed border-hairline-strong px-3">
                      <PlugZap className="h-3 w-3 shrink-0 text-ink-faint" strokeWidth={2.5} aria-hidden="true" />
                      <span className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-ink-faint">
                        No data yet
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-5 px-6 py-6">
            <SectionHeader
              icon={Waves}
              title="Soreness map"
              description="Body-area detail for the workout recommendation."
              action={<Badge variant="error" dot>legs high</Badge>}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {bodyAreas.map((area) => {
                const tone = sorenessTone(area.value);
                return (
                  <div
                    key={area.label}
                    className={cn("min-w-0 rounded-[1.25rem] p-4 ring-1 ring-inset", tone.plate)}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-black">{area.label}</p>
                      <p className="shrink-0 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">
                        {tone.word}
                      </p>
                    </div>
                    <p className="mt-2 text-2xl font-black tabular-nums md:text-3xl">
                      {area.value}
                      <span className="text-base opacity-60">/10</span>
                    </p>
                    <ProgressMeter
                      value={area.value}
                      target={10}
                      color={tone.meter}
                      size="sm"
                      label={`${area.label} soreness: ${area.value} out of 10`}
                      className="mt-3 bg-surface/70"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-semibold leading-5 text-ink-muted">
              Scale runs 0 (no soreness) to 10 (very sore). Anything at 6 or above caps today&apos;s intensity.
            </p>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="px-6 py-6">
            <SectionHeader
              title="Recovery checklist"
              action={
                <Badge variant={readyCount === checklist.length ? "success" : "default"}>
                  <span className="tabular-nums">
                    {readyCount} of {checklist.length}
                  </span>
                  <span className="ml-1">ready</span>
                </Badge>
              }
            />
            <div className="mt-2 divide-y divide-hairline">
              {checklist.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[3.5rem] gap-4 rounded-[1rem] px-2 py-4 transition-colors duration-200 ease-out-soft hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset",
                      item.done
                        ? "bg-primary-50 text-primary-700 ring-primary-200"
                        : "bg-surface-muted text-ink-faint ring-hairline-strong"
                    )}
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2.25} />
                    ) : (
                      <Circle className="h-5 w-5" strokeWidth={2.25} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="min-w-0 text-base font-black text-ink md:text-lg">{item.label}</p>
                      <SourceBadge>{item.source}</SourceBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{item.detail}</p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 self-center text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
                    strokeWidth={2.25}
                  />
                </Link>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card variant="tinted" className="space-y-3 border-lemon-200 bg-lemon-50/80 shadow-none">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-lemon-700 ring-1 ring-inset ring-lemon-200">
                  <ShieldAlert className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-lemon-800 md:text-xl">What is estimated?</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-lemon-800/78">
                    Today&apos;s readiness is calculated from your logged sleep, hydration, and soreness — the signals shown above are today&apos;s only. HRV, resting heart rate, and workout load are not included yet.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="tinted" className="border-primary-100 bg-primary-50/80 shadow-none">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-primary-700 ring-1 ring-inset ring-primary-100">
                  <UtensilsCrossed className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <p className="min-w-0 text-sm font-semibold leading-6 text-ink-muted md:text-base md:leading-7">
                  Clear next action: log protein plus fluids before bed so tomorrow&apos;s readiness estimate has one less guess.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function ActionLink({
  label,
  href,
  detail,
  icon: Icon,
}: {
  label: string;
  href: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="fw-soft-row fw-press group block min-h-[3.5rem] p-4 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-surface hover:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-black text-ink">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
          </div>
        </div>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
          strokeWidth={2.25}
        />
      </div>
    </Link>
  );
}
