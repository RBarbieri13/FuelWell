"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bed,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  Gauge,
  HeartPulse,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const readiness = {
  score: 72,
  label: "Train, but cap intensity",
  detail:
    "Sleep and hydration look adequate. Soreness is still elevated, so FuelWell recommends strength technique work or Zone 2 instead of intervals.",
  nextAction: "Pick a lower-intensity workout",
};

const windows = ["Today", "3 days", "7 days"];

const checklist = [
  { label: "Sleep entered", detail: "7h 10m, quality marked good", done: true, source: "User-entered" },
  { label: "Hydration check", detail: "2 of 3 bottles logged", done: true, source: "User-entered" },
  { label: "Soreness check", detail: "Legs marked 6/10 after yesterday", done: true, source: "User-entered" },
  { label: "Wearable sync", detail: "Heart-rate variability is not connected yet", done: false, source: "Missing" },
];

const recoverySignals = [
  { label: "Sleep", value: "7h 10m", status: "Good", source: "User-entered", icon: Moon, tone: "sky" },
  { label: "Hydration", value: "66%", status: "Needs one more bottle", source: "User-entered", icon: Droplets, tone: "primary" },
  { label: "Soreness", value: "6/10", status: "High legs", source: "User-entered", icon: Dumbbell, tone: "accent" },
  { label: "Readiness", value: "72", status: "Estimated from available inputs", source: "Estimated", icon: Bed, tone: "lemon" },
] as const;

const nextActions = [
  { label: "Log a recovery snack", href: "/app/log", detail: "25g protein plus fruit keeps tomorrow's plan on track.", icon: UtensilsCrossed },
  { label: "Choose today's workout", href: "/app/workouts", detail: "Recommendations already account for soreness.", icon: Dumbbell },
  { label: "Review activity verdict", href: "/app/activity", detail: "See why the app is keeping intensity capped.", icon: HeartPulse },
] as const;

const readinessStack = [
  { label: "Sleep quality", value: 82, note: "Good", color: "bg-sky-500" },
  { label: "Hydration", value: 66, note: "One bottle short", color: "bg-primary-500" },
  { label: "Leg soreness", value: 58, note: "Cap intensity", color: "bg-accent-500" },
  { label: "Wearable signal", value: 0, note: "Not connected", color: "bg-neutral-300" },
];

const bodyAreas = [
  { label: "Upper", value: "2/10", tone: "bg-primary-50 text-primary-700 border-primary-100" },
  { label: "Core", value: "3/10", tone: "bg-primary-50 text-primary-700 border-primary-100" },
  { label: "Legs", value: "6/10", tone: "bg-accent-50 text-accent-700 border-accent-100" },
  { label: "Joints", value: "1/10", tone: "bg-sky-50 text-sky-700 border-sky-100" },
];

const toneMap = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  sky: "bg-sky-100 text-sky-700",
  lemon: "bg-lemon-100 text-lemon-700",
};

