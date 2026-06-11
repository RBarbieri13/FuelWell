import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";
import { SettingsClient } from "@/components/settings/settings-client";

const APP_VERSION = "0.1.0";

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
      />
    );
  }

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <SettingsClient
      email={user?.email ?? ""}
      displayName={profile?.display_name ?? ""}
      isPreview={false}
      appVersion={APP_VERSION}
    />
  );
}
