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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <section className="space-y-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">{activitySummary.dateLabel}</p>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Activity</h1>
        </div>

        <Card className="bg-gradient-to-br from-primary-50/90 via-white to-accent-50/70 border-primary-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{activitySummary.verdict}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
                  {activitySummary.verdictDetail}
                </p>
              </div>
            </div>
            <Link
              href="/app/log"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              {activitySummary.nextAction}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} padding="sm" className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                <metric.icon className="h-4 w-4" />
              </div>
              <SourceBadge>{metric.source}</SourceBadge>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-neutral-900">{metric.value}</p>
              <p className="mt-1 text-sm font-medium text-neutral-700">{metric.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{metric.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <Card padding="sm">
          <div className="px-2 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Daily activity log</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {timeline.map((item) => (
              <div key={`${item.time}-${item.title}`} className="flex gap-4 px-2 py-4">
                <div className="w-20 shrink-0 text-xs font-medium tabular-nums text-neutral-400">{item.time}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                    <SourceBadge>{item.source}</SourceBadge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Next decisions</h2>
                <p className="text-xs text-neutral-500">What FuelWell can say before integrations.</p>
              </div>
            </div>
            <div className="space-y-3">
              {decisions.map((decision) => (
                <div key={decision} className="flex gap-3 rounded-xl bg-neutral-50 p-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <p className="text-sm leading-relaxed text-neutral-700">{decision}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 border-lemon-200 bg-lemon-50/60">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-lemon-600" />
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Data honesty</h2>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{activitySummary.sourceNote}</p>
              </div>
            </div>
          </Card>

          <Link
            href="/app/workouts"
            className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-200 hover:text-primary-700"
          >
            Choose a workout for this verdict
            <Bike className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
