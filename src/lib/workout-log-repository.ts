import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutEntry } from "@/lib/coach/types";

const WORKOUT_KEY_PREFIX = "workout-entry:";
const ACTIVITY_KEY_PREFIX = "activity-entry:";

type WorkoutSessionRow = {
  id: string;
  idempotency_key: string;
  workout_library_id: string | null;
  title: string;
  session_date: string;
  started_at: string | null;
  duration_minutes: number | null;
  calories_burned: number | string | null;
  source: string;
  notes: string | null;
  workout_exercises?: WorkoutExerciseRow[];
};

type WorkoutExerciseRow = {
  id: string;
  name: string;
  position: number;
  target_sets: number | null;
  target_reps: string | null;
  workout_sets?: WorkoutSetRow[];
};

type WorkoutSetRow = {
  set_number: number;
  reps: number | string | null;
  weight_kg: number | string | null;
};

type ActivityRow = {
  idempotency_key: string;
  activity_date: string;
  activity_type: string;
  source: string;
  started_at: string | null;
  duration_minutes: number | null;
  calories_burned: number | string | null;
  distance_meters: number | string | null;
  metadata: Record<string, unknown> | null;
  notes: string | null;
};

function errorMessage(error: { message?: string } | null, fallback: string) {
  return error?.message || fallback;
}

function finiteNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function entryKey(prefix: string, date: string, id: string) {
  return `${prefix}${date}:${id}`;
}

function clientId(key: string, prefix: string, date: string) {
  const datedPrefix = `${prefix}${date}:`;
  return key.startsWith(datedPrefix) ? key.slice(datedPrefix.length) : key;
}

function isActivity(entry: WorkoutEntry) {
  return entry.source === "manual_activity";
}

function workoutSource(source: string): WorkoutEntry["source"] {
  if (source === "coach" || source === "database" || source === "manual_edit") {
    return source;
  }
  return "manual_edit";
}

