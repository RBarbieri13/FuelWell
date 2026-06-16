import Link from "next/link";
import { Activity, ArrowRight, Bike, Clock3, Flame, Info, Moon, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
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

const metrics = [
  { label: "Steps", value: "6,420", detail: "Estimated from baseline activity", source: "Estimated", icon: Activity },
  { label: "Active calories", value: "380", detail: "Projected from steps + planned ride", source: "Estimated", icon: Flame },
  { label: "Sleep", value: "7h 10m", detail: "User-entered last night", source: "User-entered", icon: Moon },
  { label: "Last meal", value: "2h ago", detail: "Greek yogurt, berries, granola", source: "User-entered", icon: UtensilsCrossed },
];

const timeline = [
  { time: "7:20 AM", title: "Breakfast logged", detail: "Protein-forward meal, 31g protein.", source: "User-entered" },
  { time: "10:45 AM", title: "Walk detected", detail: "Estimated 1.8 mi easy effort.", source: "Estimated" },
  { time: "12:30 PM", title: "Lunch gap", detail: "Carbs are light for an afternoon workout.", source: "Estimated" },
  { time: "5:30 PM", title: "Planned workout", detail: "Zone 2 ride or strength primer.", source: "User-entered" },
];

const decisions = [
  "Keep intensity conversational unless you add 35-50g carbs before training.",
  "Prioritize 25-35g protein within two hours after the session.",
  "Add a recovery check-in tonight so tomorrow's recommendation can be less generic.",
];

function SourceBadge({ children }: { children: string }) {
  const estimated = children === "Estimated";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
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
          <Link
            href="/app/log"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:bg-primary-700"
          >
            {activitySummary.nextAction}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="fw-dark-panel overflow-hidden p-0">
            <div className="p-7 md:p-9">
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-primary-200">
                <ShieldCheck className="h-4 w-4" />
                Today&apos;s activity verdict
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl">
                {activitySummary.verdict}
              </h2>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-white/74">
                {activitySummary.verdictDetail}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {metrics.slice(0, 3).map((metric) => (
                  <div key={metric.label} className="rounded-[1.25rem] border border-white/12 bg-white/10 px-5 py-4 backdrop-blur">
                    <p className="text-3xl font-black tabular-nums text-white">{metric.value}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/58">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="fw-icon-chip">
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Next decisions</h2>
                <p className="text-sm font-semibold text-neutral-500">What FuelWell can say before integrations.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {decisions.map((decision) => (
                <div key={decision} className="fw-soft-row flex gap-3 p-4">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <p className="text-sm font-semibold leading-6 text-neutral-700">{decision}</p>
                </div>
              ))}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-primary-100 text-primary-700">
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
                  <span className="hidden h-3 w-3 rounded-full bg-primary-500 md:block" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 border-lemon-200 bg-lemon-50/80">
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
