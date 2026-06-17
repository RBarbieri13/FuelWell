import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";
import { SettingsClient } from "@/components/settings/settings-client";
import { version } from "../../../../package.json";

// Single source of truth: bump package.json to release the next version (1.4+).
const APP_VERSION = version;

export default async function SettingsPage() {
  const host = (await headers()).get("host");
  const isPreview = isPreviewHost(host);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isPreview) {
    const sample = getSampleDay();
    return (
      <SettingsClient
        email={sample.user.email}
        displayName={sample.user.displayName}
        isPreview
        appVersion={APP_VERSION}
        initialIntakePreferences={undefined}
      />
    );
  }

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, preferences_jsonb")
        .eq("id", user.id)
        .single()
    : { data: null };
  const preferences = (profile?.preferences_jsonb ?? {}) as {
    onboarding?: Record<string, unknown>;
  };

  return (
    <SettingsClient
      email={user?.email ?? ""}
      displayName={profile?.display_name ?? ""}
      isPreview={false}
      appVersion={APP_VERSION}
      initialIntakePreferences={preferences.onboarding}
    />
  );
}
