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
    <div className="rounded-[1.5rem] border border-primary-100/80 bg-white p-4 shadow-[0_14px_36px_rgba(22,48,42,0.06)]">
      <Icon className="h-4 w-4 text-primary-600" />
      <p className="mt-3 text-lg font-black text-[#16302a]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#91a7a0]">{label}</p>
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
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner max-w-5xl space-y-6">
      <Link
        href="/app/workouts"
        className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-black text-[#78928a] shadow-sm transition-colors hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workouts
      </Link>

      <section className="space-y-4">
        <Card variant="elevated" className="fw-dark-panel">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-primary-400 text-primary-950 shadow-sm shadow-primary-950/25">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-white">{workout.title}</h1>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-primary-100">
                    {workout.verdict}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/68">{workout.summary}</p>
              </div>
            </div>
            <Link
              href="/app/log"
              className="inline-flex items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-r from-primary-500 to-[#159aa2] px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:from-primary-600 hover:to-[#138893]"
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

      <section className="grid items-start gap-4 lg:grid-cols-[1.25fr_0.85fr]">
        <Card variant="elevated" padding="sm">
          <div className="px-2 pb-3">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">Workout plan</h2>
          </div>
          <div className="divide-y divide-primary-100/70">
            {workout.blocks.map((block) => (
              <div key={block.name} className="flex gap-4 px-2 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-[#16302a]">{block.name}</p>
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-black text-primary-700">
                      {block.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-[#78928a]">{block.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card variant="elevated" className="space-y-3">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-lemon-600" />
              <div>
                <h2 className="text-sm font-black text-[#16302a]">Why this workout?</h2>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-[#516b63]">{workout.why}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 border-primary-100 bg-primary-50/80">
            <div className="flex gap-3">
              <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <div>
                <h2 className="text-sm font-black text-[#16302a]">Fuel guidance</h2>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-[#516b63]">{workout.fuel}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 border-lemon-200 bg-lemon-50/70">
            <h2 className="text-sm font-black text-[#16302a]">Data honesty</h2>
            <p className="text-sm font-semibold leading-relaxed text-[#6f6431]">
              User-entered: soreness, sleep, meals, and planned training preference. Estimated: readiness, calorie burn, and the ranking of workout options. Missing: live wearable strain, exercise history, and equipment availability.
            </p>
          </Card>

          <Link
            href="/app/recovery"
            className="flex items-center justify-between rounded-[1.5rem] border border-primary-100/80 bg-white p-4 text-sm font-black text-[#516b63] shadow-sm transition-colors hover:border-primary-200 hover:text-primary-700"
          >
            Update recovery after this
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
