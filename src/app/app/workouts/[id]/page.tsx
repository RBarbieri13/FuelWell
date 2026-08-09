import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Image as ImageIcon,
  Info,
  ListChecks,
  MapPinned,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
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
    <Card padding="none" className="flex min-w-0 items-start gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
          {label}
        </p>
        <p className="mt-1 text-base font-black leading-6 text-ink">{value}</p>
      </div>
    </Card>
  );
}

/** Hero stat plate. Sits on the dark panel, so it uses an inset ring, not a shadow. */
function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 rounded-[1.35rem] bg-white/10 p-4 ring-1 ring-inset ring-white/12">
      <p className="truncate text-xl font-black tabular-nums text-white md:text-2xl">{value}</p>
      <p className="mt-1 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-white/55">
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
      className="fw-press group flex min-h-[3.5rem] min-w-0 items-center gap-3 rounded-[1.35rem] bg-surface p-3 ring-1 ring-inset ring-hairline hover:bg-primary-50/60 hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
        <Arrow className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
          {label}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-primary-600" strokeWidth={2} />
          <span className="truncate text-sm font-black text-ink">{workout.title}</span>
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
      className="fw-press group flex min-h-[3.5rem] min-w-0 items-center gap-3 rounded-[1.25rem] bg-surface-subtle p-3 ring-1 ring-inset ring-hairline hover:bg-surface hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-primary-700 ring-1 ring-inset ring-hairline">
        <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-ink">{workout.title}</span>
        {/* Aligned metadata row: length, effort, kit — the same three facts in
            the same order on every workout link across the surface. */}
        <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
          <Badge size="sm" variant="default" className="tabular-nums">
            {workout.duration}
          </Badge>
          <Badge size="sm" variant="neutral">
            {workout.intensity}
          </Badge>
          <Badge size="sm" variant="neutral" className="min-w-0">
            <span className="truncate">{workout.equipment}</span>
          </Badge>
        </span>
        <span className="mt-1.5 block truncate text-xs font-semibold text-ink-muted">
          {workout.focus}
        </span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-700"
        strokeWidth={2.25}
      />
    </Link>
  );
}

function StartWorkoutLink({ href, variant = "light" }: { href: string; variant?: "light" | "dark" }) {
  return (
    <Link
      href={href}
      className={cn(
        "fw-press inline-flex min-h-12 items-center justify-center gap-3 rounded-[1.2rem] px-5 py-3 text-sm font-black focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2",
        variant === "dark"
          ? "bg-primary-600 text-white shadow-glow hover:bg-primary-700 hover:shadow-e3 focus-visible:ring-primary-600"
          : "bg-surface text-primary-900 shadow-e2 hover:bg-primary-50 hover:shadow-e3 focus-visible:ring-primary-200"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          variant === "dark" ? "bg-white/18 text-white" : "bg-primary-100 text-primary-700"
        )}
      >
        <Play className="h-4 w-4 fill-current" strokeWidth={0} />
      </span>
      Start workout
    </Link>
  );
}

