import Link from "next/link";
import { ArrowRight, Bike, Clock3, Dumbbell, Flame, Info, ShieldCheck, Sparkles, Timer, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";

const dailyVerdict = {
  label: "Best today: low-impact strength",
  detail:
    "Recovery is good enough to train, but leg soreness is elevated. FuelWell is recommending controlled strength or Zone 2 instead of hard intervals.",
  source:
    "This recommendation uses user-entered soreness and meals plus estimated steps/readiness. No wearable, calendar, or gym-equipment integration is connected yet.",
};

const workouts = [
  {
    id: "low-impact-strength",
    title: "Low-impact strength",
    duration: "34 min",
    intensity: "Moderate",
    focus: "Full body technique",
    source: "Recommended",
    href: "/workouts/low-impact-strength",
    icon: Dumbbell,
    detail: "Keeps leg volume controlled while still preserving your training streak.",
  },
  {
    id: "zone-2-ride",
    title: "Zone 2 ride",
    duration: "42 min",
    intensity: "Easy",
    focus: "Aerobic base",
    source: "Good alternative",
    href: "/workouts/zone-2-ride",
    icon: Bike,
    detail: "Best if you want movement without adding soreness before tomorrow.",
  },
  {
    id: "mobility-reset",
    title: "Mobility reset",
    duration: "18 min",
    intensity: "Light",
    focus: "Hips and upper back",
    source: "Recovery option",
    href: "/workouts/mobility-reset",
    icon: Waves,
    detail: "Use this if energy dips or you want to protect sleep quality.",
  },
];

const recommendationRules = [
  "Cap high-impact lower-body work while soreness stays above 5/10.",
  "Add 25-35g protein after any option longer than 30 minutes.",
  "Choose the short reset if dinner is more than three hours away.",
];

function SourceBadge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
      {children}
    </span>
  );
}

export default function WorkoutsPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Workouts</h1>
        <Card className="bg-gradient-to-br from-primary-50/90 via-white to-neutral-50 border-primary-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{dailyVerdict.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">{dailyVerdict.detail}</p>
              </div>
            </div>
            <Link
              href="/app/workouts/low-impact-strength"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              Start recommendation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.78fr]">
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Recommended today</h2>
          {workouts.map((workout) => (
            <Link key={workout.id} href={workout.href} className="block group">
              <Card className="transition-colors group-hover:border-primary-200 group-hover:bg-primary-50/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 group-hover:bg-white group-hover:text-primary-600">
                      <workout.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">{workout.title}</h3>
                        <SourceBadge>{workout.source}</SourceBadge>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">{workout.detail}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-neutral-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
                          <Timer className="h-3.5 w-3.5" />
                          {workout.duration}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1">
                          <Flame className="h-3.5 w-3.5" />
                          {workout.intensity}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1">{workout.focus}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <aside className="space-y-4">
          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Decision rules</h2>
                <p className="text-xs text-neutral-500">Deterministic local guidance for now.</p>
              </div>
            </div>
            <div className="space-y-3">
              {recommendationRules.map((rule) => (
                <div key={rule} className="flex gap-3 rounded-xl bg-neutral-50 p-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                  <p className="text-sm leading-relaxed text-neutral-700">{rule}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 border-amber-200 bg-amber-50/60">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Data honesty</h2>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{dailyVerdict.source}</p>
              </div>
            </div>
          </Card>

          <Link
            href="/app/recovery"
            className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-200 hover:text-primary-700"
          >
            Update recovery before training
            <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
