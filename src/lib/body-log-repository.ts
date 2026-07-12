import type { SupabaseClient } from "@supabase/supabase-js";
import type { BodyLogEntry } from "@/lib/coach/types";

type BodyLogRow = {
  entry_date: string;
  weight_kg: number | string | null;
  mood: number | null;
  water_ml: number | null;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireDate(date: string) {
  if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error("Body log dates must use YYYY-MM-DD.");
  }
}

function requireEntry(entry: BodyLogEntry) {
  requireDate(entry.date);
  if (entry.weightKg === undefined && entry.mood === undefined && entry.waterMl === undefined) {
    throw new Error("A body log needs weight, mood, or water.");
  }
  if (entry.weightKg !== undefined && (!Number.isFinite(entry.weightKg) || entry.weightKg < 20 || entry.weightKg > 350)) {
    throw new Error("Body weight must be between 20 and 350 kg.");
  }
  if (entry.mood !== undefined && (!Number.isInteger(entry.mood) || entry.mood < 1 || entry.mood > 5)) {
    throw new Error("Mood must be an integer from 1 to 5.");
  }
  if (entry.waterMl !== undefined && (!Number.isInteger(entry.waterMl) || entry.waterMl < 0 || entry.waterMl > 50000)) {
    throw new Error("Water must be between 0 and 50000 ml.");
  }
}

function rowToEntry(row: BodyLogRow): BodyLogEntry {
  const weightKg = row.weight_kg === null ? undefined : Number(row.weight_kg);
  return {
    date: row.entry_date,
    ...(weightKg === undefined ? {} : { weightKg }),
    ...(row.mood === null ? {} : { mood: row.mood }),
    ...(row.water_ml === null ? {} : { waterMl: row.water_ml }),
  };
}

export async function loadBodyLog(
  supabase: SupabaseClient,
  userId: string,
): Promise<BodyLogEntry[]> {
  const { data, error } = await supabase
    .from("body_log_entries")
    .select("entry_date, weight_kg, mood, water_ml")
    .eq("user_id", userId)
    .order("entry_date", { ascending: true })
    .order("recorded_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as BodyLogRow[]).map(rowToEntry);
}

export async function saveBodyLogEntry(
  supabase: SupabaseClient,
  userId: string,
  idempotencyKey: string,
  entry: BodyLogEntry,
): Promise<BodyLogEntry[]> {
  requireEntry(entry);
  if (!UUID_PATTERN.test(idempotencyKey)) {
    throw new Error("Body log idempotency keys must be UUIDs.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("body_log_entries")
    .select("weight_kg, mood, water_ml")
    .eq("user_id", userId)
    .eq("entry_date", entry.date)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const prior = (existing ?? {}) as Partial<BodyLogRow>;
  const { error } = await supabase.from("body_log_entries").upsert(
    {
      user_id: userId,
      idempotency_key: idempotencyKey,
      entry_date: entry.date,
      weight_kg: entry.weightKg ?? prior.weight_kg ?? null,
      mood: entry.mood ?? prior.mood ?? null,
      water_ml: entry.waterMl ?? prior.water_ml ?? null,
      recorded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,entry_date" },
  );
  if (error) throw new Error(error.message);
  return loadBodyLog(supabase, userId);
}
