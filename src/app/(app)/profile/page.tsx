import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    />
  );
}
