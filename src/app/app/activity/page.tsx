import Link from "next/link";
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
import { Card } from "@/components/ui/card";

const activitySummary = {
  dateLabel: "Today",
  verdict: "Fuel normally, keep the session easy",
  verdictDetail:
    "Your logged meals support a light training day, but recovery inputs are incomplete. Treat calorie burn as directional until wearable data is connected.",
  nextAction: "Log post-workout protein",
  sourceNote:
    "Meals and soreness are user-entered examples. Steps, active calories, and readiness are deterministic estimates for this early product slice.",
};

const modes = ["Now", "After workout", "Tonight"];

const metrics = [
  { label: "Steps", value: "6,420", detail: "Estimated from baseline activity", source: "Estimated", icon: Activity, tone: "primary" },
  { label: "Active calories", value: "380", detail: "Projected from steps + planned ride", source: "Estimated", icon: Flame, tone: "accent" },
  { label: "Sleep", value: "7h 10m", detail: "User-entered last night", source: "User-entered", icon: Moon, tone: "sky" },
  { label: "Last meal", value: "2h ago", detail: "Greek yogurt, berries, granola", source: "User-entered", icon: UtensilsCrossed, tone: "lemon" },
] as const;

const timeline = [
  { time: "7:20 AM", title: "Breakfast logged", detail: "Protein-forward meal, 31g protein.", source: "User-entered", status: "done" },
  { time: "10:45 AM", title: "Walk detected", detail: "Estimated 1.8 mi easy effort.", source: "Estimated", status: "done" },
  { time: "12:30 PM", title: "Lunch gap", detail: "Carbs are light for an afternoon workout.", source: "Estimated", status: "watch" },
  { time: "5:30 PM", title: "Planned workout", detail: "Zone 2 ride or strength primer.", source: "User-entered", status: "next" },
];

const decisions = [
  { label: "Keep intensity conversational", detail: "Add 35-50g carbs first if you want to push harder.", icon: Clock3 },
  { label: "Protect the protein window", detail: "Aim for 25-35g protein within two hours after training.", icon: UtensilsCrossed },
  { label: "Close the recovery loop", detail: "Add soreness and hydration tonight so tomorrow is less generic.", icon: ShieldCheck },
] as const;

const movementLoad = [
  { label: "Walking", value: 58, detail: "6.4k steps", color: "bg-primary-500" },
  { label: "Planned ride", value: 42, detail: "Zone 2", color: "bg-sky-500" },
  { label: "Strength strain", value: 18, detail: "Low", color: "bg-lemon-500" },
];

const fuelWindows = [
  { label: "Breakfast", time: "7:20 AM", macro: "31g protein", state: "complete", width: "w-[64%]" },
  { label: "Lunch", time: "12:30 PM", macro: "Carbs light", state: "watch", width: "w-[38%]" },
  { label: "Post-workout", time: "Tonight", macro: "Protein due", state: "next", width: "w-[74%]" },
];

const toneMap = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  sky: "bg-sky-100 text-sky-700",
  lemon: "bg-lemon-100 text-lemon-700",
};

