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
  if (isPreview) {
    const sample = getSampleDay();
    return (
      <SettingsClient
        email={sample.user.email}
        displayName={sample.user.displayName}
        isPreview
        appVersion={APP_VERSION}
        initialIntakePreferences={undefined}
        initialProfileInputs={{
          dateOfBirth: "1988-05-01",
          gender: "other",
          heightIn: 71,
          weightLb: Math.round((sample.user.weightKg ?? 82) * 2.20462),
          activityLevel: "moderate",
          goal: "lose",
          dietaryPreference: sample.user.dietaryPreference,
          allergies: sample.user.allergies.join(", "),
          mealsPerDay: 3,
          experienceLevel: "intermediate",
        }}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, preferences_jsonb, date_of_birth, gender, height_cm, weight_kg, activity_level, goal, dietary_preference, allergies, meals_per_day, experience_level")
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
      initialProfileInputs={{
        dateOfBirth: profile?.date_of_birth ?? undefined,
        gender: profile?.gender ?? undefined,
        heightIn: profile?.height_cm ? Math.round(Number(profile.height_cm) / 2.54) : undefined,
        weightLb: profile?.weight_kg ? Math.round(Number(profile.weight_kg) * 2.20462) : undefined,
        activityLevel: profile?.activity_level ?? undefined,
        goal: profile?.goal ?? undefined,
        dietaryPreference: profile?.dietary_preference ?? undefined,
        allergies: Array.isArray(profile?.allergies) ? profile.allergies.join(", ") : "",
        mealsPerDay: profile?.meals_per_day ?? undefined,
        experienceLevel: profile?.experience_level ?? undefined,
      }}
    />
  );
}
