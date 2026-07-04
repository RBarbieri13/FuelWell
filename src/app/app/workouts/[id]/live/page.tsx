import { notFound } from "next/navigation";
import { LiveWorkoutSession } from "@/components/workouts/live-workout-session";
import {
  getWorkoutById,
  getWorkoutExercisePlan,
  workouts,
} from "@/lib/workout-library";

export function generateStaticParams() {
  return workouts.map((workout) => ({ id: workout.id }));
}

export default async function LiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  return (
    <LiveWorkoutSession
      workout={{
        id: workout.id,
        title: workout.title,
        duration: workout.duration,
        intensity: workout.intensity,
        summary: workout.summary,
        workoutType: workout.workoutType,
        estimatedBurn: workout.estimatedBurn,
        equipment: workout.equipment,
      }}
      exercises={getWorkoutExercisePlan(workout)}
    />
  );
}
