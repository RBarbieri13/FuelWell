import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Image as ImageIcon,
  Info,
  ListChecks,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  getAdjacentWorkouts,
  getSimilarWorkouts,
  getWorkoutById,
  getWorkoutExercisePlan,
  workoutHref,
  workouts,
  type WorkoutExercise,
  type WorkoutLibraryItem,
} from "@/lib/workout-library";
import { cn } from "@/lib/utils/cn";
import { WorkoutLogAction } from "@/components/workouts/workout-log-actions";
import { getExerciseDiagram, type ExerciseDiagram } from "@/lib/exercise-diagrams";

export function generateStaticParams() {
  return workouts.map((workout) => ({ id: workout.id }));
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-primary-100/80 bg-white p-4 shadow-[0_14px_36px_rgba(22,48,42,0.06)]">
      <Icon className="h-4 w-4 text-primary-600" />
      <p className="mt-3 text-lg font-black text-[#16302a]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function WorkoutMiniLink({
  workout,
  label,
  direction,
}: {
  workout: WorkoutLibraryItem;
  label: string;
  direction: "previous" | "next";
}) {
  const Icon = workout.icon;
  const Arrow = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <Link
      href={workoutHref(workout.id)}
      className="group flex min-w-0 items-center gap-3 rounded-[1.35rem] border border-border bg-white p-3 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] bg-primary-100 text-primary-700">
        <Arrow className="h-4 w-4 transition group-hover:scale-110" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary-600" />
          <span className="truncate text-sm font-black text-[#16302a]">
            {workout.title}
          </span>
        </span>
      </span>
    </Link>
  );
}

function SimilarWorkoutLink({ workout }: { workout: WorkoutLibraryItem }) {
  const Icon = workout.icon;

  return (
    <Link
      href={workoutHref(workout.id)}
      className="group flex min-w-0 items-center gap-3 rounded-[1.25rem] border border-border bg-[#f6faf8] p-3 transition hover:border-primary-200 hover:bg-white"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] bg-white text-primary-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-black text-[#16302a]">{workout.title}</span>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-black text-primary-700">
            {workout.duration}
          </span>
        </span>
        <span className="mt-1 block truncate text-xs font-semibold text-muted-foreground">
          {workout.focus}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary-700" />
    </Link>
  );
}

function StartWorkoutLink({ href, variant = "light" }: { href: string; variant?: "light" | "dark" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-3 rounded-[1.2rem] px-5 py-3 text-sm font-black shadow-sm transition",
        variant === "dark"
          ? "bg-primary-600 text-white shadow-[0_16px_34px_rgba(21,145,108,0.22)] hover:bg-primary-700"
          : "bg-white text-primary-900 shadow-[0_16px_34px_rgba(255,255,255,0.12)] hover:bg-primary-50"
      )}
    >
      <span className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        variant === "dark" ? "bg-white/18 text-white" : "bg-primary-100 text-primary-700"
      )}>
        <Clock3 className="h-4 w-4" />
      </span>
      Start workout
    </Link>
  );
}