function ExerciseDiagramCard({ diagram }: { diagram: ExerciseDiagram }) {
  return (
    <div className="mt-4 rounded-[1.25rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
      <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[1rem] bg-primary-50 ring-1 ring-inset ring-primary-100">
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
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
            Form diagram
          </p>
          <h3 className="mt-1 text-lg font-black text-ink md:text-xl">{diagram.displayName}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
            {diagram.equipment ?? "As programmed"} · {diagram.primaryMuscles.join(", ")}
          </p>
          <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-ink-muted">
            {diagram.cues.map((cue) => (
              <li key={cue} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
                />
                <span className="min-w-0">{cue}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-faint">
            Source: {diagram.sourceLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Sets / reps / time plate. One shape, one type scale, aligned across rows. */
function PlanStat({
  value,
  label,
  tone,
}: {
  value: string | number;
  label: string;
  tone: "primary" | "sky" | "lemon";
}) {
  const tones = {
    primary: "bg-primary-50 text-primary-800 ring-primary-100",
    sky: "bg-sky-50 text-sky-800 ring-sky-100",
    lemon: "bg-lemon-50 text-lemon-700 ring-lemon-100",
  } as const;

  return (
    <div className={cn("min-w-0 rounded-[1.05rem] px-2 py-2.5 text-center ring-1 ring-inset", tones[tone])}>
      <p className="truncate text-sm font-black tabular-nums leading-tight md:text-base">{value}</p>
      <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
    </div>
  );
}

function ExerciseDetailRow({ exercise }: { exercise: WorkoutExercise }) {
  const diagram = getExerciseDiagram(exercise.name);

  return (
    <details className="group px-2 py-4">
      <summary className="-mx-2 flex min-h-11 cursor-pointer list-none flex-col justify-center rounded-[1.15rem] px-2 py-1 transition-colors duration-200 ease-out-soft hover:bg-primary-50/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-center">
          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <p className="text-lg font-black text-ink md:text-xl">{exercise.name}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-black text-primary-700 ring-1 ring-inset ring-primary-100">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                  <span className="group-open:hidden">View diagram</span>
                  <span className="hidden group-open:inline">Hide diagram</span>
                </span>
                {exercise.rest && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-ink-subtle ring-1 ring-inset ring-hairline">
                    <Clock3 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                    <span className="tabular-nums">{exercise.rest}</span> rest
                  </span>
                )}
              </div>
              {/* The chevron is the disclosure's only always-visible state cue
                  at narrow widths, where the chip row wraps away from view. */}
              <ChevronDown
                aria-hidden="true"
                className="ml-auto mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-open:rotate-180 xl:hidden"
                strokeWidth={2.5}
              />
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted md:text-base md:leading-7">
              {exercise.target}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
              <PlanStat value={exercise.sets} label="sets" tone="primary" />
              <PlanStat value={exercise.reps} label="reps" tone="sky" />
              <PlanStat value={exercise.time} label="time" tone="lemon" />
            </div>
            <ChevronDown
              aria-hidden="true"
              className="hidden h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ease-out-soft group-open:rotate-180 xl:block"
              strokeWidth={2.5}
            />
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
          className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/75 px-4 py-2 text-sm font-black text-ink-muted shadow-e1 ring-1 ring-inset ring-hairline hover:bg-surface hover:text-primary-700 md:min-h-0"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          Back to workouts
        </Link>

        <section className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Card variant="elevated" className="fw-dark-panel min-w-0 overflow-hidden p-4 sm:p-6">
            <div className="relative">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-500/25 blur-3xl" />
              <div className="relative flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 sm:items-start sm:gap-x-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[1.25rem] bg-primary-400 text-primary-950 ring-1 ring-inset ring-primary-300/60 sm:row-span-3 sm:h-16 sm:w-16 sm:rounded-[1.35rem]">
                      <span className="text-lg font-black tabular-nums">{exercisePlan.length}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.12em]">moves</span>
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-primary-100 ring-1 ring-inset ring-white/15">
                        Preview before logging
                      </span>
                      <span className="max-w-full truncate rounded-full bg-primary-400/20 px-3 py-1 text-xs font-black text-primary-100 ring-1 ring-inset ring-primary-300/25">
                        {workout.verdict}
                      </span>
                    </div>
                    <h1 className="col-span-2 font-heading text-[1.7rem] font-black tracking-tight text-white sm:col-span-1 sm:col-start-2 md:text-4xl">
                      {workout.title}
                    </h1>
                    <p className="col-span-2 max-w-3xl text-base font-semibold leading-7 text-white/72 sm:col-span-1 sm:col-start-2">
                      {workout.summary}
                    </p>
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
                  <HeroStat value={workout.duration} label="Duration" />
                  <HeroStat value={workout.intensity} label="Intensity" />
                  <HeroStat value={workout.estimatedBurn} label="Estimated burn" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="min-w-0 space-y-4 p-4 sm:p-6">
            <SectionHeader
              as="h2"
              icon={MapPinned}
              title="Move around"
              description="Jump to the next workout or a close match."
            />

            <div className="grid gap-3">
              {previous && (
                <WorkoutMiniLink workout={previous} label="Previous workout" direction="previous" />
              )}
              {next && <WorkoutMiniLink workout={next} label="Next workout" direction="next" />}
              {!previous && !next && (
                <p className="rounded-[1.25rem] bg-surface-muted px-4 py-3 text-sm font-semibold leading-6 text-ink-muted ring-1 ring-inset ring-hairline">
                  This is the only workout in its slice of the library right now.
                </p>
              )}
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
                <SectionHeader
                  as="h2"
                  eyebrow="Workout plan"
                  title={`${workout.blocks.length} blocks · ${workout.duration}`}
                  icon={ListChecks}
                />
              </div>
              <div className="divide-y divide-hairline">
                {workout.blocks.map((block, blockIndex) => (
                  <div key={block.name} className="flex gap-4 px-2 py-4">
                    {/* Ordinal, not a checkmark — nothing here is completed yet,
                        and the running order is the useful signal. */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-sm font-black tabular-nums text-primary-700 ring-1 ring-inset ring-primary-100">
                      {blockIndex + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="text-base font-black text-ink md:text-lg">{block.name}</p>
                        <Badge size="sm" variant="default" className="tabular-nums">
                          {block.time}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted md:text-base md:leading-7">
                        {block.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="elevated" padding="sm" className="min-w-0">
              <div className="px-2 pb-3">
                <SectionHeader
                  as="h2"
                  eyebrow="Exercise detail"
                  title={`${exercisePlan.length} moves`}
                  icon={Target}
                  action={<StartWorkoutLink href={`${workoutHref(workout.id)}/live`} variant="dark" />}
                />
              </div>
              <div className="divide-y divide-hairline">
                {exercisePlan.map((exercise) => (
                  <ExerciseDetailRow key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </Card>

            <Card variant="tinted" className="min-w-0 border-lemon-200 bg-lemon-50/80 p-4 shadow-none sm:p-6">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-surface text-lemon-600 ring-1 ring-inset ring-lemon-200">
                  <Info className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-black text-lemon-700 md:text-lg">
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
              <SectionHeader
                as="h2"
                icon={Sparkles}
                title="Summary"
                description="What you should know before logging it."
              />

              <div className="grid gap-2">
                {workout.bestFor.map((item) => (
                  <div
                    key={item}
                    className="flex min-w-0 items-start gap-2 rounded-[1rem] bg-primary-50 px-3 py-2.5 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-100"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" strokeWidth={2.25} />
                    <span className="min-w-0">{item}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.25rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
                  Equipment
                </p>
                <p className="mt-1 text-sm font-black leading-6 text-ink">{workout.equipment}</p>
              </div>
            </Card>

            <Card variant="tinted" className="min-w-0 space-y-3 border-primary-100 bg-primary-50/80 p-4 sm:p-6">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-surface text-primary-700 ring-1 ring-inset ring-primary-100">
                  <UtensilsCrossed className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-ink">Fuel guidance</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                    {workout.fuel}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="min-w-0 space-y-3 p-4 sm:p-6">
              <SectionHeader
                as="h2"
                title="Close matches"
                action={
                  <Badge variant={similarWorkouts.length > 0 ? "default" : "neutral"}>
                    <span className="tabular-nums">{similarWorkouts.length}</span>
                    <span className="ml-1">nearby</span>
                  </Badge>
                }
              />
              {similarWorkouts.length > 0 ? (
                <div className="grid gap-3">
                  {similarWorkouts.map((similarWorkout) => (
                    <SimilarWorkoutLink key={similarWorkout.id} workout={similarWorkout} />
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-[1.25rem] bg-surface-muted px-4 py-4 ring-1 ring-inset ring-hairline">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] bg-surface text-ink-subtle ring-1 ring-inset ring-hairline">
                    <Compass className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                  </span>
                  <p className="min-w-0 text-sm font-semibold leading-6 text-ink-muted">
                    Nothing else in the library is close enough to call a match. Browse the full
                    library to compare options yourself.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
