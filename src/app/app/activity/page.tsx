"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bike,
  CalendarClock,
  Clock3,
  Flame,
  Info,
  Moon,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { useWorkoutLog } from "@/lib/use-workout-log";
import type { WorkoutEntry } from "@/lib/coach/types";

const activitySummary = {
  dateLabel: "Today",
  verdict: "Fuel normally, keep the session easy",
  verdictDetail:
    "Your logged meals support a light training day, but recovery inputs are incomplete. Treat calorie burn as directional until wearable data is connected.",
  nextAction: "Log post-workout protein",
  sourceNote:
    "Meals and soreness are user-entered examples. Steps, active calories, and readiness are deterministic estimates for this early product slice. Rows marked Sample are illustrative; workouts you log appear beside them.",
};

const metrics = [
  { label: "Steps", value: "6,420", detail: "Estimated from baseline activity", source: "Estimated", icon: Activity, tone: "primary" },
  { label: "Active calories", value: "380", detail: "Projected from steps + planned ride", source: "Estimated", icon: Flame, tone: "accent" },
  { label: "Sleep", value: "7h 10m", detail: "User-entered last night", source: "User-entered", icon: Moon, tone: "sky" },
  { label: "Last meal", value: "2h ago", detail: "Greek yogurt, berries, granola", source: "User-entered", icon: UtensilsCrossed, tone: "lemon" },
] as const;

type TimelineEntry = {
  id: string;
  time: string;
  minutes: number;
  title: string;
  detail: string;
  source: "Sample" | "Logged";
  status: "done" | "watch" | "next";
  href?: string;
};

const sampleTimeline: TimelineEntry[] = [
  { id: "sample-breakfast", time: "7:20 AM", minutes: 7 * 60 + 20, title: "Breakfast logged", detail: "Protein-forward meal, 31g protein.", source: "Sample", status: "done", href: "/app/log" },
  { id: "sample-walk", time: "10:45 AM", minutes: 10 * 60 + 45, title: "Walk detected", detail: "Estimated 1.8 mi easy effort.", source: "Sample", status: "done", href: "/app/fitness" },
  { id: "sample-lunch", time: "12:30 PM", minutes: 12 * 60 + 30, title: "Lunch gap", detail: "Carbs are light for an afternoon workout.", source: "Sample", status: "watch", href: "/app/log" },
  { id: "sample-planned", time: "5:30 PM", minutes: 17 * 60 + 30, title: "Planned workout", detail: "Zone 2 ride or strength primer.", source: "Sample", status: "next", href: "/app/workouts/zone-2-ride" },
];

function loggedTimelineEntries(workouts: WorkoutEntry[]): TimelineEntry[] {
  return workouts.map((workout) => {
    const loggedAt = new Date(workout.loggedAt);
    const calories = Math.round(workout.calories ?? 0);
    return {
      id: workout.id,
      time: loggedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      minutes: loggedAt.getHours() * 60 + loggedAt.getMinutes(),
      title: workout.name,
      detail: `${workout.category} · ${workout.durationMin} min${calories > 0 ? ` · ${calories} active kcal` : ""}`,
      source: "Logged",
      status: "done",
      href: "/app/fitness",
    };
  });
}

const decisions = [
  { label: "Keep intensity conversational", detail: "Add 35-50g carbs first if you want to push harder.", icon: Clock3 },
  { label: "Protect the protein window", detail: "Aim for 25-35g protein within two hours after training.", icon: UtensilsCrossed },
  { label: "Close the recovery loop", detail: "Add soreness and hydration tonight so tomorrow is less generic.", icon: ShieldCheck },
] as const;

const movementLoad = [
  { label: "Walking", value: 58, detail: "6.4k steps", color: "var(--color-primary-500)" },
  { label: "Planned ride", value: 42, detail: "Zone 2", color: "var(--color-sky-500)" },
  { label: "Strength strain", value: 18, detail: "Low", color: "var(--color-lemon-500)" },
];

const fuelWindows = [
  { label: "Breakfast", time: "7:20 AM", macro: "31g protein", state: "complete", fill: 64 },
  { label: "Lunch", time: "12:30 PM", macro: "Carbs light", state: "watch", fill: 38 },
  { label: "Post-workout", time: "Tonight", macro: "Protein due", state: "next", fill: 74 },
] as const;

