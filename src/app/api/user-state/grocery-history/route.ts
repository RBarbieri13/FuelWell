import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import {
  loadUserAppState,
  saveUserAppState,
} from "@/lib/authenticated-storage-repository";
import type { GroceryHistoryEntry } from "@/lib/authenticated-storage-types";

function validHistory(value: unknown): value is GroceryHistoryEntry[] {
  if (!Array.isArray(value) || value.length > 4) return false;
  return value.every((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    const row = entry as Partial<GroceryHistoryEntry>;
    return typeof row.id === "string" && row.id.length > 0 && row.id.length <= 160 &&
      typeof row.savedAt === "string" && Number.isFinite(Date.parse(row.savedAt)) &&
      Number.isInteger(row.itemCount) && Number(row.itemCount) >= 0 &&
      Number.isInteger(row.checkedCount) && Number(row.checkedCount) >= 0 &&
      Array.isArray(row.items) && row.items.length <= 1000 &&
      row.items.every((item) => Boolean(item && typeof item === "object" && !Array.isArray(item)));
  });
}

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function GET() {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to load grocery history." }, { status: 401 });
  try {
    const history = await loadUserAppState<GroceryHistoryEntry[]>(
      auth.supabase,
      auth.user.id,
      "grocery_history",
    );
    if (history !== null && !validHistory(history)) throw new Error("Stored grocery history is invalid");
    return Response.json({ history: history ?? [], userId: auth.user.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load grocery history." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to save grocery history." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.expectedUserId !== "string" || !body.expectedUserId) {
    return Response.json({ error: "The expected account is required to save grocery history." }, { status: 400 });
  }
  if (body.expectedUserId !== auth.user.id) {
    return Response.json({ error: "Your account changed before grocery history was saved." }, { status: 409 });
  }
  if (!validHistory(body?.history)) {
    return Response.json({ error: "Grocery history is malformed." }, { status: 400 });
  }
  try {
    const history = await saveUserAppState(
      auth.supabase,
      auth.user.id,
      "grocery_history",
      body.history,
    );
    return Response.json({ history, userId: auth.user.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save grocery history." },
      { status: 500 },
    );
  }
}
