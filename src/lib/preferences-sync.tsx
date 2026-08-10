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
  setPreferencesScope,
  subscribePreferences,
  type PreferenceState,
} from "@/lib/use-preferences";

const WRITE_DEBOUNCE_MS = 800;

type PreferenceDocument = Record<string, unknown>;

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function preferenceStateFromDocument(
  document: PreferenceDocument,
): PreferenceState {
  return {
    likes: stringArray(document.likes),
    dislikes: stringArray(document.dislikes),
    diets: stringArray(document.diets) as PreferenceState["diets"],
    allergies: stringArray(document.allergies),
  };
}

export function mergePreferenceStateIntoDocument(
  document: PreferenceDocument,
  preferences: PreferenceState,
): PreferenceDocument {
  return {
    ...document,
    likes: [...preferences.likes],
    dislikes: [...preferences.dislikes],
    diets: [...preferences.diets],
    allergies: [...preferences.allergies],
  };
}

function asPreferenceDocument(value: unknown): PreferenceDocument {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as PreferenceDocument)
    : {};
}

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
      setPreferencesScope(user.id);

      const { data, error: readError } = await supabase
        .from("profiles")
        .select("preferences_jsonb")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;

      // A failed read must not turn into a destructive whole-document write.
      if (readError || !data) {
        console.error(
          "preferences sync read failed",
          readError?.message ?? "profile row was unavailable",
        );
        return;
      }

      const serverDocument = asPreferenceDocument(data.preferences_jsonb);
      const server = preferenceStateFromDocument(serverDocument);
      const local = getPreferences();
      const serverHasData = Object.values(server).some((value) => value.length > 0);
      const localHasData =
        local.likes.length + local.dislikes.length + local.diets.length + local.allergies.length > 0;

      if (serverHasData) {
        mergePreferences(server);
      } else if (localHasData) {
        const { error: seedError } = await supabase
          .from("profiles")
          .update({
            preferences_jsonb: mergePreferenceStateIntoDocument(serverDocument, local),
          })
          .eq("id", user.id);
        if (seedError) {
          console.error("preferences sync seed failed", seedError.message);
          return;
        }
      }
      if (cancelled) return;

      // Subscribe after hydration so the hydration merge itself doesn't
      // immediately echo back to the server.
      unsubscribe = subscribePreferences(() => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          void (async () => {
            const { data: latest, error: latestReadError } = await supabase
              .from("profiles")
              .select("preferences_jsonb")
              .eq("id", user.id)
              .maybeSingle();
            if (cancelled) return;
            if (latestReadError || !latest) {
              console.error(
                "preferences sync read failed",
                latestReadError?.message ?? "profile row was unavailable",
              );
              return;
            }

            const nextDocument = mergePreferenceStateIntoDocument(
              asPreferenceDocument(latest.preferences_jsonb),
              getPreferences(),
            );
            const { error } = await supabase
              .from("profiles")
              .update({ preferences_jsonb: nextDocument })
              .eq("id", user.id);
            if (error) console.error("preferences sync failed", error.message);
          })();
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
