"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarDays,
  Check,
  ChefHat,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  Leaf,
  MapPin,
  MessageCircle,
  Ruler,
  Salad,
  Scale,
  ShoppingBasket,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Utensils,
  WheatOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  GOAL_AGGRESSIVENESS_OPTIONS,
  calculateAge,
  calculateMacroTargets,
  type ActivityLevel,
  type Gender,
  type Goal,
} from "@/lib/macros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";
import type { CoachKnowledgeBase } from "@/lib/coach/knowledge";
import {
  PREVIEW_IDENTITY_SCOPE,
  combineHeightParts,
  normalizeAllergies,
  normalizeDisplayName,
  normalizeGoalTimeline,
  onboardingDraftStorageKey,
  splitHeightInches,
  toggleAllergySelection,
  updateProfileAndVerify,
  type ProfileUpdateClient,
} from "@/lib/profile-preferences";

const LEGACY_STORAGE_KEY = "fuelwell:onboarding:v1";
const PREVIEW_KIND_STORAGE_KEY = "fuelwell:preview-user-kind";
const PREVIEW_COMPLETED_STORAGE_KEY = "fuelwell:new-user-onboarding:v1";

interface PersistedProgress {
  step: number;
  data: OnboardingData;
}

interface OnboardingData {
  displayName: string;
  dateOfBirth: string;
  gender: Gender | "";
  heightIn: number | "";
  weightLb: number | "";
  activityLevel: ActivityLevel | "";
  goal: Goal | "";
  goalTimeline: string;
  nutritionAggressiveness: string;
  dietFlexibility: string;
  dietaryPreference: string;
  foodsLove: string;
  foodsAvoid: string;
  groceryBudget: string;
  cookingHabits: string;
  allergies: string[];
  preferredWorkoutTypes: string[];
  workoutLocation: string;
  checkInPreference: string;
  coachStyle: string;
  mealsPerDay: number;
  experienceLevel: string;
}

const INITIAL_DATA: OnboardingData = {
  displayName: "",
  dateOfBirth: "",
  gender: "",
  heightIn: "",
  weightLb: "",
  activityLevel: "",
  goal: "",
  goalTimeline: "steady",
  nutritionAggressiveness: "steady_loss",
  dietFlexibility: "balanced",
  dietaryPreference: "none",
  foodsLove: "",
  foodsAvoid: "",
  groceryBudget: "moderate",
  cookingHabits: "mix",
  allergies: [],
  preferredWorkoutTypes: [],
  workoutLocation: "gym_home",
  checkInPreference: "event_driven",
  coachStyle: "direct_supportive",
  mealsPerDay: 3,
  experienceLevel: "beginner",
};

const ALLERGY_OPTIONS = [
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

const STEP_META = [
  { title: "Welcome", short: "Start", icon: Sparkles },
  { title: "Profile name", short: "Name", icon: UserRound },
  { title: "Birthday", short: "Age", icon: CalendarDays },
  { title: "Biology", short: "Sex", icon: HeartPulse },
  { title: "Body context", short: "Body", icon: Ruler },
  { title: "Activity", short: "Move", icon: Activity },
  { title: "Goal", short: "Goal", icon: Target },
  { title: "Goal pace", short: "Pace", icon: Clock3 },
  { title: "Nutrition style", short: "Style", icon: SlidersHorizontal },
  { title: "Food style", short: "Diet", icon: Leaf },
  { title: "Food habits", short: "Food", icon: ChefHat },
  { title: "Allergies", short: "Safety", icon: ShieldCheck },
  { title: "Workouts", short: "Train", icon: Dumbbell },
  { title: "Coach setup", short: "Coach", icon: MessageCircle },
  { title: "Plan preview", short: "Plan", icon: BadgeCheck },
] satisfies { title: string; short: string; icon: LucideIcon }[];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary", desc: "Mostly seated days", icon: UserRound },
  { value: "light", label: "Light", desc: "1-3 workouts weekly", icon: Leaf },
  { value: "moderate", label: "Moderate", desc: "3-5 workouts weekly", icon: Activity },
  { value: "active", label: "Active", desc: "Most days include training", icon: Dumbbell },
  { value: "very_active", label: "Very active", desc: "Hard training or active work", icon: Flame },
] satisfies { value: ActivityLevel; label: string; desc: string; icon: LucideIcon }[];

const GOAL_OPTIONS = [
  { value: "lose", label: "Lose weight", desc: "A steady calorie deficit", icon: Scale },
  { value: "maintain", label: "Maintain", desc: "Hold the current lane", icon: Target },
  { value: "gain", label: "Gain weight", desc: "A controlled surplus", icon: Activity },
] satisfies { value: Goal; label: string; desc: string; icon: LucideIcon }[];

const TIMELINE_OPTIONS = [
  { value: "patient", label: "Patient", desc: "Slow and low-pressure", icon: Leaf },
  { value: "steady", label: "Steady", desc: "Meaningful progress without over-correction", icon: Target },
  { value: "aggressive", label: "Aggressive", desc: "A tighter plan for a near-term target", icon: Flame },
];

