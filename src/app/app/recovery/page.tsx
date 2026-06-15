import Link from "next/link";
import { ArrowRight, Bed, CheckCircle2, Circle, Droplets, Dumbbell, Info, Moon, ShieldAlert, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";

const readiness = {
  score: 72,
  label: "Train, but cap intensity",
  detail:
    "Sleep and hydration look adequate. Soreness is still elevated, so FuelWell recommends strength technique work or Zone 2 instead of intervals.",
  nextAction: "Pick a lower-intensity workout",
};

const checklist = [
  { label: "Sleep entered", detail: "7h 10m, quality marked good", done: true, source: "User-entered" },
  { label: "Hydration check", detail: "2 of 3 bottles logged", done: true, source: "User-entered" },
  { label: "Soreness check", detail: "Legs marked 6/10 after yesterday", done: true, source: "User-entered" },
  { label: "Wearable sync", detail: "Heart-rate variability is not connected yet", done: false, source: "Missing" },
];

const recoverySignals = [
  { label: "Sleep", value: "7h 10m", status: "Good", source: "User-entered", icon: Moon },
  { label: "Hydration", value: "66%", status: "Needs one more bottle", source: "User-entered", icon: Droplets },
  { label: "Soreness", value: "6/10", status: "High legs", source: "User-entered", icon: Dumbbell },
  { label: "Readiness", value: "72", status: "Estimated from available inputs", source: "Estimated", icon: Bed },
];

const nextActions = [
  { label: "Log a recovery snack", href: "/app/log", detail: "25g protein plus fruit keeps tomorrow's plan on track." },
  { label: "Choose today's workout", href: "/app/workouts", detail: "Recommendations already account for soreness." },
  { label: "Review activity verdict", href: "/app/activity", detail: "See why the app is keeping intensity capped." },
];

function SourceBadge({ children }: { children: string }) {
  if (children === "Missing") {
    return <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">Missing</span>;
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        children === "Estimated" ? "bg-lemon-50 text-lemon-700" : "bg-primary-50 text-primary-700"
      }`}
    >
      {children}
    </span>
  );
}

export default function RecoveryPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Recovery</h1>
        <Card className="bg-gradient-to-br from-sky-50 via-white to-primary-50/80 border-sky-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
                <span className="text-2xl font-bold tabular-nums">{readiness.score}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-neutral-900">{readiness.label}</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">{readiness.detail}</p>
              </div>
            </div>
            <Link
              href="/app/workouts"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              {readiness.nextAction}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {recoverySignals.map((signal) => (
          <Card key={signal.label} padding="sm" className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                <signal.icon className="h-4 w-4" />
              </div>
              <SourceBadge>{signal.source}</SourceBadge>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-neutral-900">{signal.value}</p>
              <p className="mt-1 text-sm font-medium text-neutral-700">{signal.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{signal.status}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card padding="sm">
          <div className="px-2 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Recovery checklist</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {checklist.map((item) => (
              <div key={item.label} className="flex gap-3 px-2 py-4">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-300" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                    <SourceBadge>{item.source}</SourceBadge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3 border-lemon-200 bg-lemon-50/60">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-lemon-600" />
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">What is estimated?</h2>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  Readiness is calculated from your logged sleep, hydration, and soreness above. HRV, resting heart rate, and workout load aren&apos;t included yet — connect a wearable to add them.
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Info className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-neutral-900">Next actions</h2>
            </div>
            <div className="space-y-2">
              {nextActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="block rounded-xl border border-neutral-200/80 p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-neutral-900">{action.label}</p>
                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300" />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{action.detail}</p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="bg-primary-50/70 border-primary-100">
            <div className="flex gap-3">
              <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <p className="text-sm leading-relaxed text-neutral-700">
                Clear next action: log protein plus fluids before bed so tomorrow&apos;s readiness estimate has one less guess.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
