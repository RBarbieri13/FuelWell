"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateMacroTargets, calculateAge } from "@/lib/macros";
import type { Gender, ActivityLevel, Goal } from "@/lib/macros";

// Step data types
interface OnboardingData {
  displayName: string;
  dateOfBirth: string;
  gender: Gender | "";
  heightCm: number | "";
  weightKg: number | "";
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
  dietaryPreference: string;
  allergies: string[];
  mealsPerDay: number;
  experienceLevel: string;
}

const INITIAL_DATA: OnboardingData = {
  displayName: "",
  dateOfBirth: "",
  gender: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "",
  goal: "",
  dietaryPreference: "none",
  allergies: [],
  mealsPerDay: 3,
  experienceLevel: "beginner",
};

const ALLERGY_OPTIONS = [
  "Dairy",
  "Gluten",
  "Nuts",
  "Soy",
  "Eggs",
  "Shellfish",
  "Fish",
  "Wheat",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 10;

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAllergy(allergy: string) {
    setData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  }

  function next() {
    if (step < totalSteps - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function handleComplete() {
    if (
      !data.gender ||
      !data.heightCm ||
      !data.weightKg ||
      !data.activityLevel ||
      !data.goal ||
      !data.dateOfBirth
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    const age = calculateAge(data.dateOfBirth);
    const macros = calculateMacroTargets({
      gender: data.gender as Gender,
      weightKg: Number(data.weightKg),
      heightCm: Number(data.heightCm),
      age,
      activityLevel: data.activityLevel as ActivityLevel,
      goal: data.goal as Goal,
    });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated. Please log in again.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: data.displayName || undefined,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        height_cm: Number(data.heightCm),
        weight_kg: Number(data.weightKg),
        activity_level: data.activityLevel,
        goal: data.goal,
        dietary_preference: data.dietaryPreference,
        allergies: data.allergies,
        meals_per_day: data.mealsPerDay,
        experience_level: data.experienceLevel,
        calorie_target: macros.calories,
        protein_target: macros.protein,
        carbs_target: macros.carbs,
        fat_target: macros.fat,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/app/dashboard");
    router.refresh();
  }

  // Calculate macros for preview on step 9
  function getPreviewMacros() {
    if (!data.gender || !data.heightCm || !data.weightKg || !data.activityLevel || !data.goal || !data.dateOfBirth) {
      return null;
    }
    const age = calculateAge(data.dateOfBirth);
    return calculateMacroTargets({
      gender: data.gender as Gender,
      weightKg: Number(data.weightKg),
      heightCm: Number(data.heightCm),
      age,
      activityLevel: data.activityLevel as ActivityLevel,
      goal: data.goal as Goal,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[400px] flex flex-col">
          <div className="flex-1">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">&#127793;</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                  Welcome to FuelWell!
                </h2>
                <p className="text-neutral-600 max-w-sm mx-auto">
                  Let&apos;s set up your personalized nutrition plan. This takes about 2
                  minutes.
                </p>
              </div>
            )}

            {/* Step 1: Name */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  What should we call you?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  This is how your coach will address you.
                </p>
                <input
                  type="text"
                  value={data.displayName}
                  onChange={(e) => update("displayName", e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Step 2: Date of Birth */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  When were you born?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  We use this to calculate your metabolic rate.
                </p>
                <input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Step 3: Gender */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  What&apos;s your biological sex?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  This affects how we calculate your calorie needs.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(["male", "female", "other"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => update("gender", g)}
                      className={`p-4 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                        data.gender === g
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Body Metrics */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  Your measurements
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  Used to calculate your BMR and daily calorie needs.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={data.heightCm}
                      onChange={(e) =>
                        update("heightCm", e.target.value ? Number(e.target.value) : "")
                      }
                      placeholder="170"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={data.weightKg}
                      onChange={(e) =>
                        update("weightKg", e.target.value ? Number(e.target.value) : "")
                      }
                      placeholder="70"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Activity Level */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  How active are you?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  Your typical weekly activity level.
                </p>
                <div className="space-y-2">
                  {[
                    { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
                    { value: "light", label: "Lightly Active", desc: "1-3 days/week" },
                    { value: "moderate", label: "Moderately Active", desc: "3-5 days/week" },
                    { value: "active", label: "Active", desc: "6-7 days/week" },
                    { value: "very_active", label: "Very Active", desc: "Intense daily exercise" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("activityLevel", opt.value as ActivityLevel)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        data.activityLevel === opt.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <span className="font-medium text-neutral-900 text-sm">
                        {opt.label}
                      </span>
                      <span className="text-neutral-500 text-xs ml-2">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Goal */}
            {step === 6 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  What&apos;s your primary goal?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  We&apos;ll adjust your calorie target accordingly.
                </p>
                <div className="space-y-3">
                  {[
                    { value: "lose", label: "Lose Weight", desc: "500 cal/day deficit" },
                    { value: "maintain", label: "Maintain Weight", desc: "Match your TDEE" },
                    { value: "gain", label: "Gain Weight", desc: "300 cal/day surplus" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("goal", opt.value as Goal)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        data.goal === opt.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <span className="font-medium text-neutral-900">{opt.label}</span>
                      <span className="text-neutral-500 text-sm block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Dietary Preference */}
            {step === 7 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  Dietary preference?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  We&apos;ll tailor recipe suggestions to your diet.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "none", label: "No Preference" },
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "vegan", label: "Vegan" },
                    { value: "pescatarian", label: "Pescatarian" },
                    { value: "keto", label: "Keto" },
                    { value: "paleo", label: "Paleo" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("dietaryPreference", opt.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        data.dietaryPreference === opt.value
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Allergies */}
            {step === 8 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  Any food allergies?
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  Select all that apply, or skip if none.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => toggleAllergy(allergy)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        data.allergies.includes(allergy)
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 9: Review & Confirm */}
            {step === 9 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  Your personalized plan
                </h2>
                <p className="text-neutral-500 text-sm mb-6">
                  Review your calculated targets. You can adjust these later.
                </p>

                {(() => {
                  const macros = getPreviewMacros();
                  if (!macros) {
                    return (
                      <p className="text-red-600 text-sm">
                        Missing required info. Go back and fill in all fields.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      <div className="bg-primary-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-primary-700">
                          {macros.calories}
                        </p>
                        <p className="text-sm text-primary-600">daily calories</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-xl font-bold text-blue-700">
                            {macros.protein}g
                          </p>
                          <p className="text-xs text-blue-600">Protein</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                          <p className="text-xl font-bold text-amber-700">
                            {macros.carbs}g
                          </p>
                          <p className="text-xs text-amber-600">Carbs</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                          <p className="text-xl font-bold text-red-700">
                            {macros.fat}g
                          </p>
                          <p className="text-xs text-red-600">Fat</p>
                        </div>
                      </div>
                      <div className="text-sm text-neutral-600 space-y-1">
                        <p>
                          <strong>Goal:</strong> {data.goal} weight
                        </p>
                        <p>
                          <strong>Activity:</strong> {data.activityLevel?.replace("_", " ")}
                        </p>
                        <p>
                          <strong>Diet:</strong> {data.dietaryPreference}
                        </p>
                        {data.allergies.length > 0 && (
                          <p>
                            <strong>Allergies:</strong> {data.allergies.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mt-4">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
            {step > 0 ? (
              <button
                onClick={back}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <button
                onClick={next}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                {step === 0 ? "Let's go" : "Next"}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
