"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import {
  DIET_FILTERS,
  clearPreferencesForUser,
  getPreferences,
  mergePreferences,
  usePreferences,
} from "@/lib/use-preferences";
import { useUnits, type UnitSystem } from "./use-units";
import { CoachActivity } from "./coach-activity";
import { useGoalContextStore } from "@/lib/use-goal-context";
import {
  readPreviewOnboardingOverride,
  writePreviewOnboardingOverride,
} from "@/lib/preview-onboarding";
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
  UserCog,
  type LucideIcon,
} from "lucide-react";
import {
  clearUserScopedIdentityCaches,
  combineHeightParts,
  normalizeAllergies,
  normalizeDisplayName,
  normalizeGoalTimeline,
  splitHeightInches,
  toggleAllergySelection,
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

// Mirrors the onboarding allergy step so both surfaces speak the same language.
const ALLERGY_CHIP_OPTIONS = [
  "None",
  "Dairy",
  "Gluten",
  "Nuts",
  "Soy",
  "Eggs",
  "Shellfish",
  "Fish",
  "Wheat",
];

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

function kgToLb(value: number) {
  return Math.round(value * 2.20462 * 10) / 10;
}

function inchesToCm(value: number) {
  return Math.round(value * 2.54);
}

function cmToInches(value: number) {
  return Math.round((value / 2.54) * 10) / 10;
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

    // The completed intake quiz is the freshest identity source in preview:
    // without this, the name chosen during onboarding never shows up here.
    const onboardingName = readPreviewOnboardingOverride()?.data?.displayName?.trim();
    if (onboardingName && typeof savedProfileInputs?.displayName !== "string") {
      setDisplayNameValue(onboardingName);
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

  // First-load reconciliation: the Preferences card reads the local preference
  // store while the health profile shows the saved profile. Saving already
  // merges the two (see persistProfileInputs); do the same on initial read so
  // "No allergies recorded" never renders beside a profile restriction.
  useEffect(() => {
    const savedPreview = isPreview
      ? readPreviewStorage<Partial<ProfileInputs>>(PREVIEW_PROFILE_INPUTS_KEY)?.allergies
      : undefined;
    const source =
      typeof savedPreview === "string" ? savedPreview : initialProfileInputs?.allergies ?? "";
    const profileAllergies = normalizeAllergies(parseCommaList(source));
    if (profileAllergies.length === 0) return;

    const storedAllergies = getPreferences().allergies;
    const merged = normalizeAllergies([...storedAllergies, ...profileAllergies]);
    if (merged.length !== storedAllergies.length) {
      mergePreferences({ allergies: merged });
    }
  }, [isPreview, initialProfileInputs]);

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
      const existingOverride = readPreviewOnboardingOverride() ?? {};
      writePreviewOnboardingOverride({
        ...existingOverride,
        data: {
          ...existingOverride.data,
          displayName: normalizeDisplayName(displayNameValue) ?? "",
          goal: profileInputs.goal,
          activityLevel: profileInputs.activityLevel,
          dietaryPreference: profileInputs.dietaryPreference,
        },
        macros: macroTargets,
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
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-2xl md:text-4xl">Settings</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">Account, preferences, integrations, and data controls</p>
            <nav
              aria-label="Settings sections"
              className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 md:hidden"
            >
              {[
                ["#account", "Account"],
                ["#preferences", "Preferences"],
                ["#health-profile", "Health"],
                ["#coach-preferences", "Intake"],
                ["#data", "Data"],
                ["#session", "Session"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="fw-press inline-flex min-h-11 shrink-0 items-center rounded-full bg-surface/85 px-3.5 py-1.5 text-xs font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-50 hover:ring-primary-200"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <Badge className="shrink-0 px-4 py-2 text-sm tabular-nums">v{appVersion}</Badge>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        {isPreview && (
          <Card variant="tinted" padding="sm" className="flex gap-3 bg-primary-50/80">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-surface text-primary-700 ring-1 ring-inset ring-primary-100">
              <Info className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="min-w-0 text-sm font-bold leading-6 text-primary-900">
              Preview mode is using a sample account. Account details below are placeholder values, not a real signed-in user.
            </p>
          </Card>
        )}

        <section className="grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="fw-dark-panel min-w-0 px-5 py-6 sm:px-8 sm:py-8">
            <p className="text-[0.6875rem] font-black uppercase tracking-[0.18em] text-primary-200">
              Account control center
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-white md:mt-4 md:text-5xl">
              {displayNameValue || "FuelWell preview account"}
            </h2>
            <p className="mt-2 truncate text-sm font-semibold text-white/66 md:mt-3 md:text-base">
              {email || "No email set"}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 md:mt-8 md:gap-3">
              <HeroStat label="Units" value={units} />
              <HeroStat label="Diets" value={dietLabels.length > 0 ? `${dietLabels.length}` : "None"} />
              <HeroStat label="Garmin" value={formatIntegrationShort(integrationSummary.status)} />
            </div>
          </Card>

          <Card variant="elevated" className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
                  <Watch className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-ink">Garmin Connect</h2>
                    <Badge size="sm" variant="neutral">
                      Coming soon
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                    Top priority for active calories, steps, sleep, recovery, and planned workouts.
                  </p>
                </div>
              </div>
              <Badge
                dot
                variant={
                  integrationSummary.status === "connected" ||
                  integrationSummary.status === "preview_sample"
                    ? "success"
                    : "neutral"
                }
              >
                {integrationSummary.status === "preview_sample"
                  ? "Preview sample"
                  : integrationSummary.status === "connected"
                    ? "Connected"
                    : "Disconnected"}
              </Badge>
            </div>
            <div className="rounded-[1.25rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
              <p className="text-sm font-semibold leading-6 text-ink-muted">
                {integrationSummary.note ??
                  "Connect Garmin to bring goal context into meal guidance. Nutrition remains saved in FuelWell."}
              </p>
              {integrationSummary.activeCalories !== undefined && (
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-black text-ink">
                  <span className="tabular-nums">{integrationSummary.activeCalories}</span> active
                  calories
                  <span aria-hidden="true" className="text-ink-faint">
                    ·
                  </span>
                  <span className="tabular-nums">
                    {integrationSummary.steps?.toLocaleString()}
                  </span>{" "}
                  steps
                  <span aria-hidden="true" className="text-ink-faint">
                    ·
                  </span>
                  {integrationSummary.recoveryLabel}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
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
            <Card className="divide-y divide-hairline px-6 py-3">
              <Row icon={User} label="Display name">
                {displayNameValue ? (
                  <span className="text-sm font-black text-ink">{displayNameValue}</span>
                ) : (
                  <span className="text-sm font-bold text-ink-faint">Not set</span>
                )}
              </Row>
              <Row icon={Mail} label="Email">
                {email ? (
                  <span className="block min-w-0 truncate text-sm font-black text-ink">
                    {email}
                  </span>
                ) : (
                  <span className="text-sm font-bold text-ink-faint">Not set</span>
                )}
              </Row>
            </Card>
            {isPreview && (
              <p className="mt-2 px-1 text-xs font-semibold text-ink-muted">
                Sign in to manage your real account details.
              </p>
            )}
          </Section>

          <Section id="preferences" title="Preferences">
            <Card className="space-y-5 px-6 py-6">
              <PreferenceBlock icon={Ruler} title="Units" divided={false}>
                <SegmentedField
                  label="Units"
                  value={units}
                  onChange={(value) => updateUnits(value as UnitSystem)}
                  options={[
                    ["imperial", "Imperial"],
                    ["metric", "Metric"],
                  ]}
                />
              </PreferenceBlock>

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
                  <p className="text-sm font-semibold text-ink-muted">
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
                  <p className="text-sm font-semibold text-ink-muted">No allergies recorded.</p>
                )}
              </PreferenceBlock>
            </Card>
          </Section>
        </section>

        <Section id="health-profile" title="Health profile">
          <Card className="space-y-5 px-6 py-6">
            <SectionHeader
              icon={UserCog}
              title="Edit your health profile"
              description="These rows drive calorie targets, macro targets, workout estimates, and coach recommendations."
              action={
                <Button
                  onClick={saveHealthProfile}
                  loading={savingHealth}
                  className="hidden rounded-full md:inline-flex"
                >
                  <Save className="h-4 w-4" />
                  {savedHealth ? "Saved" : "Save health profile"}
                </Button>
              }
            />
            {healthError && (
              <p role="alert" className="rounded-[1.15rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-inset ring-red-100">
                {healthError}
              </p>
            )}

            <div className="divide-y divide-hairline rounded-[1.35rem] bg-surface-muted ring-1 ring-inset ring-hairline">
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
                {units === "metric" ? (
                  <NumberField
                    label="Weight in kilograms"
                    hideLabel
                    suffix="kg"
                    value={lbToKg(profileInputs.weightLb)}
                    onChange={(value) => updateProfileInput("weightLb", kgToLb(value))}
                  />
                ) : (
                  <NumberField
                    label="Weight in pounds"
                    hideLabel
                    suffix="lb"
                    value={profileInputs.weightLb}
                    onChange={(value) => updateProfileInput("weightLb", value)}
                  />
                )}
              </HealthProfileRow>
              <HealthProfileRow
                icon={Ruler}
                label="Height"
                detail="Used with weight, age, activity, and goal to calculate targets."
              >
                {units === "metric" ? (
                  <NumberField
                    label="Height in centimeters"
                    hideLabel
                    suffix="cm"
                    value={inchesToCm(profileInputs.heightIn)}
                    onChange={(value) => updateProfileInput("heightIn", cmToInches(value))}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField
                      label="Feet"
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
                      label="Inches"
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
                )}
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
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_CHIP_OPTIONS.map((option) => {
                    const currentList = normalizeAllergies(parseCommaList(profileInputs.allergies));
                    const selected =
                      option === "None"
                        ? currentList.length === 0
                        : currentList.some(
                            (allergy) => allergy.toLocaleLowerCase() === option.toLocaleLowerCase()
                          );
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          updateProfileInput(
                            "allergies",
                            toggleAllergySelection(currentList, option).join(", ")
                          )
                        }
                        className={choiceChipClass(selected)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <TextField
                    label="Food restrictions and allergies"
                    hideLabel
                    value={profileInputs.allergies}
                    onChange={(value) => updateProfileInput("allergies", value)}
                    placeholder="Add others, separated by commas"
                  />
                </div>
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
            </div>

            <div className="grid gap-4 rounded-[1.35rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline md:grid-cols-2 xl:grid-cols-5">
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

            <div className="rounded-[1.15rem] bg-primary-50/70 px-4 py-3 ring-1 ring-inset ring-primary-100">
              <div className="flex items-start gap-3">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <p className="min-w-0 text-sm font-semibold leading-6 text-primary-900/75">
                  Preview saves stay on this device. Signed-in saves update your profile inputs and stored preference context.
                </p>
              </div>
            </div>

            <Button
              onClick={saveHealthProfile}
              loading={savingHealth}
              className="w-full rounded-full md:hidden"
            >
              <Save className="h-4 w-4" />
              {savedHealth ? "Saved" : "Save health profile"}
            </Button>
          </Card>
        </Section>

        <Section id="coach-preferences" title="Intake preferences">
          <Card className="space-y-5 px-6 py-6">
            <SectionHeader
              icon={SlidersHorizontal}
              title="Edit your signup answers"
              description="These preferences guide coaching, meal flexibility, grocery suggestions, and workout recommendations."
              action={
                <Button
                  onClick={saveIntakePreferences}
                  loading={savingIntake}
                  className="hidden rounded-full md:inline-flex"
                >
                  <Save className="h-4 w-4" />
                  {savedIntake ? "Saved" : "Save changes"}
                </Button>
              }
            />
            {intakeError && (
              <p role="alert" className="rounded-[1.15rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700 ring-1 ring-inset ring-red-100">
                {intakeError}
              </p>
            )}
            <div className="flex flex-col gap-3 rounded-[1.15rem] bg-primary-50/70 px-4 py-3 ring-1 ring-inset ring-primary-100 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-sm font-semibold leading-6 text-primary-900/75">
                Re-run the full intake when you want the guided setup flow to rebuild these answers from scratch.
              </p>
              <Link
                href="/app/onboarding"
                className="fw-press inline-flex min-h-11 shrink-0 items-center self-start rounded-full bg-surface px-3.5 py-1.5 text-xs font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 sm:self-center md:min-h-9"
              >
                Retake the setup quiz
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

            <Button
              onClick={saveIntakePreferences}
              loading={savingIntake}
              className="w-full rounded-full md:hidden"
            >
              <Save className="h-4 w-4" />
              {savedIntake ? "Saved" : "Save changes"}
            </Button>
          </Card>
        </Section>

        <Section title="Notifications">
          <ActionCard
            icon={Bell}
            title="Coach nudge preference"
            detail={`Current cadence: ${formatOptionLabel(CHECK_IN_OPTIONS, intakePrefs.checkInPreference)}. This saves preference context only.`}
          >
            <Badge dot variant={savedIntake ? "success" : "neutral"}>
              {savedIntake ? "Saved" : "Editable"}
            </Badge>
          </ActionCard>
        </Section>

        <Section title="Coming with public release">
          <div className="grid gap-4 xl:grid-cols-2">
            <div id="data" className="min-w-0 scroll-mt-24">
              <ActionCard icon={Download} title="Export your data" detail="Download your logs and preferences as a file.">
                <Badge variant="neutral">Coming soon</Badge>
              </ActionCard>
            </div>
            <div id="privacy" className="min-w-0 scroll-mt-24">
              <ActionCard icon={Shield} title="Privacy controls" detail="Review what Coach can remember, what files are attached, and what data is used for guidance.">
                <Badge variant="info">Preview</Badge>
              </ActionCard>
            </div>
            <div id="subscription" className="min-w-0 scroll-mt-24">
              <ActionCard icon={CreditCard} title="Plan and billing" detail="Manage your FuelWell plan, invoices, and subscription status.">
                <Badge variant="neutral">Coming soon</Badge>
              </ActionCard>
            </div>
            <div id="support" className="min-w-0 scroll-mt-24">
              <ActionCard icon={HelpCircle} title="Get help" detail="A support contact and coach-data review path arrive with the public release.">
                <Badge variant="neutral">Coming soon</Badge>
              </ActionCard>
            </div>
          </div>
        </Section>

        <Section title="Coach activity">
          <CoachActivity />
        </Section>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Section id="session" title="Session">
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold leading-6 text-ink-muted">
                Ends this session on this device.
              </p>
              <Button variant="danger" onClick={handleSignOut} loading={signingOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </Card>
          </Section>

          <Section title="About">
            <Card className="divide-y divide-hairline px-6 py-3">
              <Row icon={Info} label="App">
                <span className="text-sm font-black text-ink">
                  FuelWell — AI Nutrition Coach
                </span>
              </Row>
              <Row icon={Info} label="Version">
                <span className="text-sm font-black tabular-nums text-ink">
                  {appVersion}
                </span>
              </Row>
            </Card>
          </Section>
        </section>

        <Section id="delete-account" title="Danger zone">
          <Card className="border-red-100 ring-1 ring-inset ring-red-100">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
                  <Trash2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black text-red-700">Delete account</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                    Permanently removes your account, logs, preferences, and coach history.
                    Self-serve deletion and the support contact to request it arrive with the
                    public release.
                  </p>
                </div>
              </div>
              <Badge variant="error">Coming soon</Badge>
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white/10 px-3 py-3 ring-1 ring-inset ring-white/15 backdrop-blur md:px-4 md:py-4">
      <p className="truncate text-base font-black capitalize text-white md:text-lg">{value}</p>
      <p className="mt-1 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-white/65">
        {label}
      </p>
    </div>
  );
}

/**
 * Single source of truth for the selectable pills used by the allergy row and
 * every intake group — they had drifted into two near-identical class strings.
 */
function choiceChipClass(selected: boolean) {
  return cn(
    "fw-press min-h-11 rounded-full px-3.5 py-2 text-xs font-black ring-1 ring-inset md:min-h-9",
    selected
      ? "bg-primary-600 text-white shadow-e1 ring-primary-700"
      : "bg-surface text-ink-muted ring-hairline-strong hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200"
  );
}

function formatIntegrationShort(status: string) {
  if (status === "preview_sample") return "Preview";
  if (status === "connected") return "On";
  return "None";
}

function formatOptionLabel(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function PreferenceBlock({
  icon: Icon,
  title,
  children,
  divided = true,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  /** First block in a card sits flush; the rest get a hairline separator. */
  divided?: boolean;
}) {
  return (
    <div className={cn(divided && "border-t border-hairline pt-4")}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="text-sm font-black text-ink">{title}</span>
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
  icon: LucideIcon;
  label: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,22rem)] md:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black text-ink">{label}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
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
    <div className="rounded-[1.35rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary-700 ring-1 ring-inset ring-hairline">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="min-w-0 text-sm font-black text-ink">{group.label}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={choiceChipClass(value === option.value)}
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
    <fieldset
      aria-label={label}
      className="inline-flex rounded-full bg-surface-sunken p-1 ring-1 ring-inset ring-hairline"
    >
      {options.map(([optionValue, optionLabel]) => {
        const selected = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={cn(
              "fw-press min-h-11 rounded-full px-5 py-2 text-sm font-black md:min-h-9",
              selected
                ? "bg-surface text-ink shadow-e1 ring-1 ring-inset ring-hairline-strong"
                : "text-ink-muted hover:text-ink"
            )}
            aria-pressed={selected}
          >
            {optionLabel}
          </button>
        );
      })}
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
          "block text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle",
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
        className={cn(
          "w-full rounded-2xl border border-hairline-strong bg-surface px-4 py-3 text-sm font-bold text-ink outline-none transition-colors duration-200 ease-out-soft placeholder:text-ink-faint hover:border-primary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-200",
          !hideLabel && "mt-2"
        )}
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
          "block text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-hairline-strong bg-surface px-4 py-3 transition-colors duration-200 ease-out-soft hover:border-primary-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200",
          !hideLabel && "mt-2"
        )}
      >
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent text-sm font-bold tabular-nums text-ink outline-none"
        />
        {suffix && (
          <span className="shrink-0 text-xs font-black uppercase text-ink-subtle">{suffix}</span>
        )}
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
          "block text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-subtle",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-2xl border border-hairline-strong bg-surface px-4 py-3 text-sm font-bold text-ink outline-none transition-colors duration-200 ease-out-soft hover:border-primary-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-200",
          !hideLabel && "mt-2"
        )}
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
  icon: LucideIcon;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-black text-ink">{title}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">{detail}</p>
          </div>
        </div>
        <div className="shrink-0">{children}</div>
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
    <div id={id} className="min-w-0 scroll-mt-24">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="shrink-0 text-[0.6875rem] font-black uppercase tracking-[0.18em] text-ink-subtle">
          {title}
        </h2>
        <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-hairline" />
      </div>
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-4">
      <div className="flex shrink-0 items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="text-sm font-bold text-ink-muted">{label}</span>
      </div>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}