function sessionToEntry(row: WorkoutSessionRow): WorkoutEntry {
  const exercises = [...(row.workout_exercises ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((exercise) => {
      const sets = [...(exercise.workout_sets ?? [])].sort(
        (a, b) => a.set_number - b.set_number,
      );
      const firstSet = sets[0];
      const reps = finiteNumber(firstSet?.reps) ?? finiteNumber(exercise.target_reps);
      const weightKg = finiteNumber(firstSet?.weight_kg);
      return {
        name: exercise.name,
        sets: exercise.target_sets ?? (sets.length || undefined),
        ...(reps === undefined ? {} : { reps }),
        ...(weightKg === undefined ? {} : { weightKg }),
      };
    });

  return {
    id: clientId(row.idempotency_key, WORKOUT_KEY_PREFIX, row.session_date),
    name: row.title,
    category: row.workout_library_id || "Workout",
    durationMin: row.duration_minutes ?? 0,
    loggedAt: row.started_at ?? `${row.session_date}T12:00:00.000Z`,
    ...(finiteNumber(row.calories_burned) === undefined
      ? {}
      : { calories: finiteNumber(row.calories_burned) }),
    source: workoutSource(row.source),
    ...(exercises.length === 0 ? {} : { exercises }),
    ...(row.notes ? { notes: row.notes } : {}),
  };
}

function activityToEntry(row: ActivityRow): WorkoutEntry {
  const metadata = row.metadata ?? {};
  const distanceMeters = finiteNumber(row.distance_meters);
  const name = typeof metadata.name === "string" ? metadata.name : row.activity_type;
  const met = finiteNumber(metadata.met as number | string | null | undefined);
  return {
    id: clientId(row.idempotency_key, ACTIVITY_KEY_PREFIX, row.activity_date),
    name,
    category: row.activity_type,
    durationMin: row.duration_minutes ?? 0,
    loggedAt: row.started_at ?? `${row.activity_date}T12:00:00.000Z`,
    ...(finiteNumber(row.calories_burned) === undefined
      ? {}
      : { calories: finiteNumber(row.calories_burned) }),
    ...(distanceMeters === undefined ? {} : { distanceMiles: distanceMeters / 1609.344 }),
    ...(met === undefined ? {} : { met }),
    source: "manual_activity",
    ...(row.notes ? { notes: row.notes } : {}),
  };
}

export async function loadWorkoutLog(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<WorkoutEntry[]> {
  const [sessionsResult, activitiesResult] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select(`
        id,
        idempotency_key,
        workout_library_id,
        title,
        session_date,
        started_at,
        duration_minutes,
        calories_burned,
        source,
        notes,
        workout_exercises (
          id,
          name,
          position,
          target_sets,
          target_reps,
          workout_sets (set_number, reps, weight_kg)
        )
      `)
      .eq("user_id", userId)
      .eq("session_date", date)
      .order("created_at", { ascending: true }),
    supabase
      .from("activity_entries")
      .select(`
        idempotency_key,
        activity_date,
        activity_type,
        source,
        started_at,
        duration_minutes,
        calories_burned,
        distance_meters,
        metadata,
        notes
      `)
      .eq("user_id", userId)
      .eq("activity_date", date)
      .order("created_at", { ascending: true }),
  ]);

  if (sessionsResult.error) throw new Error(sessionsResult.error.message);
  if (activitiesResult.error) throw new Error(activitiesResult.error.message);

  return [
    ...((sessionsResult.data ?? []) as unknown as WorkoutSessionRow[]).map(sessionToEntry),
    ...((activitiesResult.data ?? []) as unknown as ActivityRow[]).map(activityToEntry),
  ].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
}

async function saveActivity(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  entry: WorkoutEntry,
) {
  const idempotencyKey = entryKey(ACTIVITY_KEY_PREFIX, date, entry.id);
  const { error } = await supabase.from("activity_entries").upsert(
    {
      user_id: userId,
      idempotency_key: idempotencyKey,
      activity_date: date,
      activity_type: entry.category,
      source: "manual_activity",
      started_at: entry.loggedAt,
      duration_minutes: entry.durationMin,
      calories_burned: entry.calories ?? null,
      distance_meters:
        entry.distanceMiles === undefined ? null : entry.distanceMiles * 1609.344,
      metadata: { name: entry.name, ...(entry.met === undefined ? {} : { met: entry.met }) },
      notes: entry.notes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,idempotency_key" },
  );
  if (error) throw new Error(error.message);
}

async function saveSession(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  entry: WorkoutEntry,
) {
  const idempotencyKey = entryKey(WORKOUT_KEY_PREFIX, date, entry.id);
  const { data: existing, error: existingError } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .upsert(
      {
        user_id: userId,
        idempotency_key: idempotencyKey,
        workout_library_id: entry.category,
        title: entry.name,
        status: "completed",
        session_date: date,
        started_at: entry.loggedAt,
        ended_at: entry.loggedAt,
        duration_minutes: entry.durationMin,
        calories_burned: entry.calories ?? null,
        source: entry.source ?? "manual",
        notes: entry.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,idempotency_key" },
    )
    .select("id")
    .single();
  if (sessionError || !session) {
    throw new Error(errorMessage(sessionError, "Workout session could not be saved."));
  }

  try {
    const exercises = entry.exercises ?? [];
    const exerciseRows = exercises.map((exercise, position) => ({
      user_id: userId,
      workout_session_id: session.id,
      idempotency_key: `${idempotencyKey}:exercise:${position}`,
      name: exercise.name,
      position,
      target_sets: exercise.sets ?? null,
      target_reps: exercise.reps === undefined ? null : String(exercise.reps),
      updated_at: new Date().toISOString(),
    }));

    if (exerciseRows.length > 0) {
      const { error } = await supabase
        .from("workout_exercises")
        .upsert(exerciseRows, { onConflict: "user_id,idempotency_key" });
      if (error) throw new Error(error.message);
    }

    const { data: savedExercises, error: savedExerciseError } = await supabase
      .from("workout_exercises")
      .select("id,idempotency_key,position")
      .eq("user_id", userId)
      .eq("workout_session_id", session.id);
    if (savedExerciseError) throw new Error(savedExerciseError.message);

    const activeExerciseKeys = exerciseRows.map((row) => row.idempotency_key);
    const staleExerciseIds = (savedExercises ?? [])
      .filter((row) => !activeExerciseKeys.includes(row.idempotency_key))
      .map((row) => row.id);
    if (staleExerciseIds.length > 0) {
      const { error } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("user_id", userId)
        .eq("workout_session_id", session.id)
        .in("id", staleExerciseIds);
      if (error) throw new Error(error.message);
    }

    for (const savedExercise of savedExercises ?? []) {
      const exercise = exercises[savedExercise.position];
      if (!exercise || !activeExerciseKeys.includes(savedExercise.idempotency_key)) continue;
      const setCount = Math.max(0, exercise.sets ?? 0);
      const setRows = Array.from({ length: setCount }, (_, index) => ({
        user_id: userId,
        workout_session_id: session.id,
        workout_exercise_id: savedExercise.id,
        idempotency_key: `${savedExercise.idempotency_key}:set:${index + 1}`,
        set_number: index + 1,
        reps: exercise.reps ?? null,
        weight_kg: exercise.weightKg ?? null,
        completed: true,
        completed_at: entry.loggedAt,
        updated_at: new Date().toISOString(),
      }));
      if (setRows.length > 0) {
        const { error } = await supabase
          .from("workout_sets")
          .upsert(setRows, { onConflict: "user_id,idempotency_key" });
        if (error) throw new Error(error.message);
      }
      const { error: staleSetError } = await supabase
        .from("workout_sets")
        .delete()
        .eq("user_id", userId)
        .eq("workout_exercise_id", savedExercise.id)
        .gt("set_number", setCount);
      if (staleSetError) throw new Error(staleSetError.message);
    }
  } catch (error) {
    if (!existing) {
      await supabase
        .from("workout_sessions")
        .delete()
        .eq("user_id", userId)
        .eq("id", session.id);
    }
    throw error;
  }
}

export async function saveWorkoutEntry(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  entry: WorkoutEntry,
): Promise<WorkoutEntry[]> {
  if (isActivity(entry)) await saveActivity(supabase, userId, date, entry);
  else await saveSession(supabase, userId, date, entry);
  return loadWorkoutLog(supabase, userId, date);
}

export async function deleteWorkoutEntry(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  entryId: string,
): Promise<WorkoutEntry[]> {
  const keys = [
    {
      table: "workout_sessions",
      dateColumn: "session_date",
      key: entryKey(WORKOUT_KEY_PREFIX, date, entryId),
    },
    {
      table: "activity_entries",
      dateColumn: "activity_date",
      key: entryKey(ACTIVITY_KEY_PREFIX, date, entryId),
    },
  ] as const;
  let deleted = false;
  for (const candidate of keys) {
    const { data, error } = await supabase
      .from(candidate.table)
      .delete()
      .eq("user_id", userId)
      .eq(candidate.dateColumn, date)
      .eq("idempotency_key", candidate.key)
      .select("id");
    if (error) throw new Error(error.message);
    deleted = deleted || (data?.length ?? 0) > 0;
  }
  if (!deleted) throw new Error("Workout or activity was not found.");
  return loadWorkoutLog(supabase, userId, date);
}
