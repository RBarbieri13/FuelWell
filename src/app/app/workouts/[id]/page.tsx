import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Bike, CheckCircle2, Clock3, Dumbbell, Flame, Info, ShieldCheck, UtensilsCrossed, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";

const workouts = {
  "low-impact-strength": {
    title: "Low-impact strength",
    icon: Dumbbell,
    duration: "34 min",
    intensity: "Moderate",
    verdict: "Recommended today",
    summary:
      "A controlled full-body session that keeps lower-body volume modest while still giving you a useful training stimulus.",
    why:
      "FuelWell is using user-entered soreness and meals plus estimated activity. Because leg soreness is 6/10, this avoids jumps, sprints, and high-rep squats.",
    fuel: "Eat 25-35g protein within two hours. Add 35-50g carbs before training if lunch was light.",
    blocks: [
      { name: "Warm-up", time: "6 min", detail: "Easy bike, hip circles, shoulder openers" },
      { name: "Strength circuit", time: "20 min", detail: "Incline push-up, hinge drill, cable row, dead bug" },
      { name: "Cool down", time: "8 min", detail: "Hamstring floss, couch stretch, nasal breathing" },
    ],
  },
  "zone-2-ride": {
    title: "Zone 2 ride",
    icon: Bike,
    duration: "42 min",
    intensity: "Easy",
    verdict: "Good alternative",
    summary:
      "A conversational aerobic ride that builds base fitness without asking sore legs for peak output.",
    why:
      "This is estimated from recovery inputs and planned activity. It stays below interval intensity because HRV and live heart-rate data are not connected.",
    fuel: "Hydrate before starting. Add a carb snack if the ride begins more than three hours after lunch.",
    blocks: [
      { name: "Ramp", time: "8 min", detail: "Gradually settle into easy breathing" },
      { name: "Steady ride", time: "28 min", detail: "Keep effort at 4-5/10, able to speak in sentences" },
      { name: "Spin down", time: "6 min", detail: "Light cadence, no final push" },
    ],
  },
  "mobility-reset": {
    title: "Mobility reset",
    icon: Waves,
    duration: "18 min",
    intensity: "Light",
    verdict: "Recovery option",
    summary:
      "A short reset for hips, upper back, and breathing when the better choice is protecting tomorrow's training.",
    why:
      "FuelWell has user-entered soreness but no wearable readiness yet. This option intentionally creates the lowest recovery cost.",
    fuel: "No special pre-fuel needed. Log dinner protein afterward so the recovery estimate improves.",
    blocks: [
      { name: "Downshift", time: "4 min", detail: "Box breathing and easy spinal rotations" },
      { name: "Mobility flow", time: "10 min", detail: "90/90 switches, couch stretch, thoracic reach" },
      { name: "Finish", time: "4 min", detail: "Long exhales, calves, light walk" },
    ],
  },
};

type WorkoutId = keyof typeof workouts;

function isWorkoutId(id: string): id is WorkoutId {
  return id in workouts;
}

export function generateStaticParams() {
  return Object.keys(workouts).map((id) => ({ id }));
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
      <Icon className="h-4 w-4 text-neutral-400" />
      <p className="mt-3 text-lg font-bold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-neutral-500">{label}</p>
    </div>
  );
}

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isWorkoutId(id)) {
    notFound();
  }

  const workout = workouts[id];
  const Icon = workout.icon;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Link
        href="/app/workouts"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workouts
      </Link>

      <section className="space-y-4">
        <Card className="bg-gradient-to-br from-primary-50/90 via-white to-accent-50/60 border-primary-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm shadow-primary-600/25">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{workout.title}</h1>
                  <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                    {workout.verdict}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">{workout.summary}</p>
              </div>
            </div>
            <Link
              href="/app/log"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              Log workout fuel
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={Clock3} label="Duration" value={workout.duration} />
          <Metric icon={Flame} label="Intensity" value={workout.intensity} />
          <Metric icon={ShieldCheck} label="Decision" value={workout.verdict} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.85fr]">
        <Card padding="sm">
          <div className="px-2 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Workout plan</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {workout.blocks.map((block) => (
              <div key={block.name} className="flex gap-4 px-2 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{block.name}</p>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                      {block.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{block.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-lemon-600" />
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Why this workout?</h2>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{workout.why}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 bg-primary-50/70 border-primary-100">
            <div className="flex gap-3">
              <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Fuel guidance</h2>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">{workout.fuel}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 border-lemon-200 bg-lemon-50/60">
            <h2 className="text-sm font-semibold text-neutral-900">Data honesty</h2>
            <p className="text-sm leading-relaxed text-neutral-600">
              User-entered: soreness, sleep, meals, and planned training preference. Estimated: readiness, calorie burn, and the ranking of workout options. Missing: live wearable strain, exercise history, and equipment availability.
            </p>
          </Card>

          <Link
            href="/app/recovery"
            className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-200 hover:text-primary-700"
          >
            Update recovery after this
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
