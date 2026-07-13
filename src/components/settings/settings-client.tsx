"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import {
  DIET_FILTERS,
  clearPreferencesForUser,
  mergePreferences,
  usePreferences,
} from "@/lib/use-preferences";
import { useUnits, type UnitSystem } from "./use-units";
import { CoachActivity } from "./coach-activity";
import { useGoalContextStore } from "@/lib/use-goal-context";
import {
  GOAL_AGGRESSIVENESS_OPTIONS,
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
  CreditCard,
  HelpCircle,
  LogOut,
  Info,
  MapPin,
  MessageCircle,
  Save,
  Scale,
  Shield,
  SlidersHorizontal,
  Target,
  Trash2,
  Watch,
  Dumbbell,
  Activity,
} from "lucide-react";
import {
  clearUserScopedIdentityCaches,
  combineHeightParts,
  normalizeAllergies,
  normalizeDisplayName,
  normalizeGoalTimeline,
  splitHeightInches,
  updateProfileAndVerify,
  type ProfileUpdateClient,
} from "@/lib/profile-preferences";

interface SettingsClientProps {
  email: string;
  displayName: string;
  isPreview: boolean;
  appVersion: string;
  initialIntakePreferences?: Record<string, unknown>;
  initialProfileInputs?: Partial<ProfileInputs>;
  initialUnits?: UnitSystem;
}

