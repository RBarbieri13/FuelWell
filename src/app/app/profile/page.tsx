import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";
import { headers } from "next/headers";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";

export default async function ProfilePage() {
  const host = (await headers()).get("host");
  const isPreview = isPreviewHost(host);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isPreview) {
    const sample = getSampleDay();
    return (
      <ProfileClient
        email={sample.user.email}
        displayName={sample.user.displayName}
        calorieTarget={sample.targets.calories}
        proteinTarget={sample.targets.protein}
        carbsTarget={sample.targets.carbs}
        fatTarget={sample.targets.fat}
        goal={sample.user.goal}
        activityLevel={sample.user.activityLevel}
        weightKg={sample.user.weightKg}
        heightCm={sample.user.heightCm}
        onboardingComplete
        isPreview
      />
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, calorie_target, protein_target, carbs_target, fat_target, goal, activity_level, weight_kg, height_cm, onboarding_complete"
    )
    .eq("id", user!.id)
    .single();

  return (
    <ProfileClient
      email={user?.email ?? ""}
      displayName={profile?.display_name ?? ""}
      calorieTarget={profile?.calorie_target ?? 2000}
      proteinTarget={profile?.protein_target ?? 150}
      carbsTarget={profile?.carbs_target ?? 250}
      fatTarget={profile?.fat_target ?? 65}
      goal={profile?.goal ?? "maintain"}
      activityLevel={profile?.activity_level ?? "moderate"}
      weightKg={profile?.weight_kg ?? null}
      heightCm={profile?.height_cm ?? null}
      onboardingComplete={profile?.onboarding_complete ?? false}
      isPreview={false}
    />
  );
}
