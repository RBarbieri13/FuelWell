import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import {
  loadProfilePreferenceDocument,
  mergeOwnProfilePreferences,
} from "@/lib/authenticated-storage-repository";
import type { DietFilter, PreferenceState } from "@/lib/use-preferences";
import type { UnitSystem } from "@/components/settings/use-units";

const DIETS = new Set<DietFilter>(["high-protein", "low-carb", "low-fat", "vegan"]);

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function preferencesFromDocument(document: Record<string, unknown>): PreferenceState {
  return {
    likes: strings(document.likes),
    dislikes: strings(document.dislikes),
    diets: strings(document.diets).filter((value): value is DietFilter => DIETS.has(value as DietFilter)),
    allergies: strings(document.allergies).filter((value) => value.trim().toLowerCase() !== "none"),
  };
}

function unitFromDocument(document: Record<string, unknown>): UnitSystem {
  return document.units === "imperial" ? "imperial" : "metric";
}

function validPreferences(value: unknown): value is PreferenceState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prefs = value as Partial<PreferenceState>;
  return [prefs.likes, prefs.dislikes, prefs.diets, prefs.allergies].every(
    (list) => Array.isArray(list) && list.length <= 1000 && list.every((item) => typeof item === "string"),
  ) && prefs.diets!.every((diet) => DIETS.has(diet));
}

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function GET() {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to load preferences." }, { status: 401 });
  try {
    const document = await loadProfilePreferenceDocument(auth.supabase, auth.user.id);
    return Response.json({
      preferences: preferencesFromDocument(document),
      units: unitFromDocument(document),
      userId: auth.user.id,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load preferences." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to save preferences." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.expectedUserId !== "string" || !body.expectedUserId) {
    return Response.json({ error: "The expected account is required to save preferences." }, { status: 400 });
  }
  if (body.expectedUserId !== auth.user.id) {
    return Response.json({ error: "Your account changed before this preference update completed." }, { status: 409 });
  }
  const preferences = body?.preferences;
  const units = body?.units;
  if (preferences === undefined && units === undefined) {
    return Response.json({ error: "No preference changes were provided." }, { status: 400 });
  }
  if (preferences !== undefined && !validPreferences(preferences)) {
    return Response.json({ error: "Preferences are malformed." }, { status: 400 });
  }
  if (units !== undefined && units !== "metric" && units !== "imperial") {
    return Response.json({ error: "Units must be metric or imperial." }, { status: 400 });
  }
  try {
    const patch: Record<string, unknown> = {};
    if (preferences) Object.assign(patch, preferences);
    if (units) patch.units = units;
    const document = await mergeOwnProfilePreferences(auth.supabase, patch);
    return Response.json({
      preferences: preferencesFromDocument(document),
      units: unitFromDocument(document),
      userId: auth.user.id,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save preferences." },
      { status: 500 },
    );
  }
}
