"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateMacroTargets, calculateAge } from "@/lib/macros";
import type { Gender, ActivityLevel, Goal } from "@/lib/macros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

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
    if (!data.gender || !data.heightCm || !data.weightKg || !data.activityLevel || !data.goal || !data.dateOfBirth) {
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
    const { data: { user } } = await supabase.auth.getUser();

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

  function getPreviewMacros() {
    if (!data.gender || !data.heightCm || !data.weightKg || !data.activityLevel || !data.goal || !data.dateOfBirth) return null;
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
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card padding="lg" className="min-h-[420px] flex flex-col">
          <div className="flex-1">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-3">
                  Welcome to FuelWell!
                </h2>
                <p className="text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Let&apos;s set up your personalized nutrition plan. This takes about 2 minutes — and you can always change it later.
                </p>
              </div>
            )}

            {/* Step 1: Name */}
            {step === 1 && (
              <StepWrapper
                title="What should we call you?"
                subtitle="This is how your coach will address you."
              >
                <Input
                  type="text"
                  value={data.displayName}
                  onChange={(e) => update("displayName", e.target.value)}
                  placeholder="Your name"
                  autoFocus
                />
              </StepWrapper>
            )}

            {/* Step 2: Date of Birth */}
            {step === 2 && (
              <StepWrapper
                title="When were you born?"
                subtitle="We use this to calculate your metabolic rate."
              >
                <Input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  autoFocus
                />
              </StepWrapper>
            )}

            {/* Step 3: Gender */}
            {step === 3 && (
              <StepWrapper
                title="What's your biological sex?"
                subtitle="This affects how we calculate your calorie needs."
              >
                <div className="grid grid-cols-3 gap-3">
                  {(["male", "female", "other"] as Gender[]).map((g) => (
                    <OptionButton
                      key={g}
                      selected={data.gender === g}
                      onClick={() => update("gender", g)}
                    >
                      {g}
                    </OptionButton>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* Step 4: Body Metrics */}
            {step === 4 && (
              <StepWrapper
                title="Your measurements"
                subtitle="Used to calculate your BMR and daily calorie needs."
              >
                <div className="space-y-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={data.heightCm}
                    onChange={(e) => update("heightCm", e.target.value ? Number(e.target.value) : "")}
                    placeholder="170"
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={data.weightKg}
                    onChange={(e) => update("weightKg", e.target.value ? Number(e.target.value) : "")}
                    placeholder="70"
                  />
                </div>
              </StepWrapper>
            )}

            {/* Step 5: Activity Level */}
            {step === 5 && (
              <StepWrapper
                title="How active are you?"
                subtitle="Your typical weekly activity level."
              >
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
                      className={cn(
                        "w-full p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                        data.activityLevel === opt.value
                          ? "border-primary-500 bg-primary-50/50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <span className="font-medium text-neutral-900 text-sm">{opt.label}</span>
                      <span className="text-neutral-400 text-xs ml-2">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* Step 6: Goal */}
            {step === 6 && (
              <StepWrapper
                title="What's your primary goal?"
                subtitle="We'll adjust your calorie target accordingly."
              >
                <div className="space-y-3">
                  {[
                    { value: "lose", label: "Lose Weight", desc: "500 cal/day deficit", emoji: "📉" },
                    { value: "maintain", label: "Maintain Weight", desc: "Match your TDEE", emoji: "⚖️" },
                    { value: "gain", label: "Gain Weight", desc: "300 cal/day surplus", emoji: "📈" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("goal", opt.value as Goal)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all duration-150 flex items-center gap-4",
                        data.goal === opt.value
                          ? "border-primary-500 bg-primary-50/50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <span className="font-medium text-neutral-900 block">{opt.label}</span>
                        <span className="text-neutral-400 text-sm">{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* Step 7: Dietary Preference */}
            {step === 7 && (
              <StepWrapper
                title="Dietary preference?"
                subtitle="We'll tailor recipe suggestions to your diet."
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "none", label: "No Preference" },
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "vegan", label: "Vegan" },
                    { value: "pescatarian", label: "Pescatarian" },
                    { value: "keto", label: "Keto" },
                    { value: "paleo", label: "Paleo" },
                  ].map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={data.dietaryPreference === opt.value}
                      onClick={() => update("dietaryPreference", opt.value)}
                    >
                      {opt.label}
                    </OptionButton>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* Step 8: Allergies */}
            {step === 8 && (
              <StepWrapper
                title="Any food allergies?"
                subtitle="Select all that apply, or skip if none."
              >
                <div className="grid grid-cols-2 gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => (
                    <OptionButton
                      key={allergy}
                      selected={data.allergies.includes(allergy)}
                      onClick={() => toggleAllergy(allergy)}
                      selectedClass="border-red-400 bg-red-50/50 text-red-700"
                    >
                      {allergy}
                    </OptionButton>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* Step 9: Review */}
            {step === 9 && (
              <StepWrapper
                title="Your personalized plan"
                subtitle="Review your calculated targets. You can adjust these later."
              >
                {(() => {
                  const macros = getPreviewMacros();
                  if (!macros) {
                    return (
                      <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
                        Missing required info. Go back and fill in all fields.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      <div className="bg-primary-50 rounded-xl p-5 text-center">
                        <p className="text-4xl font-bold text-primary-700 tabular-nums">
                          {macros.calories}
                        </p>
                        <p className="text-sm text-primary-600 font-medium mt-1">
                          daily calories
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: macros.protein, label: "Protein", bg: "bg-blue-50", text: "text-blue-700", sub: "text-blue-500" },
                          { value: macros.carbs, label: "Carbs", bg: "bg-amber-50", text: "text-amber-700", sub: "text-amber-500" },
                          { value: macros.fat, label: "Fat", bg: "bg-red-50", text: "text-red-700", sub: "text-red-500" },
                        ].map((m) => (
                          <div key={m.label} className={`${m.bg} rounded-xl p-3 text-center`}>
                            <p className={`text-xl font-bold ${m.text} tabular-nums`}>
                              {m.value}g
                            </p>
                            <p className={`text-xs font-medium ${m.sub}`}>{m.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-neutral-500 space-y-1 bg-neutral-50 rounded-xl p-4">
                        <p><strong className="text-neutral-700">Goal:</strong> {data.goal} weight</p>
                        <p><strong className="text-neutral-700">Activity:</strong> {data.activityLevel?.replace("_", " ")}</p>
                        <p><strong className="text-neutral-700">Diet:</strong> {data.dietaryPreference}</p>
                        {data.allergies.length > 0 && (
                          <p><strong className="text-neutral-700">Allergies:</strong> {data.allergies.join(", ")}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mt-4" role="alert">
                    {error}
                  </p>
                )}
              </StepWrapper>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
            {step > 0 ? (
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <Button onClick={next}>
                {step === 0 ? "Let's go" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} loading={saving}>
                Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Shared sub-components for the onboarding steps

function StepWrapper({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-1">
        {title}
      </h2>
      <p className="text-sm text-neutral-500 mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  selectedClass,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  selectedClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3.5 rounded-xl border-2 text-sm font-medium capitalize transition-all duration-150",
        selected
          ? selectedClass || "border-primary-500 bg-primary-50/50 text-primary-700"
          : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
      )}
    >
      {children}
    </button>
  );
}
