"use client";

/**
 * PreferencesSync — bridges the usePreferences client store to
 * profiles.preferences_jsonb for signed-in users.
 *
 * On mount: if signed in, hydrate the store from the server (server wins when
 * it has data; otherwise seed the server from local so first-device prefs
 * aren't lost). Then write-through on every store change, debounced.
 * Preview/signed-out users skip all of this — localStorage remains the store.
 */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/preview-session";
import {
  getPreferences,
  mergePreferences,
  subscribePreferences,
  type PreferenceState,
} from "@/lib/use-preferences";

const WRITE_DEBOUNCE_MS = 800;

export function PreferencesSync() {
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;
    if (!hasSupabaseConfig()) return undefined;
    const supabase = createClient();

    async function start() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data } = await supabase
        .from("profiles")
        .select("preferences_jsonb")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;

      const server = (data?.preferences_jsonb ?? {}) as Partial<PreferenceState>;
      const local = getPreferences();
      const serverHasData = Object.values(server).some(
        (v) => Array.isArray(v) ? v.length > 0 : Boolean(v)
      );
      const localHasData =
        local.likes.length + local.dislikes.length + local.diets.length + local.allergies.length > 0;

      if (serverHasData) {
        mergePreferences(server);
      } else if (localHasData) {
        await supabase
          .from("profiles")
          .update({ preferences_jsonb: local })
          .eq("id", user.id);
      }
      if (cancelled) return;

      // Subscribe after hydration so the hydration merge itself doesn't
      // immediately echo back to the server.
      unsubscribe = subscribePreferences(() => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          void supabase
            .from("profiles")
            .update({ preferences_jsonb: getPreferences() })
            .eq("id", user.id)
            .then(({ error }) => {
              if (error) console.error("preferences sync failed", error.message);
            });
        }, WRITE_DEBOUNCE_MS);
      });
    }

    void start();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  return null;
}