function SourceBadge({ children }: { children: string }) {
  if (children === "Missing") {
    return <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-black text-neutral-500">Missing</span>;
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
        children === "Estimated" ? "bg-lemon-50 text-lemon-700" : "bg-primary-50 text-primary-700"
      }`}
    >
      {children}
    </span>
  );
}

export default function RecoveryPage() {
  const [selectedWindow, setSelectedWindow] = useState(windows[0]);

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-3xl md:text-4xl">Recovery</h1>
            <p className="fw-muted mt-1 text-base">Sleep, soreness, hydration, and readiness signals</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white p-1 shadow-[0_18px_44px_rgba(22,48,42,0.10)]">
              {windows.map((window) => (
                <button
                  key={window}
                  type="button"
                  onClick={() => setSelectedWindow(window)}
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${
                    selectedWindow === window ? "bg-primary-500 text-white" : "text-primary-900/60"
                  }`}
                  aria-pressed={selectedWindow === window}
                >
                  {window}
                </button>
              ))}
            </div>
            <Link
              href="/app/workouts"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:bg-primary-700"
            >
              {readiness.nextAction}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
        <section className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Card variant="elevated" className="fw-mint-panel overflow-hidden px-6 py-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-700">
                  <ShieldCheck className="h-4 w-4" />
                  Readiness estimate
                </p>
                <h2 className="mt-4 font-heading text-3xl font-black leading-tight tracking-tight text-neutral-900 md:text-4xl">
                  {readiness.label}
                </h2>
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-primary-900/70">
                  {readiness.detail}
                </p>
              </div>
              <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-[20px] bg-white text-center shadow-[0_8px_18px_rgba(20,90,75,0.08)] md:h-32 md:w-32">
                <Gauge className="mb-1 h-6 w-6 text-primary-600" />
                <span className="font-heading text-5xl font-black tabular-nums text-primary-700">{readiness.score}</span>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">score</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="fw-icon-chip">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Next actions</h2>
                <p className="text-sm font-semibold text-neutral-500">Turn recovery data into tonight&apos;s plan.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {nextActions.map((action) => (
                <ActionLink key={action.label} {...action} />
              ))}
            </div>
            <div className="rounded-[1.25rem] border border-primary-100 bg-primary-50/70 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-primary-800">
                <span>Tonight target</span>
                <span>2 tasks</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-primary-800">
                  +1 bottle
                </span>
                <span className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-primary-800">
                  25g protein
                </span>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recoverySignals.map((signal) => (
            <Card key={signal.label} className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[1.15rem] ${toneMap[signal.tone]}`}>
                  <signal.icon className="h-5 w-5" />
                </div>
                <SourceBadge>{signal.source}</SourceBadge>
              </div>
              <div>
                <p className="text-3xl font-black tabular-nums text-neutral-900">{signal.value}</p>
                <p className="mt-1 text-base font-black text-neutral-800">{signal.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{signal.status}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
          <Card className="space-y-5 px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
                  <HeartPulse className="h-5 w-5 text-primary-600" />
                  Readiness makeup
                </h2>
                <p className="mt-1 text-sm font-semibold text-neutral-500">The ingredients behind today&apos;s cap-intensity call.</p>
              </div>
              <span className="rounded-full bg-lemon-50 px-3 py-1 text-xs font-black text-lemon-700">mixed</span>
            </div>
            <div className="space-y-4">
              {readinessStack.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm font-black">
                    <span className="text-neutral-800">{item.label}</span>
                    <span className="text-neutral-500">{item.note}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-primary-50">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-5 px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
                  <Waves className="h-5 w-5 text-primary-600" />
                  Soreness map
                </h2>
                <p className="mt-1 text-sm font-semibold text-neutral-500">Body-area detail for the workout recommendation.</p>
              </div>
              <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-black text-accent-700">legs high</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {bodyAreas.map((area) => (
                <div key={area.label} className={`rounded-[1.25rem] border p-4 ${area.tone}`}>
                  <p className="text-sm font-black">{area.label}</p>
                  <p className="mt-2 text-3xl font-black tabular-nums">{area.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black text-neutral-900">Recovery checklist</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">3 of 4 ready</span>
            </div>
            <div className="divide-y divide-primary-100/70">
              {checklist.map((item) => (
                <div key={item.label} className="flex gap-4 py-5">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.done ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-300"}`}>
                    {item.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-neutral-900">{item.label}</p>
                      <SourceBadge>{item.source}</SourceBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="space-y-3 border-lemon-200 bg-lemon-50/80">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lemon-700">
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-xl font-black text-lemon-800">What is estimated?</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-lemon-800/78">
                  {selectedWindow} readiness is calculated from your logged sleep, hydration, and soreness above. HRV, resting heart rate, and workout load are not included yet.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-primary-100 bg-primary-50/80">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-700">
                  <UtensilsCrossed className="h-4 w-4" />
                </span>
                <p className="text-base font-semibold leading-7 text-primary-900/78">
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
      className="fw-soft-row group block p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-100 text-primary-700">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-black text-neutral-900">{label}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{detail}</p>
          </div>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
      </div>
    </Link>
  );
}
