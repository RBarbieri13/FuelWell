import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import { loadBodyLog, saveBodyLogEntry } from "@/lib/body-log-repository";

const bodyLogEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weightKg: z.number().finite().min(20).max(350).optional(),
  mood: z.number().int().min(1).max(5).optional(),
  waterMl: z.number().int().min(0).max(50000).optional(),
}).refine(
  (entry) => entry.weightKg !== undefined || entry.mood !== undefined || entry.waterMl !== undefined,
  "A body log needs weight, mood, or water.",
);

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Body log request failed.";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET() {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ signedIn: false, entries: [] });
  try {
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      entries: await loadBodyLog(auth.supabase, auth.userId),
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = z.object({
    idempotencyKey: z.string().uuid(),
    entry: bodyLogEntrySchema,
  }).safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid body log payload." }, { status: 400 });
  }
  try {
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      entries: await saveBodyLogEntry(
        auth.supabase,
        auth.userId,
        parsed.data.idempotencyKey,
        parsed.data.entry,
      ),
    });
  } catch (error) {
    return failure(error);
  }
}
