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
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/app/fitness"
          className="inline-flex items-center justify-center gap-2 rounded-[1.15rem] bg-white/14 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/20"
        >
          <CheckCircle2 className="h-4 w-4" />
          Logged for today
        </Link>
        <Link
          href="/app/fitness"
          className="inline-flex items-center justify-center gap-2 rounded-[1.15rem] bg-gradient-to-r from-primary-500 to-teal-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:from-primary-600 hover:to-teal-600"
        >
          Review in Activity
          <ArrowRight className="h-4 w-4" />
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
      className="rounded-[1.15rem] bg-gradient-to-r from-primary-500 to-teal-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:from-primary-600 hover:to-teal-600"
      aria-label={`Log ${workout.title} for today`}
    >
      Log this workout
    </Button>
  );
}
