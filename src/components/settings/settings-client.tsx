"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { usePreferences, DIET_FILTERS } from "@/lib/use-preferences";
import { useUnits, type UnitSystem } from "./use-units";
import { CoachActivity } from "./coach-activity";
import { useGoalContextStore } from "@/lib/use-goal-context";
import {
  calculateAge,
  calculateMacroTargets,
  type ActivityLevel,
  type Gender,
  type Goal,
} from "@/lib/macros";
import {
  User,
  Mail,
  Ruler,
  Salad,
  ShieldAlert,
  Bell,
  CalendarDays,
  ChefHat,
  Clock3,
  Download,
  LogOut,
  Info,
  MapPin,
  MessageCircle,
  Save,
  SlidersHorizontal,
  Watch,
  Dumbbell,
} from "lucide-react";

interface SettingsClientProps {
  email: string;
  displayName: string;
  isPreview: boolean;
  appVersion: string;
  initialIntakePreferences?: Record<string, unknown>;
  initialProfileInputs?: Partial<ProfileInputs>;
}

type IntakePreferences = {
  goalTimeline: string;
  nutritionAggressiveness: string;
  dietFlexibility: string;
  groceryBudget: string;
  cookingHabits: string;
  workoutLocation: string;
  checkInPreference: string;
  coachStyle: string;
};

type ProfileInputs = {
  dateOfBirth: string;
  gender: Gender;
  heightIn: number;
  weightLb: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryPreference: string;
  allergies: string;
  mealsPerDay: number;
  experienceLevel: string;
};

const DEFAULT_INTAKE: IntakePreferences = {
  goalTimeline: "steady",
  nutritionAggressiveness: "mild",
  dietFlexibility: "balanced",
  groceryBudget: "moderate",
  cookingHabits: "mix",
  workoutLocation: "gym_home",
  checkInPreference: "event_driven",
  coachStyle: "direct_supportive",
};

const DEFAULT_PROFILE_INPUTS: ProfileInputs = {
  dateOfBirth: "1988-05-01",
  gender: "other",
  heightIn: 71,
  weightLb: 181,
  activityLevel: "moderate",
  goal: "lose",
  dietaryPreference: "none",
  allergies: "",
  mealsPerDay: 3,
  experienceLevel: "intermediate",
};

const INTAKE_GROUPS = [
  {
    key: "goalTimeline",
    label: "Goal timeline",
    icon: Clock3,
    options: [
      { value: "patient", label: "Patient" },
      { value: "steady", label: "Steady" },
      { value: "urgent", label: "Urgent" },
    ],
  },
  {
    key: "nutritionAggressiveness",
    label: "Nutrition aggressiveness",
    icon: SlidersHorizontal,
    options: [
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "aggressive", label: "Aggressive" },
    ],
  },
  {
    key: "dietFlexibility",
    label: "Diet flexibility",
    icon: Salad,
    options: [
      { value: "structured", label: "Structured" },
      { value: "balanced", label: "Balanced" },
      { value: "flexible", label: "Flexible" },
    ],
  },
  {
    key: "groceryBudget",
    label: "Grocery budget",
    icon: ChefHat,
    options: [
      { value: "budget", label: "Budget" },
      { value: "moderate", label: "Moderate" },
      { value: "premium", label: "Premium" },
    ],
  },
  {
    key: "cookingHabits",
    label: "Cooking habits",
    icon: CalendarDays,
    options: [
      { value: "simple", label: "Simple prep" },
      { value: "mix", label: "Mix" },
      { value: "cook_often", label: "Cook often" },
    ],
  },
  {
    key: "workoutLocation",
    label: "Workout location",
    icon: MapPin,
    options: [
      { value: "gym", label: "Gym" },
      { value: "home", label: "Home" },
      { value: "outdoors", label: "Outdoors" },
      { value: "gym_home", label: "Gym + home" },
    ],
  },
  {
    key: "checkInPreference",
    label: "Check-ins",
    icon: Bell,
    options: [
      { value: "event_driven", label: "Only when useful" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
    ],
  },
  {
    key: "coachStyle",
    label: "Coach style",
    icon: MessageCircle,
    options: [
      { value: "direct_supportive", label: "Direct + supportive" },
      { value: "data_first", label: "Data first" },
      { value: "encouraging", label: "Encouraging" },
    ],
  },
] satisfies Array<{
  key: keyof IntakePreferences;
  label: string;
  icon: typeof Clock3;
  options: Array<{ value: string; label: string }>;
}>;

