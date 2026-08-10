import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserAppStateKey } from "@/lib/authenticated-storage-types";

export async function loadUserAppState<T>(
  supabase: SupabaseClient,
  userId: string,
  storeKey: UserAppStateKey,
): Promise<T | null> {
  const { data, error } = await supabase
    .from("user_app_state")
    .select("state_jsonb")
    .eq("user_id", userId)
    .eq("store_key", storeKey)
    .maybeSingle();
  if (error) throw new Error(`Unable to load ${storeKey}: ${error.message}`);
  return (data?.state_jsonb as T | null | undefined) ?? null;
}

export async function saveUserAppState<T>(
  supabase: SupabaseClient,
  userId: string,
  storeKey: UserAppStateKey,
  value: T,
): Promise<T> {
  const { data, error } = await supabase
    .from("user_app_state")
    .upsert(
      { user_id: userId, store_key: storeKey, state_jsonb: value },
      { onConflict: "user_id,store_key" },
    )
    .select("state_jsonb")
    .single();
  if (error) throw new Error(`Unable to save ${storeKey}: ${error.message}`);
  return data.state_jsonb as T;
}

export async function deleteUserAppState(
  supabase: SupabaseClient,
  userId: string,
  storeKey: UserAppStateKey,
): Promise<void> {
  const { error } = await supabase
    .from("user_app_state")
    .delete()
    .eq("user_id", userId)
    .eq("store_key", storeKey);
  if (error) throw new Error(`Unable to clear ${storeKey}: ${error.message}`);
}

export async function loadProfilePreferenceDocument(
  supabase: SupabaseClient,
  userId: string,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("preferences_jsonb")
    .eq("id", userId)
    .single();
  if (error) throw new Error(`Unable to load preferences: ${error.message}`);
  return data.preferences_jsonb && typeof data.preferences_jsonb === "object"
    ? (data.preferences_jsonb as Record<string, unknown>)
    : {};
}

export async function mergeOwnProfilePreferences(
  supabase: SupabaseClient,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.rpc("merge_own_profile_preferences", { patch });
  if (error) throw new Error(`Unable to save preferences: ${error.message}`);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Unable to save preferences: server returned an invalid document");
  }
  return data as Record<string, unknown>;
}