type IntakePreferences = {
  goalTimeline: string;
  nutritionAggressiveness: string;
  dietFlexibility: string;
  groceryBudget: string;
  cookingHabits: string;
  workoutLocation: string;
  equipmentAccess: string;
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

const PREVIEW_PROFILE_INPUTS_KEY = "fuelwell:preview-profile-inputs";
const PREVIEW_INTAKE_PREFERENCES_KEY = "fuelwell:preview-intake-preferences";

const DEFAULT_INTAKE: IntakePreferences = {
  goalTimeline: "steady",
  nutritionAggressiveness: "steady_loss",
  dietFlexibility: "balanced",
  groceryBudget: "moderate",
  cookingHabits: "mix",
  workoutLocation: "gym_home",
  equipmentAccess: "full_gym",
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

const CHECK_IN_OPTIONS = [
  { value: "event_driven", label: "Only when useful" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const EQUIPMENT_ACCESS_OPTIONS = [
  { value: "full_gym", label: "Full gym" },
  { value: "barbell", label: "Barbell + rack" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "none", label: "Bodyweight only" },
  { value: "outdoors", label: "Outdoor cardio" },
];

const INTAKE_GROUPS = [
  {
    key: "goalTimeline",
    label: "Goal timeline",
    icon: Clock3,
    options: [
      { value: "patient", label: "Patient" },
      { value: "steady", label: "Steady" },
      { value: "aggressive", label: "Aggressive" },
    ],
  },
  {
    key: "nutritionAggressiveness",
    label: "Goal aggressiveness",
    icon: SlidersHorizontal,
    options: GOAL_AGGRESSIVENESS_OPTIONS.map((option) => ({
      value: option.value,
      label: option.shortLabel,
    })),
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
    options: CHECK_IN_OPTIONS,
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
  const normalized = {
    ...DEFAULT_INTAKE,
    ...(raw ?? {}),
  } as IntakePreferences;
  normalized.goalTimeline = normalizeGoalTimeline(normalized.goalTimeline);
  return normalized;
}

function normalizeProfileInputs(raw?: Partial<ProfileInputs>): ProfileInputs {
  const normalized = {
    ...DEFAULT_PROFILE_INPUTS,
    ...(raw ?? {}),
  };
  normalized.allergies = normalizeAllergies(parseCommaList(normalized.allergies)).join(", ");
  return normalized;
}

function lbToKg(value: number) {
  return Math.round((value / 2.20462) * 10) / 10;
}

function inchesToCm(value: number) {
  return Math.round(value * 2.54);
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isUnitSystem(value: unknown): value is UnitSystem {
  return value === "metric" || value === "imperial";
}

function readPreviewStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writePreviewStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Preview storage is best-effort; private browsing can reject writes.
  }
}

export function SettingsClient({
  email,
  displayName,
  isPreview,
  appVersion,
  initialIntakePreferences,
  initialProfileInputs,
  initialUnits,
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
  const [displayNameValue, setDisplayNameValue] = useState(displayName);
  const [intakePrefs, setIntakePrefs] = useState<IntakePreferences>(() =>
    normalizeIntakePreferences(initialIntakePreferences)
  );
  const [profileInputs, setProfileInputs] = useState<ProfileInputs>(() =>
    normalizeProfileInputs(initialProfileInputs)
  );
  const [savingIntake, setSavingIntake] = useState(false);
  const [savedIntake, setSavedIntake] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);
  const [savedHealth, setSavedHealth] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUnits) setUnits(initialUnits);
  }, [initialUnits, setUnits]);

  useEffect(() => {
    if (!isPreview) return;

    const savedProfileInputs = readPreviewStorage<
      Partial<ProfileInputs> & { displayName?: unknown }
    >(
      PREVIEW_PROFILE_INPUTS_KEY
    );
    if (savedProfileInputs) {
      setProfileInputs(normalizeProfileInputs(savedProfileInputs));
      if (typeof savedProfileInputs.displayName === "string") {
        setDisplayNameValue(savedProfileInputs.displayName);
      }
    }

    const savedIntakePreferences = readPreviewStorage<
      Partial<IntakePreferences> & { units?: unknown }
    >(PREVIEW_INTAKE_PREFERENCES_KEY);
    if (savedIntakePreferences) {
      const { units: savedUnits, ...savedIntake } = savedIntakePreferences;
      setIntakePrefs(normalizeIntakePreferences(savedIntake));
      if (isUnitSystem(savedUnits)) setUnits(savedUnits);
    }
  }, [isPreview, setUnits]);

  // Known filters get their display label; free-form diets set via Coach
  // (e.g. "vegetarian") render as-is so they don't silently disappear.
  const dietLabels = diets.map(
    (d) => DIET_FILTERS.find((f) => f.id === d)?.label ?? d
  );

  async function handleSignOut() {
    if (isPreview) {
      router.push("/app/dashboard");
      return;
    }

    setSigningOut(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      clearUserScopedIdentityCaches(user.id);
      clearPreferencesForUser(user.id);
    }
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function updateIntakePreference(key: keyof IntakePreferences, value: string) {
    setIntakePrefs((current) => ({ ...current, [key]: value }));
    setSavedIntake(false);
    setSavedHealth(false);
    setIntakeError(null);
    setHealthError(null);
  }

  function updateProfileInput<K extends keyof ProfileInputs>(key: K, value: ProfileInputs[K]) {
    setProfileInputs((current) => ({ ...current, [key]: value }));
    setSavedHealth(false);
    setHealthError(null);
  }

  function updateUnits(next: UnitSystem) {
    setUnits(next);
    setSavedIntake(false);
    setSavedHealth(false);
    setIntakeError(null);
    setHealthError(null);
  }

  async function persistProfileInputs() {
    const weightKg = lbToKg(profileInputs.weightLb);
    const heightCm = inchesToCm(profileInputs.heightIn);
    const age = calculateAge(profileInputs.dateOfBirth);
    const allergyList = normalizeAllergies(parseCommaList(profileInputs.allergies));
    const macroTargets = calculateMacroTargets({
      gender: profileInputs.gender,
      weightKg,
      heightCm,
      age,
      activityLevel: profileInputs.activityLevel,
      goal: profileInputs.goal,
      goalAggressiveness: intakePrefs.nutritionAggressiveness,
    });

    if (isPreview) {
      writePreviewStorage(PREVIEW_PROFILE_INPUTS_KEY, {
        ...profileInputs,
        displayName: displayNameValue,
      });
      mergePreferences({ allergies: allergyList });
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Your session expired. Please sign in again.");

    await updateProfileAndVerify(
      supabase as unknown as ProfileUpdateClient,
      user.id,
      {
        display_name: normalizeDisplayName(displayNameValue),
        date_of_birth: profileInputs.dateOfBirth,
        gender: profileInputs.gender,
        height_cm: heightCm,
        weight_kg: weightKg,
        activity_level: profileInputs.activityLevel,
        goal: profileInputs.goal,
        dietary_preference: profileInputs.dietaryPreference,
        allergies: allergyList,
        meals_per_day: profileInputs.mealsPerDay,
        experience_level: profileInputs.experienceLevel,
        calorie_target: macroTargets.calories,
        protein_target: macroTargets.protein,
        carbs_target: macroTargets.carbs,
        fat_target: macroTargets.fat,
      }
    );
    mergePreferences({ allergies: allergyList });
  }

  async function persistIntakePreferences() {
    const intakePayload = { ...intakePrefs, units };

    if (isPreview) {
      writePreviewStorage(PREVIEW_INTAKE_PREFERENCES_KEY, intakePayload);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Your session expired. Please sign in again.");

    const { data, error } = await supabase
      .from("profiles")
      .select("preferences_jsonb")
      .eq("id", user.id)
      .single();
    if (error) throw new Error(error.message);
    const current = (data?.preferences_jsonb ?? {}) as Record<string, unknown>;
    const preferencesJsonb = {
          ...current,
          units,
          onboarding: {
            ...((current.onboarding ?? {}) as Record<string, unknown>),
            ...intakePrefs,
            goalTimeline: normalizeGoalTimeline(intakePrefs.goalTimeline),
          },
        };
    await updateProfileAndVerify(
      supabase as unknown as ProfileUpdateClient,
      user.id,
      { preferences_jsonb: preferencesJsonb }
    );
  }

  async function saveIntakePreferences() {
    setSavingIntake(true);
    setSavedIntake(false);
    setIntakeError(null);
    try {
      await persistIntakePreferences();
      setSavedIntake(true);
    } catch (saveError) {
      setIntakeError(saveError instanceof Error ? saveError.message : "Preferences save failed.");
    } finally {
      setSavingIntake(false);
    }
  }

  async function saveHealthProfile() {
    setSavingHealth(true);
    setSavingIntake(true);
    setSavedHealth(false);
    setSavedIntake(false);
    setHealthError(null);
    setIntakeError(null);
    try {
      await persistProfileInputs();
      await persistIntakePreferences();
      setSavedHealth(true);
      setSavedIntake(true);
    } catch (saveError) {
      setHealthError(saveError instanceof Error ? saveError.message : "Profile save failed.");
    } finally {
      setSavingHealth(false);
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

        <section className="grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="fw-dark-panel min-w-0 px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-200">
              Account control center
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
              {displayNameValue || "FuelWell preview account"}
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

          <Card variant="elevated" className="min-w-0 space-y-5">
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

        <section className="grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Section id="account" title="Account">
            <Card className="divide-y divide-primary-100/70 px-6 py-3">
              <Row icon={User} label="Display name">
                <span className="text-sm font-black text-neutral-900">
                  {displayNameValue || <span className="text-neutral-400">Not set</span>}
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
                <SegmentedField
                  label="Units"
                  value={units}
                  onChange={(value) => updateUnits(value as UnitSystem)}
                  options={[
                    ["imperial", "Imperial"],
                    ["metric", "Metric"],
                  ]}
                />
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

        <Section id="health-profile" title="Health profile">
          <Card className="space-y-5 px-6 py-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="text-2xl font-black text-neutral-900">
                  Edit your health profile
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-neutral-500">
                  These rows drive calorie targets, macro targets, workout estimates, and coach recommendations.
                </p>
              </div>
              <Button onClick={saveHealthProfile} loading={savingHealth} className="rounded-full">
                <Save className="h-4 w-4" />
                {savedHealth ? "Saved" : "Save health profile"}
              </Button>
            </div>
            {healthError && (
              <p role="alert" className="rounded-[1.15rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {healthError}
              </p>
            )}

            <div className="divide-y divide-primary-100/80 rounded-[1.35rem] border border-primary-100 bg-muted/60">
              <HealthProfileRow
                icon={User}
                label="Display name"
                detail="The name shown across Profile, Settings, and Coach."
              >
                <TextField
                  label="Display name"
                  hideLabel
                  value={displayNameValue}
                  onChange={(value) => {
                    setDisplayNameValue(value);
                    setSavedHealth(false);
                    setHealthError(null);
                  }}
                  placeholder="Your name"
                />
              </HealthProfileRow>
              <HealthProfileRow
                icon={Scale}
                label="Weight"
                detail="Used for energy targets and workout burn estimates."
              >
                <NumberField
                  label="Weight in pounds"
                  hideLabel
                  suffix="lb"
                  value={profileInputs.weightLb}
                  onChange={(value) => updateProfileInput("weightLb", value)}
                />
              </HealthProfileRow>
              <HealthProfileRow
                icon={Ruler}
                label="Height"
                detail="Used with weight, age, activity, and goal to calculate targets."
              >
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Height in feet"
                    suffix="ft"
                    value={splitHeightInches(profileInputs.heightIn).feet || 0}
                    onChange={(value) =>
                      updateProfileInput(
                        "heightIn",
                        Number(combineHeightParts(value, splitHeightInches(profileInputs.heightIn).inches))
                      )
                    }
                  />
                  <NumberField
                    label="Remaining inches"
                    suffix="in"
                    value={Number(splitHeightInches(profileInputs.heightIn).inches)}
                    onChange={(value) =>
                      updateProfileInput(
                        "heightIn",
                        Number(combineHeightParts(splitHeightInches(profileInputs.heightIn).feet, value))
                      )
                    }
                  />
                </div>
              </HealthProfileRow>
              <HealthProfileRow
                icon={Target}
                label="Goal"
                detail="Primary body-composition direction for daily planning."
              >
                <SelectField
                  label="Goal"
                  hideLabel
                  value={profileInputs.goal}
                  onChange={(value) => updateProfileInput("goal", value as Goal)}
                  options={[
                    ["lose", "Lose fat"],
                    ["maintain", "Maintain"],
                    ["gain", "Gain muscle"],
                  ]}
                />
              </HealthProfileRow>
              <HealthProfileRow
                icon={ShieldAlert}
                label="Restrictions"
                detail="Allergies or foods FuelWell should avoid in suggestions."
              >
                <TextField
                  label="Food restrictions and allergies"
                  hideLabel
                  value={profileInputs.allergies}
                  onChange={(value) => updateProfileInput("allergies", value)}
                  placeholder="Separate restrictions with commas"
                />
                <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-neutral-600">
                  <input
                    type="checkbox"
                    checked={normalizeAllergies(parseCommaList(profileInputs.allergies)).length === 0}
                    onChange={(event) => {
                      if (event.target.checked) updateProfileInput("allergies", "");
                    }}
                    className="h-4 w-4 accent-primary-600"
                  />
                  None
                </label>
              </HealthProfileRow>
              <HealthProfileRow
                icon={Activity}
                label="Activity level"
                detail="Baseline movement level before specific workouts are logged."
              >
                <SelectField
                  label="Activity level"
                  hideLabel
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
              </HealthProfileRow>
              <HealthProfileRow
                icon={Dumbbell}
                label="Equipment"
                detail="Available workout equipment saved with intake context."
              >
                <SelectField
                  label="Available equipment"
                  hideLabel
                  value={intakePrefs.equipmentAccess}
                  onChange={(value) => updateIntakePreference("equipmentAccess", value)}
                  options={EQUIPMENT_ACCESS_OPTIONS.map((option) => [
                    option.value,
                    option.label,
                  ])}
                />
              </HealthProfileRow>
              <HealthProfileRow
                icon={Ruler}
                label="Units"
                detail="Display preference saved locally and with profile preferences."
              >
                <SegmentedField
                  label="Unit preference"
                  value={units}
                  onChange={(value) => updateUnits(value as UnitSystem)}
                  options={[
                    ["imperial", "Imperial"],
                    ["metric", "Metric"],
                  ]}
                />
              </HealthProfileRow>
              <HealthProfileRow
                icon={Bell}
                label="Notifications"
                detail="Coach nudge cadence; push and email delivery are not enabled here."
              >
                <SelectField
                  label="Notification preference"
                  hideLabel
                  value={intakePrefs.checkInPreference}
                  onChange={(value) => updateIntakePreference("checkInPreference", value)}
                  options={CHECK_IN_OPTIONS.map((option) => [option.value, option.label])}
                />
              </HealthProfileRow>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
              <NumberField
                label="Meals per day"
                value={profileInputs.mealsPerDay}
                onChange={(value) => updateProfileInput("mealsPerDay", value)}
              />
            </div>

            <div className="rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3">
              <div className="flex items-start gap-3">
                <Dumbbell className="mt-0.5 h-4 w-4 text-primary-700" />
                <p className="text-sm font-semibold leading-6 text-primary-900/70">
                  Preview saves stay on this device. Signed-in saves update your profile inputs and stored preference context.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        <Section id="coach-preferences" title="Intake preferences">
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
            {intakeError && (
              <p role="alert" className="rounded-[1.15rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {intakeError}
              </p>
            )}
            <div className="flex flex-col gap-2 rounded-[1.15rem] border border-primary-100 bg-primary-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold leading-6 text-primary-900/70">
                Re-run the full intake when you want the guided setup flow to rebuild these answers from scratch.
              </p>
              <Link
                href="/app/onboarding"
                className="inline-flex min-h-11 items-center self-start rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary-700 transition hover:bg-primary-100 sm:self-center md:min-h-0"
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
            <ActionCard
              icon={Bell}
              title="Coach nudge preference"
              detail={`Current cadence: ${formatOptionLabel(CHECK_IN_OPTIONS, intakePrefs.checkInPreference)}. This saves preference context only.`}
            >
              <Badge variant={savedIntake ? "success" : undefined}>
                {savedIntake ? "Saved" : "Editable"}
              </Badge>
            </ActionCard>
          </Section>

          <Section id="data" title="Data">
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

        <section className="grid gap-4 xl:grid-cols-2">
          <Section id="privacy" title="Privacy">
            <ActionCard icon={Shield} title="Privacy controls" detail="Review what Coach can remember, what files are attached, and what data is used for guidance.">
              <Badge>Preview</Badge>
            </ActionCard>
          </Section>

          <Section id="subscription" title="Subscription">
            <ActionCard icon={CreditCard} title="Plan and billing" detail="Manage your FuelWell plan, invoices, and subscription status.">
              <Badge>Coming soon</Badge>
            </ActionCard>
          </Section>

          <Section id="support" title="Support">
            <ActionCard icon={HelpCircle} title="Get help" detail="Contact support, report an issue, or request a coach-data review.">
              <Button variant="secondary" size="sm" disabled>
                Contact support
              </Button>
            </ActionCard>
          </Section>

          <Section id="delete-account" title="Delete account">
            <ActionCard icon={Trash2} title="Delete account" detail="Permanently remove your account, logs, preferences, and coach history.">
              <Button variant="danger" size="sm" disabled>
                Delete
              </Button>
            </ActionCard>
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

function formatOptionLabel(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
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

function HealthProfileRow({
  icon: Icon,
  label,
  detail,
  children,
}: {
  icon: typeof Scale;
  label: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)] md:items-center">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-black text-neutral-900">{label}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">{detail}</p>
        </div>
      </div>
      <div>{children}</div>
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
    <div className="rounded-[1.35rem] border border-primary-100/80 bg-muted/60 p-4">
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
              "min-h-11 rounded-full px-3.5 py-2 text-xs font-black transition md:min-h-0",
              value === option.value
                ? "bg-primary-600 text-white shadow-sm shadow-primary-900/10"
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

function SegmentedField({
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
    <fieldset aria-label={label} className="inline-flex rounded-full bg-neutral-100 p-1">
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={cn(
            "min-h-11 rounded-full px-5 py-2 text-sm font-black transition-colors md:min-h-0",
            value === optionValue
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )}
          aria-pressed={value === optionValue}
        >
          {optionLabel}
        </button>
      ))}
    </fieldset>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hideLabel = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hideLabel?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={cn(
          "text-xs font-black uppercase tracking-[0.14em] text-neutral-400",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-bold text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  hideLabel = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hideLabel?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={cn(
          "text-xs font-black uppercase tracking-[0.14em] text-neutral-400",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </span>
      <div className="mt-2 flex items-center rounded-2xl border border-border bg-muted px-4 py-3 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200">
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
  hideLabel = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  hideLabel?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={cn(
          "text-xs font-black uppercase tracking-[0.14em] text-neutral-400",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-bold text-neutral-900 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-200"
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
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id}>
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
