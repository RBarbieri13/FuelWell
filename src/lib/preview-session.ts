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

export function isPreviewHost(host?: string | null) {
  if (!host) return false;
  return (
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("trycloudflare.com")
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