function normalizeIntakePreferences(raw?: Record<string, unknown>): IntakePreferences {
  return {
    ...DEFAULT_INTAKE,
    ...(raw ?? {}),
  } as IntakePreferences;
}

function normalizeProfileInputs(raw?: Partial<ProfileInputs>): ProfileInputs {
  return {
    ...DEFAULT_PROFILE_INPUTS,
    ...(raw ?? {}),
  };
}

function lbToKg(value: number) {
  return Math.round((value / 2.20462) * 10) / 10;
}

function inchesToCm(value: number) {
  return Math.round(value * 2.54);
}

export function SettingsClient({
  email,
  displayName,
  isPreview,
  appVersion,
  initialIntakePreferences,
  initialProfileInputs,
}: SettingsClientProps) {
  const router = useRouter();
  const { units, setUnits } = useUnits();
  const { diets, allergies } = usePreferences();
  const {
    integrationSummary,
    enablePreviewGarminSummary,
    disconnectIntegrationSummary,
  } = useGoalContextStore();
  const [signingOut, setSigningOut] = useState(false);
  const [intakePrefs, setIntakePrefs] = useState<IntakePreferences>(() =>
    normalizeIntakePreferences(initialIntakePreferences)
  );
  const [profileInputs, setProfileInputs] = useState<ProfileInputs>(() =>
    normalizeProfileInputs(initialProfileInputs)
  );
  const [savingIntake, setSavingIntake] = useState(false);
  const [savedIntake, setSavedIntake] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);

  // Known filters get their display label; free-form diets set via Coach
  // (e.g. "vegetarian") render as-is so they don't silently disappear.
  const dietLabels = diets.map(
    (d) => DIET_FILTERS.find((f) => f.id === d)?.label ?? d
  );

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function updateIntakePreference(key: keyof IntakePreferences, value: string) {
    setIntakePrefs((current) => ({ ...current, [key]: value }));
    setSavedIntake(false);
  }

  function updateProfileInput<K extends keyof ProfileInputs>(key: K, value: ProfileInputs[K]) {
    setProfileInputs((current) => ({ ...current, [key]: value }));
    setSavedProfile(false);
  }

  async function saveProfileInputs() {
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      const weightKg = lbToKg(profileInputs.weightLb);
      const heightCm = inchesToCm(profileInputs.heightIn);
      const age = calculateAge(profileInputs.dateOfBirth);
      const macroTargets = calculateMacroTargets({
        gender: profileInputs.gender,
        weightKg,
        heightCm,
        age,
        activityLevel: profileInputs.activityLevel,
        goal: profileInputs.goal,
      });

      if (isPreview) {
        window.localStorage.setItem("fuelwell:preview-profile-inputs", JSON.stringify(profileInputs));
        setSavedProfile(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({
          date_of_birth: profileInputs.dateOfBirth,
          gender: profileInputs.gender,
          height_cm: heightCm,
          weight_kg: weightKg,
          activity_level: profileInputs.activityLevel,
          goal: profileInputs.goal,
          dietary_preference: profileInputs.dietaryPreference,
          allergies: profileInputs.allergies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          meals_per_day: profileInputs.mealsPerDay,
          experience_level: profileInputs.experienceLevel,
          calorie_target: macroTargets.calories,
          protein_target: macroTargets.protein,
          carbs_target: macroTargets.carbs,
          fat_target: macroTargets.fat,
        })
        .eq("id", user.id);
      setSavedProfile(true);
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveIntakePreferences() {
    setSavingIntake(true);
    setSavedIntake(false);
    try {
      if (isPreview) {
        window.localStorage.setItem("fuelwell:preview-intake-preferences", JSON.stringify(intakePrefs));
        setSavedIntake(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("preferences_jsonb")
        .eq("id", user.id)
        .single();
      const current = (data?.preferences_jsonb ?? {}) as Record<string, unknown>;
      await supabase
        .from("profiles")
        .update({
          preferences_jsonb: {
            ...current,
            onboarding: {
              ...((current.onboarding ?? {}) as Record<string, unknown>),
              ...intakePrefs,
            },
          },
        })
        .eq("id", user.id);
      setSavedIntake(true);
    } finally {
      setSavingIntake(false);
    }
  }

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-3xl md:text-4xl">Settings</h1>
            <p className="fw-muted mt-1 text-base">Account, preferences, integrations, and data controls</p>
          </div>
          <Badge className="px-4 py-2 text-sm">v{appVersion}</Badge>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
        {isPreview && (
          <Card className="border-primary-100 bg-primary-50/80">
            <p className="text-sm font-black text-primary-900">
              Preview mode is using a sample account. Account details below are placeholder values, not a real signed-in user.
            </p>
          </Card>
        )}

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="fw-dark-panel px-8 py-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-200">
              Account control center
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
              {displayName || "FuelWell preview account"}
            </h2>
            <p className="mt-3 truncate text-base font-semibold text-white/66">
              {email || "No email set"}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroStat label="Units" value={units} />
              <HeroStat label="Diets" value={`${dietLabels.length}`} />
              <HeroStat label="Garmin" value={formatIntegrationShort(integrationSummary.status)} />
            </div>
          </Card>

          <Card variant="elevated" className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="fw-icon-chip">
                  <Watch className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-neutral-900">Garmin Connect</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">
                    Top priority for active calories, steps, sleep, recovery, and planned workouts.
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  integrationSummary.status === "connected" ||
                  integrationSummary.status === "preview_sample"
                    ? "success"
                    : undefined
                }
              >
                {integrationSummary.status === "preview_sample"
                  ? "Preview sample"
                  : integrationSummary.status === "connected"
                    ? "Connected"
                    : "Disconnected"}
              </Badge>
            </div>
            <div className="fw-soft-row p-4">
              <p className="text-sm font-semibold leading-6 text-neutral-500">
                {integrationSummary.note ??
                  "Connect Garmin to bring goal context into meal guidance. Nutrition remains saved in FuelWell."}
              </p>
              {integrationSummary.activeCalories !== undefined && (
                <p className="mt-3 text-base font-black text-neutral-900">
                  {integrationSummary.activeCalories} active calories ·{" "}
                  {integrationSummary.steps?.toLocaleString()} steps ·{" "}
                  {integrationSummary.recoveryLabel}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" disabled>
                Request Garmin access
              </Button>
              {isPreview && integrationSummary.status !== "preview_sample" && (
                <Button variant="secondary" size="sm" onClick={enablePreviewGarminSummary}>
                  Use preview sample
                </Button>
              )}
              {integrationSummary.status === "preview_sample" && (
                <Button variant="secondary" size="sm" onClick={disconnectIntegrationSummary}>
                  Clear preview sample
                </Button>
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Section title="Account">
            <Card className="divide-y divide-primary-100/70 px-6 py-3">
              <Row icon={User} label="Display name">
                <span className="text-sm font-black text-neutral-900">
                  {displayName || <span className="text-neutral-400">Not set</span>}
                </span>
              </Row>
              <Row icon={Mail} label="Email">
                <span className="block min-w-0 truncate text-sm font-black text-neutral-900">
                  {email || <span className="text-neutral-400">Not set</span>}
                </span>
              </Row>
            </Card>
            {isPreview && (
              <p className="mt-2 px-1 text-xs font-semibold text-neutral-500">
                Sign in to manage your real account details.
              </p>
            )}
          </Section>

          <Section title="Preferences">
            <Card className="space-y-5 px-6 py-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-black text-neutral-900">Units</span>
                </div>
                <div className="inline-flex rounded-full bg-neutral-100 p-1">
                  {(["metric", "imperial"] as UnitSystem[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnits(u)}
                      className={cn(
                        "rounded-full px-5 py-2 text-sm font-black capitalize transition-colors",
                        units === u
                          ? "bg-white text-neutral-900 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-700"
                      )}
                      aria-pressed={units === u}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <PreferenceBlock icon={Salad} title="Dietary preferences">
                {dietLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {dietLabels.map((label) => (
                      <Badge key={label} variant="success">
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-neutral-400">
                    No dietary filters selected. Choose some in Log or Recipes.
                  </p>
                )}
              </PreferenceBlock>

              <PreferenceBlock icon={ShieldAlert} title="Allergies">
                {allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((a) => (
                      <Badge key={a} variant="warning">
                        {a}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-neutral-400">No allergies recorded.</p>
                )}
              </PreferenceBlock>
            </Card>
          </Section>
        </section>

        <Section title="Body and goal inputs">
          <Card className="space-y-5 px-6 py-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="text-2xl font-black text-neutral-900">
                  Edit your intake profile
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-neutral-500">
                  These answers drive calorie targets, macro targets, workout estimates, and coach recommendations.
                </p>
              </div>
              <Button onClick={saveProfileInputs} loading={savingProfile} className="rounded-full">
                <Save className="h-4 w-4" />
                {savedProfile ? "Saved" : "Save profile"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TextField
                label="Date of birth"
                type="date"
                value={profileInputs.dateOfBirth}
                onChange={(value) => updateProfileInput("dateOfBirth", value)}
              />
              <SelectField
                label="Gender"
                value={profileInputs.gender}
                onChange={(value) => updateProfileInput("gender", value as Gender)}
                options={[
                  ["male", "Male"],
                  ["female", "Female"],
                  ["other", "Other"],
                ]}
              />
              <NumberField
                label="Height"
                suffix="in"
                value={profileInputs.heightIn}
                onChange={(value) => updateProfileInput("heightIn", value)}
              />
              <NumberField
                label="Weight"
                suffix="lb"
                value={profileInputs.weightLb}
                onChange={(value) => updateProfileInput("weightLb", value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label="Goal"
                value={profileInputs.goal}
                onChange={(value) => updateProfileInput("goal", value as Goal)}
                options={[
                  ["lose", "Lose fat"],
                  ["maintain", "Maintain"],
                  ["gain", "Gain muscle"],
                ]}
              />
              <SelectField
                label="Activity level"
                value={profileInputs.activityLevel}
                onChange={(value) => updateProfileInput("activityLevel", value as ActivityLevel)}
                options={[
                  ["sedentary", "Sedentary"],
                  ["light", "Light"],
                  ["moderate", "Moderate"],
                  ["active", "Active"],
                  ["very_active", "Very active"],
                ]}
              />
              <SelectField
                label="Diet"
                value={profileInputs.dietaryPreference}
                onChange={(value) => updateProfileInput("dietaryPreference", value)}
                options={[
                  ["none", "No preference"],
                  ["vegetarian", "Vegetarian"],
                  ["vegan", "Vegan"],
                  ["pescatarian", "Pescatarian"],
                  ["keto", "Keto"],
                  ["paleo", "Paleo"],
                ]}
              />
              <SelectField
                label="Training level"
                value={profileInputs.experienceLevel}
                onChange={(value) => updateProfileInput("experienceLevel", value)}
                options={[
                  ["beginner", "Beginner"],
                  ["intermediate", "Intermediate"],
                  ["advanced", "Advanced"],
                ]}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[0.65fr_1.35fr]">
              <NumberField
                label="Meals per day"
                value={profileInputs.mealsPerDay}
                onChange={(value) => updateProfileInput("mealsPerDay", value)}
              />
              <TextField
                label="Allergies"
                value={profileInputs.allergies}
                onChange={(value) => updateProfileInput("allergies", value)}
                placeholder="Separate allergies with commas"
              />
            </div>

            <div className="rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3">
              <div className="flex items-start gap-3">
                <Dumbbell className="mt-0.5 h-4 w-4 text-primary-700" />
                <p className="text-sm font-semibold leading-6 text-primary-900/70">
                  Workout calorie estimates use your saved weight. Nutrition targets update from your saved age, height, weight, activity level, and goal.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Intake preferences">
          <Card className="space-y-5 px-6 py-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="text-2xl font-black text-neutral-900">
                  Edit your signup answers
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-neutral-500">
                  These preferences guide coaching, meal flexibility, grocery suggestions, and workout recommendations.
                </p>
              </div>
              <Button onClick={saveIntakePreferences} loading={savingIntake} className="rounded-full">
                <Save className="h-4 w-4" />
                {savedIntake ? "Saved" : "Save changes"}
              </Button>
            </div>
            <div className="flex flex-col gap-2 rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold leading-6 text-primary-900/70">
                Need to change body context, goal, or allergies? Re-run the full intake instead of editing only preferences here.
              </p>
              <Link
                href="/app/onboarding"
                className="self-start rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-100 sm:self-center"
              >
                Re-run intake
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {INTAKE_GROUPS.map((group) => (
                <IntakePreferenceGroup
                  key={group.key}
                  group={group}
                  value={intakePrefs[group.key]}
                  onChange={(value) => updateIntakePreference(group.key, value)}
                />
              ))}
            </div>
          </Card>
        </Section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Section title="Notifications">
            <ActionCard icon={Bell} title="Meal reminders & coach nudges" detail="Push and email notifications are not available yet.">
              <Badge>Coming soon</Badge>
            </ActionCard>
          </Section>

          <Section title="Data">
            <Card className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                    <Download className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-base font-black text-neutral-900">Export your data</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">
                      Download your logs and preferences as a file.
                    </p>
                  </div>
                </div>
                <Badge>Coming soon</Badge>
              </div>
              <Button variant="secondary" size="sm" disabled className="opacity-50 cursor-not-allowed">
                <Download className="h-3.5 w-3.5" />
                Request export
              </Button>
            </Card>
          </Section>
        </section>

        <Section title="Coach activity">
          <CoachActivity />
        </Section>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Section title="Session">
            <Card>
              <Button variant="danger" onClick={handleSignOut} loading={signingOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </Card>
          </Section>

          <Section title="About">
            <Card className="divide-y divide-primary-100/70 px-6 py-3">
              <Row icon={Info} label="App">
                <span className="text-sm font-black text-neutral-900">
                  FuelWell — AI Nutrition Coach
                </span>
              </Row>
              <Row icon={Info} label="Version">
                <span className="text-sm font-black tabular-nums text-neutral-900">
                  {appVersion}
                </span>
              </Row>
            </Card>
          </Section>
        </section>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur">
      <p className="truncate text-lg font-black capitalize text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/58">{label}</p>
    </div>
  );
}

function formatIntegrationShort(status: string) {
  if (status === "preview_sample") return "Preview";
  if (status === "connected") return "On";
  return "Off";
}

function PreferenceBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Salad;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-primary-100/70 pt-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary-600" />
        <span className="text-sm font-black text-neutral-900">{title}</span>
      </div>
      {children}
    </div>
  );
}

function IntakePreferenceGroup({
  group,
  value,
  onChange,
}: {
  group: (typeof INTAKE_GROUPS)[number];
  value: string;
  onChange: (value: string) => void;
}) {
  const Icon = group.icon;

  return (
    <div className="rounded-[1.35rem] border border-primary-100/80 bg-[#f8fbf9] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-700">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm font-black text-neutral-900">{group.label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-black transition",
              value === option.value
                ? "bg-primary-600 text-white shadow-[0_10px_22px_rgba(21,145,108,0.18)]"
                : "bg-white text-neutral-500 hover:bg-primary-50 hover:text-primary-700"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </span>
      <div className="mt-2 flex items-center rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-neutral-900 outline-none"
        />
        {suffix && <span className="text-xs font-black uppercase text-neutral-400">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-[#dce8e3] bg-[#f4f8f6] px-4 py-3 text-sm font-bold text-neutral-900 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionCard({
  icon: Icon,
  title,
  detail,
  children,
}: {
  icon: typeof Bell;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-black text-neutral-900">{title}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{detail}</p>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3 shrink-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-black text-neutral-700">{label}</span>
      </div>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}
