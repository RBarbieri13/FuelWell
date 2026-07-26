"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkoutLog } from "@/lib/use-workout-log";
import type { WorkoutType } from "@/lib/workout-library";

function parseMinutes(duration: string) {
  const match = duration.match(/(\d+)/);
  return match ? Number(match[1]) : 30;
}

function parseEstimatedCalories(estimatedBurn: string) {
  const values = Array.from(estimatedBurn.matchAll(/(\d+)/g)).map((match) =>
    Number(match[1])
  );
  if (values.length === 0) return undefined;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

type LoggableWorkout = {
  id: string;
  title: string;
  duration: string;
  workoutType: WorkoutType;
  estimatedBurn: string;
  summary: string;
  equipment: string;
  recoveryCost: string;
};

// Both states of this control sit on the dark hero panel, so the confirmation
// keeps a translucent-on-dark treatment rather than switching to a light chip
// that would punch a hole in the panel.
const onDarkChipClass =
  "fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[1.15rem] bg-white/14 px-5 py-3 text-sm font-black text-white ring-1 ring-inset ring-white/20 hover:bg-white/22 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/70";

const onDarkPrimaryClass =
  "fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-b from-primary-400 to-teal-500 px-5 py-3 text-sm font-black text-primary-950 shadow-e2 hover:from-primary-300 hover:to-teal-400 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-200";

export function WorkoutLogAction({ workout }: { workout: LoggableWorkout }) {
  const { addWorkout } = useWorkoutLog();
  const [logged, setLogged] = useState(false);
  const durationMin = useMemo(() => parseMinutes(workout.duration), [workout.duration]);
  const calories = useMemo(
    () => parseEstimatedCalories(workout.estimatedBurn),
    [workout.estimatedBurn]
  );

  if (logged) {
    return (
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row" role="status" aria-live="polite">
        <span className={onDarkChipClass}>
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          <span className="truncate">Logged for today</span>
        </span>
        <Link href="/app/fitness" className={onDarkPrimaryClass}>
          Review in Activity
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </Link>
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={() => {
        addWorkout({
          id: `workout-${workout.id}-${Date.now()}`,
          name: workout.title,
          category: workout.workoutType,
          durationMin,
          calories,
          source: "database",
          loggedAt: new Date().toISOString(),
          notes: `${workout.summary} Equipment: ${workout.equipment}. Recovery cost: ${workout.recoveryCost}.`,
        });
        setLogged(true);
      }}
      className="w-full bg-gradient-to-b from-primary-400 to-teal-500 text-primary-950 shadow-e2 hover:from-primary-300 hover:to-teal-400 hover:shadow-e3 focus-visible:ring-primary-200 sm:w-auto"
      aria-label={`Log ${workout.title} for today`}
    >
      Log this workout
    </Button>
  );
}