function ExerciseDiagramCard({ diagram }: { diagram: ExerciseDiagram }) {
  return (
    <div className="mt-4 rounded-[1.25rem] border border-primary-100 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[1rem] border border-primary-100 bg-primary-50">
          {diagram.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={diagram.imageUrl}
              alt={`${diagram.displayName} exercise diagram`}
              className="h-40 w-full object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center p-4 text-center text-sm font-black leading-6 text-primary-900">
              {diagram.fallbackLabel}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-600">
            Form diagram
          </p>
          <h3 className="mt-1 text-xl font-black text-[#16302a]">{diagram.displayName}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#60776f]">
            {diagram.equipment ?? "As programmed"} · {diagram.primaryMuscles.join(", ")}
          </p>
          <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-muted-foreground">
            {diagram.cues.map((cue) => (
              <li key={cue} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            Source: {diagram.sourceLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function ExerciseDetailRow({ exercise }: { exercise: WorkoutExercise }) {
  const diagram = getExerciseDiagram(exercise.name);

  return (
    <details className="group px-2 py-5">
      <summary className="cursor-pointer list-none">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xl font-black text-[#16302a] md:text-2xl">{exercise.name}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="group-open:hidden">View diagram</span>
                <span className="hidden group-open:inline">Hide diagram</span>
              </span>
            </div>
            <p className="mt-2 text-base font-semibold leading-relaxed text-muted-foreground md:text-lg">
              {exercise.target}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[1.05rem] bg-primary-50 px-3 py-2.5">
              <p className="text-sm font-black text-primary-800 md:text-base">{exercise.sets}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary-700/70">sets</p>
            </div>
            <div className="rounded-[1.05rem] bg-sky-100 px-3 py-2.5">
              <p className="text-sm font-black text-sky-800 md:text-base">{exercise.reps}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-700/70">reps</p>
            </div>
            <div className="rounded-[1.05rem] bg-lemon-50 px-3 py-2.5">
              <p className="text-sm font-black text-lemon-800 md:text-base">{exercise.time}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-lemon-700/70">time</p>
            </div>
          </div>
        </div>
      </summary>
      <ExerciseDiagramCard diagram={diagram} />
    </details>
  );
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  const { previous, next } = getAdjacentWorkouts(workout.id);
  const similarWorkouts = getSimilarWorkouts(workout.id, 3);
  const exercisePlan = getWorkoutExercisePlan(workout);

  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner min-w-0 max-w-6xl space-y-4 md:space-y-6">
        <Link
          href="/app/workouts"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-black md:min-h-0 text-muted-foreground shadow-sm transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workouts
        </Link>

        <section className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card variant="elevated" className="fw-dark-panel min-w-0 overflow-hidden p-4 sm:p-6">
            <div className="relative">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-500/25 blur-3xl" />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[1.35rem] bg-primary-400 text-primary-950 shadow-sm shadow-primary-950/25">
                      <span className="text-lg font-black tabular-nums">{exercisePlan.length}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.12em]">moves</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary-100">
                          Preview before logging
                        </span>
                        <span className="rounded-full bg-primary-400/20 px-3 py-1 text-xs font-black text-primary-100">
                          {workout.verdict}
                        </span>
                      </div>
                      <h1 className="mt-2 font-heading text-[1.7rem] font-black tracking-tight text-white md:mt-3 md:text-4xl">
                        {workout.title}
                      </h1>
                      <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/72">
                        {workout.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <StartWorkoutLink href={`${workoutHref(workout.id)}/live`} />
                    <WorkoutLogAction
                      workout={{
                        id: workout.id,
                        title: workout.title,
                        duration: workout.duration,
                        workoutType: workout.workoutType,
                        estimatedBurn: workout.estimatedBurn,
                        summary: workout.summary,
                        equipment: workout.equipment,
                        recoveryCost: workout.recoveryCost,
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">{workout.duration}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                      Duration
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">{workout.intensity}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                      Intensity
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">{workout.estimatedBurn}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                      Estimated burn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="min-w-0 space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                <MapPinned className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-black text-[#16302a]">
                  Move around
                </h2>
                <p className="text-sm font-semibold text-muted-foreground">
                  Jump to the next workout or a close match.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {previous && (
                <WorkoutMiniLink workout={previous} label="Previous workout" direction="previous" />
              )}
              {next && <WorkoutMiniLink workout={next} label="Next workout" direction="next" />}
            </div>
          </Card>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Metric icon={ShieldCheck} label="Recovery cost" value={workout.recoveryCost} />
          <Metric icon={Target} label="Goal" value={workout.goal} />
        </section>

        <section className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="min-w-0 space-y-5">
            <Card variant="elevated" padding="sm" className="min-w-0">
              <div className="px-2 pb-3">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary-600">
                  <ListChecks className="h-4 w-4" />
                  Workout plan
                </h2>
              </div>
              <div className="divide-y divide-primary-100/70">
                {workout.blocks.map((block) => (
                  <div key={block.name} className="flex gap-4 px-2 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-[#16302a]">{block.name}</p>
                        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-black text-primary-700">
                          {block.time}
                        </span>
                      </div>
                      <p className="mt-1 text-base font-semibold leading-relaxed text-muted-foreground">
                        {block.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="elevated" padding="sm" className="min-w-0">
              <div className="px-2 pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary-600">
                    <Target className="h-4 w-4" />
                    Exercise detail
                  </h2>
                  <StartWorkoutLink href={`${workoutHref(workout.id)}/live`} variant="dark" />
                </div>
              </div>
              <div className="divide-y divide-primary-100/70">
                {exercisePlan.map((exercise) => (
                  <ExerciseDetailRow key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </Card>

            <Card className="min-w-0 border-lemon-200 bg-lemon-50/80 p-4 sm:p-6">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-lemon-600" />
                <div>
                  <h2 className="font-heading text-lg font-black text-lemon-700">
                    How this preview is chosen
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-lemon-700/85">
                    {workout.why}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="min-w-0 space-y-5">
            <Card variant="elevated" className="min-w-0 space-y-4 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-black text-[#16302a]">
                    Summary
                  </h2>
                  <p className="text-sm font-semibold text-muted-foreground">
                    What you should know before logging it.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                {workout.bestFor.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-[1rem] bg-primary-50 px-3 py-2 text-sm font-black text-primary-800"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="rounded-[1.25rem] border border-border bg-[#f6faf8] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                  Equipment
                </p>
                <p className="mt-1 text-sm font-black text-[#16302a]">{workout.equipment}</p>
              </div>
            </Card>

            <Card className="min-w-0 space-y-3 border-primary-100 bg-primary-50/80 p-4 sm:p-6">
              <div className="flex gap-3">
                <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <div>
                  <h2 className="text-sm font-black text-[#16302a]">Fuel guidance</h2>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-muted-foreground">
                    {workout.fuel}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="min-w-0 space-y-3 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-black text-[#16302a]">
                  Close matches
                </h2>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-black text-primary-700">
                  {similarWorkouts.length} nearby
                </span>
              </div>
              <div className={cn("grid gap-3", similarWorkouts.length === 0 && "hidden")}>
                {similarWorkouts.map((similarWorkout) => (
                  <SimilarWorkoutLink key={similarWorkout.id} workout={similarWorkout} />
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