const toneMap = {
  primary: "bg-primary-50 text-primary-700 ring-primary-100",
  accent: "bg-accent-100 text-accent-700 ring-accent-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  lemon: "bg-lemon-50 text-lemon-700 ring-lemon-100",
};

const fuelStateVariant = {
  complete: "success",
  watch: "warning",
  next: "info",
} as const;

const statusDot = {
  done: "bg-primary-500",
  watch: "bg-lemon-500",
  next: "bg-accent-500",
} as const;

function SourceBadge({ children }: { children: string }) {
  const variant =
    children === "Estimated" ? "warning" : children === "Sample" ? "neutral" : "success";

  return (
    <Badge variant={variant} size="sm">
      {children}
    </Badge>
  );
}

export default function ActivityPage() {
  const { workouts } = useWorkoutLog();
  const timeline = useMemo(
    () =>
      [...sampleTimeline, ...loggedTimelineEntries(workouts)].sort(
        (a, b) => a.minutes - b.minutes
      ),
    [workouts]
  );
  const loggedCount = workouts.length;

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="fw-heading text-2xl md:text-4xl">Activity</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">{activitySummary.dateLabel} · movement and fuel timing</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/log"
              className="fw-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-teal-600 px-5 py-3 text-sm font-black text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:w-auto"
            >
              {activitySummary.nextAction}
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        <section className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="fw-dark-panel overflow-hidden p-0">
            <div className="relative p-6 md:p-7">
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-primary-100 ring-1 ring-inset ring-white/15">
                  <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  Today&apos;s activity verdict
                </p>
                <h2 className="mt-4 max-w-3xl font-heading text-2xl font-black leading-tight tracking-tight text-white md:text-4xl">
                  {activitySummary.verdict}
                </h2>
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/74">
                  {activitySummary.verdictDetail}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2 min-[390px]:grid-cols-3 md:gap-3">
                  {metrics.slice(0, 3).map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`min-w-0 rounded-[1.05rem] bg-white/10 px-3 py-3 ring-1 ring-inset ring-white/12 backdrop-blur md:rounded-[1.25rem] md:px-5 md:py-4 ${
                        index === 2 ? "col-span-2 min-[390px]:col-span-1" : ""
                      }`}
                    >
                      <p className="font-heading text-xl font-black tabular-nums leading-tight text-white md:text-2xl">{metric.value}</p>
                      <p className="mt-1 text-[10px] font-black uppercase leading-tight tracking-[0.08em] text-white/58 md:text-xs md:tracking-[0.12em]">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-5">
            <SectionHeader
              icon={Sparkles}
              title="Next decisions"
              description="What changes the plan from here."
            />
            <div className="grid gap-3">
              {decisions.map((decision) => (
                <DecisionRow key={decision.label} {...decision} />
              ))}
            </div>
            <div className="rounded-[1.25rem] bg-primary-50/70 p-4 ring-1 ring-inset ring-primary-100">
              <div className="mb-2 flex items-center justify-between gap-3 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-800">
                <span>Current confidence</span>
                <span>Medium</span>
              </div>
              {/* Qualitative only. Confidence is a judgement here, not a
                  computed score, so the bar is decoration and is announced
                  as the word beside it, never as a figure. */}
              <div
                aria-hidden="true"
                className="h-2.5 overflow-hidden rounded-full bg-surface"
              >
                <div className="h-full w-2/3 rounded-full bg-primary-500 transition-[width] duration-700 ease-out-soft" />
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">
                Add a wearable sync or recovery check-in to make this recommendation more precise.
              </p>
            </div>
            <Link
              href="/app/workouts"
              className="fw-press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[1.15rem] bg-primary-50 px-4 py-3 text-sm font-black text-primary-800 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              Choose a workout for this verdict
              <Bike className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            </Link>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] ring-1 ring-inset ${toneMap[metric.tone]}`}>
                  <metric.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <SourceBadge>{metric.source}</SourceBadge>
              </div>
              <div className="min-w-0">
                <p className="truncate text-2xl font-black tabular-nums text-ink md:text-3xl">{metric.value}</p>
                <p className="mt-1 text-sm font-black text-ink md:text-base">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{metric.detail}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-5 px-6 py-6">
            <SectionHeader
              icon={BarChart3}
              title="Movement load"
              description="Aisle-style scan of where today's effort comes from."
              action={<Badge variant="success" dot>Light day</Badge>}
            />
            {/* The bar lengths are relative weighting only — there is no
                measured capacity behind them, so they carry no axis, no
                readout, and no numeric announcement. The words carry the
                meaning; the bar is a visual rank. */}
            <div className="space-y-4">
              {movementLoad.map((load) => (
                <div key={load.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: load.color }}
                      />
                      <span className="min-w-0 truncate text-ink">{load.label}</span>
                    </span>
                    <span className="shrink-0 text-ink-muted">{load.detail}</span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="h-4 overflow-hidden rounded-full bg-surface-sunken"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out-soft"
                      style={{ width: `${load.value}%`, backgroundColor: load.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-5 px-6 py-6">
            <SectionHeader
              icon={CalendarClock}
              title="Fuel timing"
              description="When today's logged food supports your planned movement."
              action={<Badge variant="warning" dot>1 gap</Badge>}
            />
            <div className="grid gap-3">
              {fuelWindows.map((window) => (
                <div
                  key={window.label}
                  className="rounded-[1.25rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-ink">{window.label}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-ink-muted">
                        <span className="tabular-nums">{window.time}</span> · {window.macro}
                      </p>
                    </div>
                    <Badge variant={fuelStateVariant[window.state]} size="sm" className="capitalize" dot>
                      {window.state}
                    </Badge>
                  </div>
                  {/* Same rule as movement load: no measured coverage exists
                      behind this width, so it stays a decorative rank. */}
                  <div
                    aria-hidden="true"
                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface"
                  >
                    <div
                      className="h-full rounded-full bg-primary-500 transition-[width] duration-700 ease-out-soft"
                      style={{ width: `${window.fill}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <Card className="px-6 py-6">
            <SectionHeader
              title="Daily activity log"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">
                    <span className="tabular-nums">{timeline.length}</span>
                    <span className="ml-1">signal{timeline.length === 1 ? "" : "s"}</span>
                  </Badge>
                  <Link
                    href="/app/fitness"
                    className="fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-black text-ink-muted ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500 md:min-h-0"
                  >
                    Open activity detail
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                  </Link>
                </div>
              }
            />
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] font-black uppercase tracking-[0.1em] text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary-500" />
                Done
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-lemon-500" />
                Watch
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent-500" />
                Next
              </span>
              <span className="normal-case tracking-normal text-ink-subtle">
                {loggedCount === 0
                  ? "No workouts logged today yet."
                  : `${loggedCount} logged workout${loggedCount === 1 ? "" : "s"} mixed in.`}
              </span>
            </p>
            {/* A continuous rail turns a stack of rows into a day: the dots
                sit on one axis, so "morning" and "tonight" read as distance. */}
            <div className="mt-2">
              {timeline.map((item, index) => {
                const isLast = index === timeline.length - 1;
                const row = (
                  <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-3 py-3 md:grid-cols-[5rem_1.5rem_minmax(0,1fr)]">
                    <div className="hidden pt-0.5 text-sm font-black tabular-nums text-ink-subtle md:block">
                      {item.time}
                    </div>
                    <div aria-hidden="true" className="relative flex h-full justify-center">
                      <span
                        className={`absolute top-1.5 h-3 w-3 rounded-full ring-4 ring-surface ${statusDot[item.status]}`}
                      />
                      {!isLast && (
                        <span className="absolute bottom-[-0.75rem] top-5 w-px bg-hairline-strong" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black tabular-nums text-ink-subtle md:hidden">
                        {item.time}
                      </p>
                      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 md:mt-0">
                        <p className="min-w-0 text-base font-black text-ink md:text-lg">{item.title}</p>
                        <SourceBadge>{item.source}</SourceBadge>
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{item.detail}</p>
                    </div>
                  </div>
                );

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-[1rem] px-2 transition-colors duration-200 ease-out-soft hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={item.id} className="px-2">
                    {row}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="tinted" className="space-y-3 border-lemon-200 bg-lemon-50/80 shadow-none">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-lemon-700 ring-1 ring-inset ring-lemon-200">
                <Info className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-lemon-800 md:text-xl">Data honesty</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-lemon-800/78">{activitySummary.sourceNote}</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function DecisionRow({
  label,
  detail,
  icon: Icon,
}: {
  label: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="fw-soft-row flex gap-3 p-4">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-black text-ink">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
      </div>
    </div>
  );
}
