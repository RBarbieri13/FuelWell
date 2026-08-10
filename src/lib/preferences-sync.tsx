"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isPreviewHost } from "@/lib/preview-session";
import {
  configurePreferencesPersistence,
  configurePreviewPreferences,
  configureSignedOutPreferences,
  hydratePreferencesFromServer,
  reportPreferencesPersistenceError,
  usePreferences,
  type PreferenceState,
} from "@/lib/use-preferences";
import {
  configurePreviewUnits,
  configureSignedOutUnits,
  configureUnitsPersistence,
  hydrateUnitsFromServer,
  reportUnitsPersistenceError,
  useUnits,
  type UnitSystem,
} from "@/components/settings/use-units";
import {
  assertAuthenticatedResponseOwner,
  resolveStorageAuthorityMode,
} from "@/lib/authenticated-storage-types";

type PreferenceDocument = Record<string, unknown>;
type AuthUserSource = {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
    onAuthStateChange: (
      callback: (event: string, session: { user: { id: string } } | null) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
  };
};

export function subscribeAuthenticatedUserIds(
  source: AuthUserSource,
  onUserId: (userId: string | null) => void,
) {
  let active = true;
  let authEventSeen = false;
  let lastUserId: string | null | undefined;
  const publish = (userId: string | null) => {
    if (!active || userId === lastUserId) return;
    lastUserId = userId;
    onUserId(userId);
  };
  const { data: { subscription } } = source.auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    authEventSeen = true;
    publish(session?.user.id ?? null);
  });
  void source.auth.getUser().then(({ data: { user } }) => {
    if (active && !authEventSeen) publish(user?.id ?? null);
  }).catch(() => {
    if (active && !authEventSeen) publish(null);
  });
  return () => {
    active = false;
    subscription.unsubscribe();
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function preferenceStateFromDocument(document: PreferenceDocument): PreferenceState {
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

async function responseJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "Server could not save this change.");
  }
  return body as T;
}

export function PreferencesSync() {
  const preferences = usePreferences();
  const units = useUnits();

  useEffect(() => {
    let cancelled = false;
    let syncGeneration = 0;
    let readController: AbortController | null = null;
    let activeUserId: string | null | undefined;
    const preview = typeof window !== "undefined" && isPreviewHost(window.location?.host);
    const authorityMode = resolveStorageAuthorityMode(preview, hasSupabaseConfig());
    if (authorityMode === "preview") {
      configurePreviewPreferences();
      configurePreviewUnits();
      return undefined;
    }
    if (authorityMode === "unavailable") {
      configureSignedOutPreferences();
      configureSignedOutUnits();
      reportPreferencesPersistenceError("Secure preference storage is unavailable. Refresh after the connection is restored.");
      reportUnitsPersistenceError("Secure unit storage is unavailable. Refresh after the connection is restored.");
      return undefined;
    }

    const supabase = createClient();
    async function syncUser(userId: string | null) {
      if (userId === activeUserId) return;
      activeUserId = userId;
      const generation = ++syncGeneration;
      readController?.abort();
      readController = new AbortController();
      if (!userId) {
        configureSignedOutPreferences();
        configureSignedOutUnits();
        return;
      }
      configurePreferencesPersistence(userId, async (next) => {
        const response = await fetch("/api/user-state/preferences", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ preferences: next, expectedUserId: userId }),
        });
        const document = await responseJson<{ preferences: PreferenceState; userId: string }>(response);
        assertAuthenticatedResponseOwner(document, userId);
        return document.preferences;
      });
      configureUnitsPersistence(userId, async (next) => {
        const response = await fetch("/api/user-state/preferences", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ units: next, expectedUserId: userId }),
        });
        const document = await responseJson<{ units: UnitSystem; userId: string }>(response);
        assertAuthenticatedResponseOwner(document, userId);
        return document.units;
      });
      try {
        const response = await fetch("/api/user-state/preferences", {
          cache: "no-store",
          signal: readController.signal,
        });
        const document = await responseJson<{
          preferences: PreferenceState;
          units: UnitSystem;
          userId: string;
        }>(response);
        if (cancelled || generation !== syncGeneration) return;
        assertAuthenticatedResponseOwner(document, userId);
        hydratePreferencesFromServer(document.preferences, userId);
        hydrateUnitsFromServer(document.units, userId);
      } catch (error) {
        if (cancelled || generation !== syncGeneration || (error instanceof Error && error.name === "AbortError")) return;
        const message = error instanceof Error ? error.message : "Unable to load your saved preferences.";
        reportPreferencesPersistenceError(`${message} Refresh to retry.`);
        reportUnitsPersistenceError(`${message} Refresh to retry.`);
      }
    }

    const unsubscribe = subscribeAuthenticatedUserIds(
      supabase as unknown as AuthUserSource,
      (userId) => { void syncUser(userId); },
    );
    return () => {
      cancelled = true;
      syncGeneration += 1;
      readController?.abort();
      unsubscribe();
      configureSignedOutPreferences();
      configureSignedOutUnits();
    };
  }, []);

  const message = preferences.persistenceError ?? units.persistenceError;
  if (!message) return null;
  return (
    <div
      role="alert"
      className="fixed bottom-24 right-4 z-50 max-w-sm rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm font-bold text-coral-800 shadow-e3"
    >
      {message}
    </div>
  );
}