function SourceBadge({ children }: { children: string }) {
  const estimated = children === "Estimated";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black ${
        estimated ? "bg-lemon-50 text-lemon-700" : "bg-primary-50 text-primary-700"
      }`}
    >
      {children}
    </span>
  );
}

export default function ActivityPage() {
  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-3xl md:text-4xl">Activity</h1>
            <p className="fw-muted mt-1 text-base">{activitySummary.dateLabel} · movement and fuel timing</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white p-1 shadow-[0_18px_44px_rgba(22,48,42,0.10)]">
              {modes.map((mode, index) => (
                <span
                  key={mode}
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${
                    index === 0 ? "bg-primary-500 text-white" : "text-primary-900/60"
                  }`}
                >
                  {mode}
                </span>
              ))}
            </div>
            <Link
              href="/app/log"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:bg-primary-700"
            >
              {activitySummary.nextAction}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="fw-dark-panel overflow-hidden p-0">
            <div className="relative p-6 md:p-9">
              <div className="relative z-10">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-200">
                  <ShieldCheck className="h-4 w-4" />
                  Today&apos;s activity verdict
                </p>
                <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
                  {activitySummary.verdict}
                </h2>
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/74 md:mt-5 md:text-lg md:leading-8">
                  {activitySummary.verdictDetail}
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2 md:mt-7 md:gap-3">
                  {metrics.slice(0, 3).map((metric) => (
                    <div key={metric.label} className="rounded-[1.05rem] border border-white/12 bg-white/10 px-3 py-3 backdrop-blur md:rounded-[1.25rem] md:px-5 md:py-4">
                      <p className="text-xl font-black tabular-nums text-white md:text-3xl">{metric.value}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-white/58 md:text-xs md:tracking-[0.12em]">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="fw-icon-chip">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Next decisions</h2>
                <p className="text-sm font-semibold text-neutral-500">What changes the plan from here.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {decisions.map((decision) => (
                <DecisionRow key={decision.label} {...decision} />
              ))}
            </div>
            <div className="rounded-[1.25rem] border border-primary-100 bg-primary-50/70 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-primary-800">
                <span>Confidence</span>
                <span>Medium</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full w-[68%] rounded-full bg-primary-500" />
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-primary-900/65">
                Add a wearable sync or recovery check-in to make this recommendation more precise.
              </p>
            </div>
            <Link
              href="/app/workouts"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-primary-50 px-4 py-3 text-sm font-black text-primary-800 transition hover:bg-primary-100"
            >
              Choose a workout for this verdict
              <Bike className="h-4 w-4" />
            </Link>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[1.15rem] ${toneMap[metric.tone]}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <SourceBadge>{metric.source}</SourceBadge>
              </div>
              <div>
                <p className="text-3xl font-black tabular-nums text-neutral-900">{metric.value}</p>
                <p className="mt-1 text-base font-black text-neutral-800">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{metric.detail}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-5 px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  Movement load
                </h2>
                <p className="mt-1 text-sm font-semibold text-neutral-500">Aisle-style scan of where today&apos;s effort comes from.</p>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">Light day</span>
            </div>
            <div className="space-y-4">
              {movementLoad.map((load) => (
                <div key={load.label}>
                  <div className="mb-2 flex items-center justify-between text-sm font-black">
                    <span className="text-neutral-800">{load.label}</span>
                    <span className="text-neutral-400">{load.detail}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-primary-50">
                    <div className={`${load.color} h-full rounded-full`} style={{ width: `${load.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-5 px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-neutral-900">
                  <CalendarClock className="h-5 w-5 text-primary-600" />
                  Fuel timing
                </h2>
                <p className="mt-1 text-sm font-semibold text-neutral-500">Hover-light detail for when logged food supports movement.</p>
              </div>
              <span className="rounded-full bg-lemon-50 px-3 py-1 text-xs font-black text-lemon-700">1 gap</span>
            </div>
            <div className="grid gap-3">
              {fuelWindows.map((window) => (
                <div key={window.label} className="rounded-[1.25rem] border border-primary-100/70 bg-neutral-50/75 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-black text-neutral-900">{window.label}</p>
                      <p className="text-xs font-semibold text-neutral-500">{window.time} · {window.macro}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                        window.state === "complete"
                          ? "bg-primary-100 text-primary-700"
                          : window.state === "watch"
                            ? "bg-lemon-100 text-lemon-700"
                            : "bg-accent-100 text-accent-700"
                      }`}
                    >
                      {window.state}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div className={`${window.width} h-full rounded-full bg-primary-500`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <Card className="px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black text-neutral-900">Daily activity log</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">4 signals</span>
            </div>
            <div className="divide-y divide-primary-100/70">
              {timeline.map((item) => (
                <div key={`${item.time}-${item.title}`} className="grid gap-3 py-5 md:grid-cols-[6rem_1fr_auto] md:items-center">
                  <div className="text-sm font-black tabular-nums text-neutral-400">{item.time}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-neutral-900">{item.title}</p>
                      <SourceBadge>{item.source}</SourceBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{item.detail}</p>
                  </div>
                  <span className={`hidden h-3 w-3 rounded-full md:block ${item.status === "watch" ? "bg-lemon-500" : item.status === "next" ? "bg-accent-500" : "bg-primary-500"}`} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 border-lemon-200 bg-lemon-50/80">
            <div className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lemon-700">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-xl font-black text-lemon-800">Data honesty</h2>
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
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-black text-neutral-900">{label}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{detail}</p>
      </div>
    </div>
  );
}