const AGGRESSION_OPTIONS = GOAL_AGGRESSIVENESS_OPTIONS.map((option) => ({
  value: option.value,
  label: option.shortLabel,
  desc: option.description,
  icon:
    option.calorieAdjustmentPct < -0.15
      ? Flame
      : option.calorieAdjustmentPct < 0
        ? Leaf
        : option.calorieAdjustmentPct > 0.1
          ? Flame
          : option.calorieAdjustmentPct > 0
            ? Activity
            : Target,
}));

const FLEXIBILITY_OPTIONS = [
  { value: "structured", label: "Structured", desc: "Give me tighter food lanes", icon: ShieldCheck },
  { value: "balanced", label: "Balanced", desc: "Plan around real life", icon: SlidersHorizontal },
  { value: "flexible", label: "Flexible", desc: "Keep options open when eating out", icon: Sparkles },
];

const DIET_OPTIONS = [
  { value: "none", label: "No preference", icon: Utensils },
  { value: "vegetarian", label: "Vegetarian", icon: Leaf },
  { value: "vegan", label: "Vegan", icon: Leaf },
  { value: "pescatarian", label: "Pescatarian", icon: ChefHat },
  { value: "keto", label: "Keto", icon: Flame },
  { value: "paleo", label: "Paleo", icon: Dumbbell },
];

const GROCERY_BUDGET_OPTIONS = [
  { value: "budget", label: "Budget", desc: "Prioritize lower-cost staples", icon: ShoppingBasket },
  { value: "moderate", label: "Moderate", desc: "Balance cost and variety", icon: Salad },
  { value: "premium", label: "Premium", desc: "Quality and convenience matter most", icon: Sparkles },
];

const COOKING_OPTIONS = [
  { value: "simple", label: "Simple prep", desc: "Minimal cooking, repeatable meals", icon: Utensils },
  { value: "mix", label: "Mix of both", desc: "Cook some, eat out some", icon: ChefHat },
  { value: "cook_often", label: "Cook often", desc: "Recipes and groceries should lead", icon: Salad },
];

const WORKOUT_TYPE_OPTIONS = [
  { value: "strength", label: "Strength", icon: Dumbbell },
  { value: "cardio", label: "Cardio", icon: Activity },
  { value: "mobility", label: "Mobility", icon: HeartPulse },
  { value: "sports", label: "Sports", icon: Flame },
  { value: "classes", label: "Classes", icon: UserRound },
  { value: "trainer", label: "Trainer plan", icon: ShieldCheck },
];

const WORKOUT_LOCATION_OPTIONS = [
  { value: "gym", label: "Gym", desc: "Commercial gym equipment", icon: Dumbbell },
  { value: "home", label: "Home", desc: "Home setup or bodyweight", icon: UserRound },
  { value: "outdoors", label: "Outdoors", desc: "Walk, run, bike, sport", icon: MapPin },
  { value: "gym_home", label: "Gym + home", desc: "Flexible training locations", icon: Activity },
];

const CHECK_IN_OPTIONS = [
  { value: "event_driven", label: "Only when useful", desc: "Nudges after missed meals, overages, or workouts", icon: Sparkles },
  { value: "daily", label: "Daily", desc: "One daily review prompt", icon: CalendarDays },
  { value: "weekly", label: "Weekly", desc: "A weekly trend check-in", icon: Clock3 },
];

