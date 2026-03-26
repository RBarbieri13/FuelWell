import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile and today's log
  const today = new Date().toISOString().split("T")[0];

  const [profileResult, logResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, calorie_target, protein_target, carbs_target, fat_target, onboarding_complete")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("daily_logs")
      .select("calories_consumed, protein_consumed, carbs_consumed, fat_consumed")
      .eq("user_id", user!.id)
      .eq("log_date", today)
      .single(),
  ]);

  const profile = profileResult.data;
  const log = logResult.data;

  return (
    <DashboardClient
      displayName={profile?.display_name || user?.email?.split("@")[0] || "there"}
      calorieTarget={profile?.calorie_target ?? 2000}
      proteinTarget={profile?.protein_target ?? 150}
      carbsTarget={profile?.carbs_target ?? 250}
      fatTarget={profile?.fat_target ?? 65}
      caloriesConsumed={log?.calories_consumed ?? 0}
      proteinConsumed={log?.protein_consumed ?? 0}
      carbsConsumed={log?.carbs_consumed ?? 0}
      fatConsumed={log?.fat_consumed ?? 0}
      onboardingComplete={profile?.onboarding_complete ?? false}
    />
  );
}
