import { z } from "zod";
import type { WorkoutEntry } from "@/lib/coach/types";
import { todayIsoDate } from "@/lib/fuelwell-data";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import {
  deleteWorkoutEntry,
  loadWorkoutLog,
  saveWorkoutEntry,
} from "@/lib/workout-log-repository";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nonNegativeNumber = z.number().finite().nonnegative();
const exerciseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sets: nonNegativeNumber.int().optional(),
  reps: nonNegativeNumber.optional(),
  weightKg: nonNegativeNumber.optional(),
});
const workoutSchema = z.object({
  id: z.string().trim().min(1).max(300),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  durationMin: nonNegativeNumber.int(),
  loggedAt: z.string().datetime(),
  calories: nonNegativeNumber.optional(),
  distanceMiles: nonNegativeNumber.optional(),
  met: nonNegativeNumber.optional(),
  source: z.enum(["coach", "database", "manual_activity", "manual_edit"]).optional(),
  exercises: z.array(exerciseSchema).max(100).optional(),
  notes: z.string().max(10_000).optional(),
});

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Workout log request failed.";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ signedIn: false, workouts: [] });
  const parsedDate = dateSchema.safeParse(
    new URL(request.url).searchParams.get("date") ?? todayIsoDate(),
  );
  if (!parsedDate.success) {
    return Response.json({ error: "Invalid workout log date." }, { status: 400 });
  }
  try {
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsedDate.data,
      workouts: await loadWorkoutLog(auth.supabase, auth.userId, parsedDate.data),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = z.object({ date: dateSchema, workout: workoutSchema }).safeParse(
    await request.json(),
  );
  if (!parsed.success) {
    return Response.json({ error: "Invalid workout payload." }, { status: 400 });
  }
  try {
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsed.data.date,
      workouts: await saveWorkoutEntry(
        auth.supabase,
        auth.userId,
        parsed.data.date,
        parsed.data.workout as WorkoutEntry,
      ),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = z.object({
    date: dateSchema,
    workoutId: z.string().trim().min(1).max(300),
  }).safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid workout delete request." }, { status: 400 });
  }
  try {
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsed.data.date,
      workouts: await deleteWorkoutEntry(
        auth.supabase,
        auth.userId,
        parsed.data.date,
        parsed.data.workoutId,
      ),
    });
  } catch (error) {
    return failure(error);
  }
}
