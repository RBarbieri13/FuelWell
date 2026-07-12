import { SAMPLE_MEALS, SAMPLE_TARGETS, sumMeals } from "@/lib/fuelwell-data";

export const SAMPLE_USER = {
  id: "fuelwell-preview-user",
  email: "preview@fuelwell.local",
  displayName: "Alex Preview",
  goal: "lose",
  activityLevel: "moderate",
  dietaryPreference: "none",
  allergies: ["Shellfish"],
  weightKg: 82,
  heightCm: 180,
};

const TRUTHY = new Set(["true", "1", "yes", "on"]);

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isPreviewHost(host?: string | null) {
  const envPreviewMode =
    TRUTHY.has((process.env.FUELWELL_PREVIEW_MODE ?? "").toLowerCase()) ||
    TRUTHY.has((process.env.NEXT_PUBLIC_FUELWELL_PREVIEW_MODE ?? "").toLowerCase());

  if (envPreviewMode) return true;
  if (!host) return false;

  // Local development remains convenient, but deployed hostnames never grant
  // preview identity or bypass authentication by naming convention. Each
  // review deployment must opt in explicitly with FUELWELL_PREVIEW_MODE.
  return (
    host.includes("localhost") ||
    host.includes("127.0.0.1")
  );
}

export function getSampleDay() {
  return {
    user: SAMPLE_USER,
    targets: SAMPLE_TARGETS,
    meals: SAMPLE_MEALS,
    totals: sumMeals(SAMPLE_MEALS),
  };
}