const COACH_STYLE_OPTIONS = [
  { value: "direct_supportive", label: "Direct + supportive", desc: "Clear next moves, no judgment", icon: Target },
  { value: "data_first", label: "Data first", desc: "Show the why behind recommendations", icon: BarChart3 },
  { value: "encouraging", label: "Encouraging", desc: "More reassurance and habit language", icon: HeartPulse },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const [isNewUserPreview, setIsNewUserPreview] = useState(false);
  const [draftStorageKey, setDraftStorageKey] = useState<string | null>(null);
  const hydrated = useRef(false);

  const totalSteps = STEP_META.length;
  const progress = ((step + 1) / totalSteps) * 100;
  const currentStep = STEP_META[step];
  const CurrentStepIcon = currentStep.icon;

  useEffect(() => {
    let cancelled = false;

    async function hydrateDraft() {
      try {
        const params = new URLSearchParams(window.location.search);
        const newUserPreview =
          params.get("preview") === "new-user" ||
          window.localStorage.getItem(PREVIEW_KIND_STORAGE_KEY) === "new-user";
        setIsNewUserPreview(newUserPreview);

        const scope = newUserPreview
          ? PREVIEW_IDENTITY_SCOPE
          : (await createClient().auth.getUser()).data.user?.id;
        if (!scope || cancelled) return;

        const storageKey = onboardingDraftStorageKey(scope);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        if (params.get("reset") === "1") {
          window.localStorage.removeItem(storageKey);
          if (newUserPreview) {
            window.localStorage.setItem(PREVIEW_KIND_STORAGE_KEY, "new-user");
            window.history.replaceState(null, "", "/app/onboarding?preview=new-user");
          }
          setDraftStorageKey(storageKey);
          return;
        }

        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as PersistedProgress;
          if (saved.data) {
            setData({
              ...INITIAL_DATA,
              ...saved.data,
              goalTimeline: normalizeGoalTimeline(saved.data.goalTimeline),
              allergies: normalizeAllergies(saved.data.allergies),
            });
          }
          if (typeof saved.step === "number") {
            setStep(Math.min(Math.max(saved.step, 0), totalSteps - 1));
          }
          setResumed(true);
        }
        setDraftStorageKey(storageKey);
      } catch {
        // Corrupt or blocked storage starts a clean, in-memory intake.
      } finally {
        hydrated.current = true;
      }
    }

    void hydrateDraft();
    return () => {
      cancelled = true;
    };
  }, [totalSteps]);

  // Persist progress so it survives a refresh or leaving the page.
  useEffect(() => {
    if (!hydrated.current || !draftStorageKey) return;
    try {
      const payload: PersistedProgress = { step, data };
      window.localStorage.setItem(draftStorageKey, JSON.stringify(payload));
    } catch {
      // Storage unavailable - progress simply won't persist this session.
    }
  }, [step, data, draftStorageKey]);

  const previewMacros = useMemo(() => getPreviewMacros(data), [data]);

  function clearProgress() {
    try {
      if (draftStorageKey) window.localStorage.removeItem(draftStorageKey);
    } catch {
      // ignore
    }
  }

  function handleSkip() {
    router.push("/app/dashboard");
  }

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAllergy(allergy: string) {
    setData((prev) => ({
      ...prev,
      allergies: toggleAllergySelection(prev.allergies, allergy),
    }));
  }

  function toggleWorkoutType(workoutType: string) {
    setData((prev) => ({
      ...prev,
      preferredWorkoutTypes: prev.preferredWorkoutTypes.includes(workoutType)
        ? prev.preferredWorkoutTypes.filter((item) => item !== workoutType)
        : [...prev.preferredWorkoutTypes, workoutType],
    }));
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
      case 1:
        return true;
      case 2:
        return !!data.dateOfBirth;
      case 3:
        return !!data.gender;
      case 4:
        return !!data.heightIn && !!data.weightLb && Number(data.heightIn) >= 36 && Number(data.weightLb) >= 60;
      case 5:
        return !!data.activityLevel;
      case 6:
        return !!data.goal;
      case 7:
        return !!data.goalTimeline;
      case 8:
        return !!data.nutritionAggressiveness && !!data.dietFlexibility;
      case 9:
      case 10:
      case 11:
        return true;
      case 12:
        return data.preferredWorkoutTypes.length > 0;
      case 13:
        return !!data.workoutLocation && !!data.checkInPreference && !!data.coachStyle;
      case 14:
        return !!previewMacros;
      default:
        return true;
    }
  }

  function proceedHint(): string | null {
    if (canProceed()) return null;
    switch (step) {
      case 2:
        return "Add your birthday to continue.";
      case 3:
        return "Choose an option to continue.";
      case 4:
        return "Enter your height (3 ft or more) and weight (60 lb or more) to continue.";
      case 5:
        return "Choose your activity level to continue.";
      case 6:
        return "Pick a goal to continue.";
      case 7:
        return "Pick a timeline to continue.";
      case 8:
        return "Answer both questions to continue.";
      case 12:
        return "Pick at least one workout type to continue.";
      case 13:
        return "Answer all three questions to continue.";
      default:
        return null;
    }
  }

  function next() {
    if (step < totalSteps - 1 && canProceed()) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function handleComplete() {
    if (!data.gender || !data.heightIn || !data.weightLb || !data.activityLevel || !data.goal || !data.dateOfBirth) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    const age = calculateAge(data.dateOfBirth);
    const heightCm = inchesToCm(Number(data.heightIn));
    const weightKg = poundsToKg(Number(data.weightLb));
    const macros = calculateMacroTargets({
      gender: data.gender as Gender,
      weightKg,
      heightCm,
      age,
      activityLevel: data.activityLevel as ActivityLevel,
      goal: data.goal as Goal,
      goalAggressiveness: data.nutritionAggressiveness,
    });
    const preferencesJson = buildOnboardingPreferences(data);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      if (isNewUserPreview || isBrowserPreviewRuntime()) {
        try {
          window.localStorage.setItem(
            PREVIEW_COMPLETED_STORAGE_KEY,
            JSON.stringify({
              completedAt: new Date().toISOString(),
              data,
              macros,
            })
          );
          window.localStorage.setItem(PREVIEW_KIND_STORAGE_KEY, "new-user");
        } catch {
          // Local-only preview completion can still continue without storage.
        }
        clearProgress();
        router.push("/app/dashboard?preview=new-user-complete");
        return;
      }
      setError("Not authenticated. Please log in again.");
      setSaving(false);
      return;
    }

    const profileValues = {
      display_name: normalizeDisplayName(data.displayName),
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      height_cm: heightCm,
      weight_kg: weightKg,
      activity_level: data.activityLevel,
      goal: data.goal,
      dietary_preference: data.dietaryPreference,
      allergies: normalizeAllergies(data.allergies),
      meals_per_day: data.mealsPerDay,
      experience_level: data.experienceLevel,
      calorie_target: macros.calories,
      protein_target: macros.protein,
      carbs_target: macros.carbs,
      fat_target: macros.fat,
      onboarding_complete: true,
      preferences_jsonb: preferencesJson,
    };

    try {
      await updateProfileAndVerify(
        supabase as unknown as ProfileUpdateClient,
        user.id,
        profileValues
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Profile save failed.");
      setSaving(false);
      return;
    }

    const { error: knowledgeError } = await supabase
      .from("coach_knowledge_bases")
      .upsert(
        {
          user_id: user.id,
          knowledge_jsonb: buildInitialOnboardingCoachKnowledge(user.id, data, heightCm, weightKg, macros),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (knowledgeError) {
      console.error("coach knowledge bootstrap failed", knowledgeError.message);
    }

    clearProgress();
    router.push("/app/dashboard");
    router.refresh();
  }

  const completionItems = [
    { label: "Basics", done: !!data.dateOfBirth && !!data.gender },
    { label: "Body metrics", done: !!data.heightIn && !!data.weightLb },
    { label: "Activity", done: !!data.activityLevel },
    { label: "Goal pace", done: !!data.goal && !!data.goalTimeline },
    { label: "Food rules", done: !!data.dietaryPreference },
    { label: "Training", done: data.preferredWorkoutTypes.length > 0 },
  ];

  return (
    <main className="fw-app-surface min-h-full">
      <div className="fw-page-inner flex min-h-full max-w-7xl flex-col gap-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <div className="hidden md:block">
              <Logo href="/app/dashboard" size="lg" />
            </div>
            <h1 className="fw-heading text-3xl md:hidden">Setup FuelWell</h1>
            <p className="mt-1 text-sm font-semibold text-[#78928a]">
              Daily decision setup
            </p>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full border border-primary-100 bg-white/80 px-4 py-2 text-sm font-bold text-[#6f8981] shadow-sm transition hover:border-primary-200 hover:text-[#16302a]"
          >
            Skip for now
          </button>
        </header>

        {isNewUserPreview && (
          <div className="rounded-[1.5rem] border border-primary-100 bg-white/80 px-4 py-3 text-sm font-bold text-[#6f8981] shadow-sm">
            New-user preview mode: complete the intake exactly like a first-time
            user. Answers stay in this browser only and never write to
            production accounts.
          </div>
        )}

        <section className="grid flex-1 gap-4 lg:grid-cols-[0.72fr_1fr] lg:gap-5">
          <aside className="fw-dark-panel order-2 flex flex-col justify-between rounded-[2rem] border p-6 lg:order-1 lg:p-8">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-100">
                <Sparkles className="h-4 w-4" />
                Setup that becomes your daily plan
              </div>

              <div>
                <h1 className="max-w-xl text-4xl font-black leading-[1.03] tracking-tight text-white md:text-5xl">
                  Build the nutrition system around your real day.
                </h1>
                <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-white/70">
                  FuelWell uses these basics to size your targets, shape meal
                  suggestions, and keep the coach honest.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {completionItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.07] p-3"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        item.done ? "bg-primary-300 text-primary-900" : "bg-white/10 text-white/45"
                      )}
                    >
                      {item.done ? <Check className="h-5 w-5" /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}
                    </span>
                    <span className={cn("text-sm font-black", item.done ? "text-white" : "text-white/55")}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <PlanPreview macros={previewMacros} data={data} />
          </aside>

          <section className="order-1 flex flex-col rounded-[2rem] border border-primary-100/80 bg-white/90 shadow-[0_26px_70px_rgba(22,48,42,0.12)] backdrop-blur lg:order-2">
            <div className="border-b border-primary-100/70 p-4 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="fw-icon-chip">
                    <CurrentStepIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-600">
                      Step {step + 1} of {totalSteps}
                    </p>
                    <h2 className="fw-heading text-2xl md:text-3xl">{currentStep.title}</h2>
                  </div>
                </div>
                <div className="rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700">
                  {Math.round(progress)}% ready
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf4f1] md:mt-5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-[#159aa2] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-4 hidden flex-wrap gap-2 md:flex">
                {STEP_META.map((meta, index) => (
                  <button
                    key={meta.short}
                    type="button"
                    onClick={() => setStep(index)}
                    className={cn(
                      "rounded-full px-2.5 py-2 text-[11px] font-black transition",
                      index === step
                        ? "bg-primary-600 text-white shadow-[0_12px_26px_rgba(21,145,108,0.22)]"
                        : index < step
                          ? "bg-primary-50 text-primary-700"
                          : "bg-[#f3f8f6] text-[#8da39c]"
                    )}
                  >
                    {meta.short}
                  </button>
                ))}
              </div>

              {resumed && (
                <p className="mt-4 rounded-2xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700">
                  Picked up where you left off. Your progress is saved on this device.
                </p>
              )}
            </div>

            <div className="flex-1 p-4 md:p-8">
              {step === 0 && <WelcomeStep />}
              {step === 1 && (
                <StepWrapper
                  title="What should your coach call you?"
                  subtitle="This is optional, but it makes the app feel more personal."
                >
                  <Input
                    type="text"
                    value={data.displayName}
                    onChange={(event) => update("displayName", event.target.value)}
                    placeholder="Maya"
                    autoFocus
                    className="h-14 text-base"
                  />
                  <InsightRow icon={UserRound} title="Coach tone" body="Your name only personalizes in-app guidance. You can change it later in Profile." />
                </StepWrapper>
              )}
              {step === 2 && (
                <StepWrapper
                  title="When were you born?"
                  subtitle="Age helps estimate your resting burn without asking you to do math."
                >
                  <Input
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(event) => update("dateOfBirth", event.target.value)}
                    autoFocus
                    className="h-14 text-base"
                  />
                  <InsightRow icon={CalendarDays} title="Why it matters" body="This feeds the same metabolism estimate used for your dashboard targets." />
                </StepWrapper>
              )}
              {step === 3 && (
                <StepWrapper
                  title="Which biology should targets use?"
                  subtitle="FuelWell uses this only for calorie math and keeps the plan adjustable."
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(["male", "female", "other"] as Gender[]).map((gender) => (
                      <OptionTile
                        key={gender}
                        selected={data.gender === gender}
                        onClick={() => update("gender", gender)}
                        icon={gender === "male" ? Activity : gender === "female" ? HeartPulse : Sparkles}
                        title={capitalize(gender)}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 4 && (
                <StepWrapper
                  title="Add body context"
                  subtitle="Height and weight set the baseline. Targets stay editable."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Height (ft)"
                        type="number"
                        min={3}
                        max={8}
                        value={splitHeightInches(data.heightIn).feet}
                        onChange={(event) =>
                          update(
                            "heightIn",
                            combineHeightParts(
                              event.target.value ? Number(event.target.value) : "",
                              splitHeightInches(data.heightIn).inches
                            )
                          )
                        }
                        placeholder="5"
                        className="h-14 text-base"
                      />
                      <Input
                        label="Height (in)"
                        type="number"
                        min={0}
                        max={11}
                        value={splitHeightInches(data.heightIn).inches}
                        onChange={(event) =>
                          update(
                            "heightIn",
                            combineHeightParts(
                              splitHeightInches(data.heightIn).feet,
                              event.target.value ? Number(event.target.value) : 0
                            )
                          )
                        }
                        placeholder="11"
                        className="h-14 text-base"
                      />
                    </div>
                    <Input
                      label="Weight (lb)"
                      type="number"
                      value={data.weightLb}
                      onChange={(event) => update("weightLb", event.target.value ? Number(event.target.value) : "")}
                      placeholder="180"
                      className="h-14 text-base"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MiniMetric
                      icon={Ruler}
                      label="Height"
                      value={
                        data.heightIn
                          ? `${splitHeightInches(data.heightIn).feet} ft ${splitHeightInches(data.heightIn).inches} in`
                          : "Needed"
                      }
                    />
                    <MiniMetric icon={Scale} label="Weight" value={data.weightLb ? `${data.weightLb} lb` : "Needed"} />
                  </div>
                </StepWrapper>
              )}
              {step === 5 && (
                <StepWrapper
                  title="How active is a normal week?"
                  subtitle="Choose the closest pattern. The coach can refine from logged behavior later."
                >
                  <div className="grid gap-3">
                    {ACTIVITY_OPTIONS.map((option) => (
                      <OptionTile
                        key={option.value}
                        selected={data.activityLevel === option.value}
                        onClick={() => update("activityLevel", option.value)}
                        icon={option.icon}
                        title={option.label}
                        description={option.desc}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 6 && (
                <StepWrapper
                  title="What is the main direction?"
                  subtitle="This changes the calorie target, not your ability to make flexible choices."
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    {GOAL_OPTIONS.map((option) => (
                      <OptionTile
                        key={option.value}
                        selected={data.goal === option.value}
                        onClick={() => update("goal", option.value)}
                        icon={option.icon}
                        title={option.label}
                        description={option.desc}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 7 && (
                <StepWrapper
                  title="How quickly would you like to reach it?"
                  subtitle="This sets the pace. The coach should always make clear that you can change it later."
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    {TIMELINE_OPTIONS.map((option) => (
                      <OptionTile
                        key={option.value}
                        selected={data.goalTimeline === option.value}
                        onClick={() => update("goalTimeline", option.value)}
                        icon={option.icon}
                        title={option.label}
                        description={option.desc}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 8 && (
                <StepWrapper
                  title="How should nutrition feel?"
                  subtitle="Pick both the deficit intensity and how much flexibility should be preserved."
                >
                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Goal aggressiveness
                      </p>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {AGGRESSION_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.nutritionAggressiveness === option.value}
                            onClick={() => update("nutritionAggressiveness", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Diet flexibility
                      </p>
                      <div className="grid gap-3 md:grid-cols-3">
                        {FLEXIBILITY_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.dietFlexibility === option.value}
                            onClick={() => update("dietFlexibility", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </StepWrapper>
              )}
              {step === 9 && (
                <StepWrapper
                  title="Any food style to respect?"
                  subtitle="This tunes recipes and coach suggestions without hiding manual logging."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {DIET_OPTIONS.map((option) => (
                      <OptionTile
                        key={option.value}
                        selected={data.dietaryPreference === option.value}
                        onClick={() => update("dietaryPreference", option.value)}
                        icon={option.icon}
                        title={option.label}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 10 && (
                <StepWrapper
                  title="What foods and habits should FuelWell remember?"
                  subtitle="These answers feed the coach and grocery/recipe suggestions without forcing strict meal plans."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Foods you love"
                      type="text"
                      value={data.foodsLove}
                      onChange={(event) => update("foodsLove", event.target.value)}
                      placeholder="Greek yogurt, steak, berries"
                      className="h-14 text-base"
                    />
                    <Input
                      label="Foods you avoid or dislike"
                      type="text"
                      value={data.foodsAvoid}
                      onChange={(event) => update("foodsAvoid", event.target.value)}
                      placeholder="Mushrooms, spicy food"
                      className="h-14 text-base"
                    />
                  </div>
                  <div className="grid gap-5 xl:grid-cols-2">
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Grocery budget habits
                      </p>
                      <div className="grid gap-3">
                        {GROCERY_BUDGET_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.groceryBudget === option.value}
                            onClick={() => update("groceryBudget", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Cooking habits
                      </p>
                      <div className="grid gap-3">
                        {COOKING_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.cookingHabits === option.value}
                            onClick={() => update("cookingHabits", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </StepWrapper>
              )}
              {step === 11 && (
                <StepWrapper
                  title="Any allergies to flag?"
                  subtitle="Select anything the coach should treat as a hard constraint."
                >
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    {ALLERGY_OPTIONS.map((allergy) => (
                      <OptionTile
                        key={allergy}
                        selected={allergy === "None" ? data.allergies.length === 0 : data.allergies.includes(allergy)}
                        onClick={() => toggleAllergy(allergy)}
                        icon={allergy === "None" ? Check : WheatOff}
                        title={allergy}
                        selectedClassName="border-accent-300 bg-accent-50 text-accent-700"
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 12 && (
                <StepWrapper
                  title="What types of workouts do you prefer?"
                  subtitle="Choose all that apply. This helps the coach recommend movement you will actually do."
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {WORKOUT_TYPE_OPTIONS.map((option) => (
                      <OptionTile
                        key={option.value}
                        selected={data.preferredWorkoutTypes.includes(option.value)}
                        onClick={() => toggleWorkoutType(option.value)}
                        icon={option.icon}
                        title={option.label}
                      />
                    ))}
                  </div>
                </StepWrapper>
              )}
              {step === 13 && (
                <StepWrapper
                  title="Where and how should the coach check in?"
                  subtitle="Workout location, check-in cadence, and coach style stay editable in Settings."
                >
                  <div className="space-y-5">
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Workout location
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {WORKOUT_LOCATION_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.workoutLocation === option.value}
                            onClick={() => update("workoutLocation", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Check-in preference
                      </p>
                      <div className="grid gap-3 md:grid-cols-3">
                        {CHECK_IN_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.checkInPreference === option.value}
                            onClick={() => update("checkInPreference", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#91a7a0]">
                        Coaching style
                      </p>
                      <div className="grid gap-3 md:grid-cols-3">
                        {COACH_STYLE_OPTIONS.map((option) => (
                          <OptionTile
                            key={option.value}
                            selected={data.coachStyle === option.value}
                            onClick={() => update("coachStyle", option.value)}
                            icon={option.icon}
                            title={option.label}
                            description={option.desc}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </StepWrapper>
              )}
              {step === 14 && (
                <StepWrapper
                  title="Review your starting plan"
                  subtitle="This is the first estimate. The dashboard and coach can tune it as real logs come in."
                >
                  {previewMacros ? (
                    <div className="space-y-5">
                      <div className="fw-mint-panel rounded-[1.75rem] border p-5">
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-700">
                          Starting calorie target
                        </p>
                        <div className="mt-3 flex items-end gap-3">
                          <p className="text-5xl font-black tabular-nums text-[#16302a]">
                            {previewMacros.calories}
                          </p>
                          <p className="pb-2 text-base font-black text-[#78928a]">kcal/day</p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <MacroTile color="protein" label="Protein" value={`${previewMacros.protein}g`} />
                        <MacroTile color="carbs" label="Carbs" value={`${previewMacros.carbs}g`} />
                        <MacroTile color="fat" label="Fat" value={`${previewMacros.fat}g`} />
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <SummaryPill label="Goal" value={data.goal ? `${data.goal} weight` : "Unset"} />
                        <SummaryPill label="Activity" value={data.activityLevel ? formatActivity(data.activityLevel) : "Unset"} />
                        <SummaryPill label="Style" value={formatOption(AGGRESSION_OPTIONS, data.nutritionAggressiveness)} />
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <SummaryPill label="Timeline" value={formatOption(TIMELINE_OPTIONS, data.goalTimeline)} />
                        <SummaryPill label="Flexibility" value={formatOption(FLEXIBILITY_OPTIONS, data.dietFlexibility)} />
                        <SummaryPill label="Diet" value={formatDiet(data.dietaryPreference)} />
                      </div>
                      {data.allergies.length > 0 && (
                        <div className="fw-soft-row p-4 text-sm font-bold text-[#516b63]">
                          Allergies flagged: {data.allergies.join(", ")}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-[1.25rem] bg-accent-50 px-4 py-3 text-sm font-bold text-accent-700">
                      Missing required info. Go back and complete the highlighted steps.
                    </p>
                  )}
                  {error && (
                    <p className="mt-4 rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                </StepWrapper>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-100/70 p-4 md:p-7">
              {step > 0 ? (
                <Button variant="ghost" onClick={back}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {proceedHint() && (
                <p
                  aria-live="polite"
                  className="order-last w-full text-center text-sm font-semibold text-[#78928a] md:order-none md:w-auto md:text-right"
                >
                  {proceedHint()}
                </p>
              )}

              {step < totalSteps - 1 ? (
                <Button onClick={next} disabled={!canProceed()} size="lg">
                  {step === 0 ? "Start setup" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} loading={saving} size="lg">
                  {isNewUserPreview ? "Complete preview setup" : "Complete setup"}
                </Button>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function WelcomeStep() {
  return (
    <div className="grid content-center gap-4 md:min-h-[24rem] md:gap-5">
      <div className="fw-mint-panel rounded-[1.75rem] border p-5 md:p-8">
        <div className="fw-icon-chip mb-4 md:mb-5">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="fw-heading max-w-2xl text-[1.75rem] leading-tight md:text-4xl">
          A few answers turn FuelWell into your daily decision system.
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#6f8981] md:mt-4 md:text-base md:leading-7">
          Setup takes a few minutes. You will leave with calorie and macro
          targets, food preferences, and enough context for the coach to make
          useful suggestions immediately.
        </p>
      </div>
      <div className="hidden gap-3 md:grid md:grid-cols-3">
        <MiniMetric icon={Target} label="Targets" value="Calories + macros" />
        <MiniMetric icon={ChefHat} label="Food" value="Diet + allergies" />
        <MiniMetric icon={Sparkles} label="Coach" value="Coach guidance" />
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      <div>
        <h3 className="fw-heading text-3xl md:text-4xl">{title}</h3>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#6f8981]">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

function OptionTile({
  selected,
  onClick,
  icon: Icon,
  title,
  description,
  selectedClassName,
}: {
  selected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description?: string;
  selectedClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex min-h-20 w-full items-center gap-4 rounded-[1.35rem] border p-4 text-left transition-all duration-150",
        selected
          ? selectedClassName || "border-primary-300 bg-primary-50 text-primary-800 shadow-[0_14px_28px_rgba(30,174,132,0.14)]"
          : "border-[#d8e7e1] bg-[#f7faf8] text-[#516b63] hover:border-primary-200 hover:bg-white"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] transition",
          selected ? "bg-white text-primary-700" : "bg-white text-[#9aaea7] group-hover:text-primary-600"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-black text-[#16302a]">{title}</span>
        {description && (
          <span className="mt-0.5 block text-sm font-semibold text-[#78928a]">
            {description}
          </span>
        )}
      </span>
      {selected && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}

function PlanPreview({
  macros,
  data,
}: {
  macros: ReturnType<typeof getPreviewMacros>;
  data: OnboardingData;
}) {
  return (
    <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
            Live preview
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            {macros ? `${macros.calories} kcal plan` : "Plan unlocks soon"}
          </h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-400 text-primary-950">
          {macros ? <BadgeCheck className="h-6 w-6" /> : <X className="h-6 w-6" />}
        </div>
      </div>

      {macros ? (
        <div className="mt-5 grid gap-2">
          <PreviewRow label="Protein" value={`${macros.protein}g`} color="bg-sky-300" />
          <PreviewRow label="Carbs" value={`${macros.carbs}g`} color="bg-lemon-200" />
          <PreviewRow label="Fat" value={`${macros.fat}g`} color="bg-accent-300" />
        </div>
      ) : (
        <p className="mt-4 text-sm font-semibold leading-6 text-white/62">
          Complete age, body context, activity, and goal to see the starting
          targets before saving.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <SummaryChip label={data.goal ? `${data.goal} goal` : "Goal pending"} />
        <SummaryChip label={data.activityLevel ? formatActivity(data.activityLevel) : "Activity pending"} />
        <SummaryChip label={formatOption(AGGRESSION_OPTIONS, data.nutritionAggressiveness)} />
        <SummaryChip label={formatOption(CHECK_IN_OPTIONS, data.checkInPreference)} />
      </div>
    </div>
  );
}

function PreviewRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <span className="text-sm font-bold text-white/75">{label}</span>
      </div>
      <span className="text-sm font-black tabular-nums text-white">{value}</span>
    </div>
  );
}

function SummaryChip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/70">
      {label}
    </span>
  );
}

function InsightRow({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="fw-soft-row flex gap-4 p-4">
      <div className="fw-icon-chip h-11 w-11 rounded-[1rem]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-black text-[#16302a]">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#78928a]">{body}</p>
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="fw-soft-row flex items-center gap-3 p-4">
      <div className="fw-icon-chip h-10 w-10 rounded-[0.95rem]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#91a7a0]">{label}</p>
        <p className="text-base font-black leading-tight text-[#16302a]">{value}</p>
      </div>
    </div>
  );
}

function MacroTile({ color, label, value }: { color: "protein" | "carbs" | "fat"; label: string; value: string }) {
  const styles = {
    protein: "bg-sky-50 text-sky-700 border-sky-100",
    carbs: "bg-lemon-50 text-lemon-700 border-lemon-100",
    fat: "bg-accent-50 text-accent-700 border-accent-100",
  };
  return (
    <div className={cn("rounded-[1.35rem] border p-4", styles[color])}>
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-black">{label}</p>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="fw-soft-row p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#91a7a0]">{label}</p>
      <p className="mt-1 text-base font-black capitalize text-[#16302a]">{value}</p>
    </div>
  );
}

function getPreviewMacros(data: OnboardingData) {
  if (!data.gender || !data.heightIn || !data.weightLb || !data.activityLevel || !data.goal || !data.dateOfBirth) {
    return null;
  }
  const age = calculateAge(data.dateOfBirth);
  return calculateMacroTargets({
    gender: data.gender as Gender,
    weightKg: poundsToKg(Number(data.weightLb)),
    heightCm: inchesToCm(Number(data.heightIn)),
    age,
    activityLevel: data.activityLevel as ActivityLevel,
    goal: data.goal as Goal,
    goalAggressiveness: data.nutritionAggressiveness,
  });
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function formatActivity(value: ActivityLevel) {
  return ACTIVITY_OPTIONS.find((option) => option.value === value)?.label ?? value.replace("_", " ");
}

function formatDiet(value: string) {
  return DIET_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function formatOption(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((option) => option.value === value)?.label ?? value.replace(/_/g, " ");
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function inchesToCm(inches: number) {
  return Math.round(inches * 2.54 * 10) / 10;
}

function poundsToKg(pounds: number) {
  return Math.round(pounds * 0.45359237 * 10) / 10;
}

function buildOnboardingPreferences(data: OnboardingData) {
  const diets = data.dietaryPreference === "none" ? [] : [data.dietaryPreference];
  return {
    units: "imperial",
    diets,
    allergies: normalizeAllergies(data.allergies),
    likes: parseCommaList(data.foodsLove),
    dislikes: parseCommaList(data.foodsAvoid),
    onboarding: {
      heightIn: data.heightIn,
      weightLb: data.weightLb,
      goalTimeline: normalizeGoalTimeline(data.goalTimeline),
      nutritionAggressiveness: data.nutritionAggressiveness,
      dietFlexibility: data.dietFlexibility,
      foodsLove: parseCommaList(data.foodsLove),
      foodsAvoid: parseCommaList(data.foodsAvoid),
      groceryBudget: data.groceryBudget,
      cookingHabits: data.cookingHabits,
      preferredWorkoutTypes: data.preferredWorkoutTypes,
      workoutLocation: data.workoutLocation,
      checkInPreference: data.checkInPreference,
      coachStyle: data.coachStyle,
    },
  };
}

function buildInitialOnboardingCoachKnowledge(
  userId: string,
  data: OnboardingData,
  heightCm: number,
  weightKg: number,
  macros: { calories: number; protein: number; carbs: number; fat: number }
): CoachKnowledgeBase {
  const likes = parseCommaList(data.foodsLove);
  const dislikes = parseCommaList(data.foodsAvoid);
  const workoutTypes = data.preferredWorkoutTypes.map((type) =>
    formatOption(WORKOUT_TYPE_OPTIONS, type)
  );

  return {
    userId,
    updatedAt: new Date().toISOString(),
    profileFacts: [
      data.displayName ? `User name is ${data.displayName}.` : "",
      data.goal ? `Primary goal is ${data.goal}.` : "",
      data.activityLevel ? `Activity level is ${data.activityLevel}.` : "",
      data.dietaryPreference ? `Dietary preference is ${data.dietaryPreference}.` : "",
      `Recorded weight is ${weightKg} kg.`,
      `Recorded height is ${heightCm} cm.`,
      "Preferred units are imperial.",
    ].filter(Boolean),
    nutritionFacts: [
      `Initial macro targets are ${macros.calories} kcal, ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat.`,
      `Preferred meal rhythm is ${data.mealsPerDay} meals per day.`,
      data.nutritionAggressiveness
        ? `Nutrition adjustment style is ${data.nutritionAggressiveness}.`
        : "",
      data.dietFlexibility ? `Diet flexibility preference is ${data.dietFlexibility}.` : "",
      data.groceryBudget ? `Grocery budget preference is ${data.groceryBudget}.` : "",
      data.cookingHabits ? `Cooking habit preference is ${data.cookingHabits}.` : "",
    ].filter(Boolean),
    workoutFacts: [
      data.experienceLevel ? `Training experience level is ${data.experienceLevel}.` : "",
      data.workoutLocation ? `Workout location preference is ${data.workoutLocation}.` : "",
      workoutTypes.length ? `Preferred workout types: ${workoutTypes.join(", ")}.` : "",
    ].filter(Boolean),
    preferenceFacts: [
      data.allergies.length ? `Allergies: ${data.allergies.join(", ")}.` : "No allergies recorded.",
      likes.length ? `Likes: ${likes.join(", ")}.` : "",
      dislikes.length ? `Dislikes: ${dislikes.join(", ")}.` : "",
      data.coachStyle ? `Coach style preference is ${data.coachStyle}.` : "",
      data.checkInPreference ? `Check-in preference is ${data.checkInPreference}.` : "",
    ].filter(Boolean),
    bodyFacts: [
      `Onboarding weight is ${weightKg} kg.`,
      `Onboarding height is ${heightCm} cm.`,
    ],
    progressFacts: ["Onboarding intake has been completed."],
    inferredPatterns: [
      "Initial coach knowledge comes from onboarding and should be refined from logged meals, workouts, body logs, and user corrections.",
    ],
  };
}

function isBrowserPreviewRuntime() {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname.includes("localhost") ||
    window.location.hostname.includes("127.0.0.1") ||
    window.location.hostname.includes("fuelwell-preview.vercel.app")
  );
}
