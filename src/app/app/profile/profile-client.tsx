"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  LogOut,
  Settings,
  ChevronRight,
  Target,
  Activity,
  Scale,
  Ruler,
  Check,
  Pencil,
  X,
} from "lucide-react";
import Link from "next/link";
import { useUnits } from "@/components/settings/use-units";
import { clearPreferencesForUser } from "@/lib/use-preferences";
import {
  readPreviewOnboardingOverride,
  usePreviewOnboardingOverride,
  writePreviewOnboardingOverride,
} from "@/lib/preview-onboarding";
import {
  clearUserScopedIdentityCaches,
  normalizeDisplayName,
  updateProfileAndVerify,
  type ProfileUpdateClient,
} from "@/lib/profile-preferences";

interface ProfileClientProps {
  email: string;
  displayName: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  goal: string;
  activityLevel: string;
  weightKg: number | null;
  heightCm: number | null;
  onboardingComplete: boolean;
  isPreview?: boolean;
}

export function ProfileClient({
  email,
  displayName,
  calorieTarget,
  proteinTarget,
  carbsTarget,
  fatTarget,
  goal,
  activityLevel,
  weightKg,
  heightCm,
  onboardingComplete,
  isPreview = false,
}: ProfileClientProps) {
  const router = useRouter();
  const { units } = useUnits();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(displayName);
  const [currentDisplayName, setCurrentDisplayName] = useState(displayName);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // In preview mode the completed intake quiz is the source of truth, so the
  // quiz visibly takes effect here (name, goal, activity, targets).
  const previewOverride = usePreviewOnboardingOverride();
  const override = isPreview ? previewOverride : null;
  const effectiveDisplayName = override?.data?.displayName?.trim() || currentDisplayName;
  const effectiveGoal = override?.data?.goal || goal;
  const effectiveActivityLevel = override?.data?.activityLevel || activityLevel;
  const effectiveCalorieTarget = Number(override?.macros?.calories) || calorieTarget;
  const effectiveProteinTarget = Number(override?.macros?.protein) || proteinTarget;
  const effectiveCarbsTarget = Number(override?.macros?.carbs) || carbsTarget;
  const effectiveFatTarget = Number(override?.macros?.fat) || fatTarget;

  const weightLb = weightKg ? Math.round(weightKg * 2.20462) : null;
  const heightIn = heightCm ? Math.round(heightCm / 2.54) : null;

  async function handleSaveName() {
    const normalizedName = normalizeDisplayName(nameValue);
    if (isPreview) {
      const existing = readPreviewOnboardingOverride() ?? {};
      writePreviewOnboardingOverride({
        ...existing,
        data: { ...existing.data, displayName: normalizedName ?? "" },
      });
      setCurrentDisplayName(normalizedName ?? "");
      setNameValue(normalizedName ?? "");
      setNameError(null);
      setEditingName(false);
      return;
    }

    setSavingName(true);
    setNameError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setNameError("Your session expired. Please sign in again.");
      setSavingName(false);
      return;
    }
    try {
      await updateProfileAndVerify(
        supabase as unknown as ProfileUpdateClient,
        user.id,
        { display_name: normalizedName }
      );
      setCurrentDisplayName(normalizedName ?? "");
      setNameValue(normalizedName ?? "");
      setEditingName(false);
      router.refresh();
    } catch (saveError) {
      setNameError(saveError instanceof Error ? saveError.message : "Name save failed.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSignOut() {
    if (isPreview) {
      router.push("/app/dashboard");
      return;
    }

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

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-2xl md:text-4xl">Profile</h1>
            <p className="fw-muted mt-1 text-sm md:text-base">Account, body context, and daily macro targets</p>
          </div>
          <Link
            href="/app/settings"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-primary-100 bg-white px-5 py-3 text-sm font-black text-primary-700 transition hover:border-primary-200 hover:bg-primary-50 md:self-auto"
          >
            Settings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        {isPreview && (
          <Card className="border-primary-100 bg-primary-50/80">
            <p className="text-sm font-black text-primary-900">
              Preview mode is using a sample user. Edits are local-only for this demo.
            </p>
          </Card>
        )}

        <section className="grid min-w-0 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="fw-dark-panel min-w-0 px-5 py-5 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/12 md:h-24 md:w-24 md:rounded-[2rem] text-white shadow-inner shadow-white/10">
                <User className="h-8 w-8 md:h-11 md:w-11" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-primary-200">
                  Account profile
                </p>
                {editingName ? (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder="Your name"
                      className="!text-base"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveName} loading={savingName} aria-label="Save name">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingName(false);
                          setNameValue(effectiveDisplayName);
                          setNameError(null);
                        }}
                        aria-label="Cancel name edit"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex min-w-0 items-center gap-3 md:mt-3">
                    <h2 className="truncate text-2xl font-black leading-tight text-white md:text-3xl lg:text-4xl">
                      {effectiveDisplayName || "Set your name"}
                    </h2>
                    <button
                      onClick={() => {
                        setNameValue(effectiveDisplayName);
                        setEditingName(true);
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
                      aria-label="Edit name"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {nameError && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-100">
                    {nameError}
                  </p>
                )}
                <p className="mt-2 truncate text-sm font-semibold text-white/66 md:mt-3 md:text-base">{email}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-8 md:gap-3">
              <HeroStat label="Goal" value={formatGoalShort(effectiveGoal)} />
              <HeroStat label="Activity" value={formatActivityShort(effectiveActivityLevel)} />
              <HeroStat label="Setup" value={onboardingComplete ? "Complete" : "Needs setup"} />
            </div>
          </Card>

          <Card variant="elevated" className="min-w-0 space-y-5">
            <div className="flex items-start gap-4">
              <span className="fw-icon-chip">
                <Target className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Daily targets</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-500">
                  Current plan values used across dashboard, coach, recipes, and logging.
                </p>
              </div>
            </div>

            {onboardingComplete ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <TargetCard label="Calories" value={`${effectiveCalorieTarget}`} unit="kcal" color="bg-primary-50 text-primary-700" />
                  <TargetCard label="Protein" value={`${effectiveProteinTarget}`} unit="g" color="bg-sky-50 text-sky-700" />
                  <TargetCard label="Carbs" value={`${effectiveCarbsTarget}`} unit="g" color="bg-lemon-50 text-lemon-700" />
                  <TargetCard label="Fat" value={`${effectiveFatTarget}`} unit="g" color="bg-accent-50 text-accent-700" />
                </div>
                <MacroSplitBar
                  protein={effectiveProteinTarget}
                  carbs={effectiveCarbsTarget}
                  fat={effectiveFatTarget}
                />
              </div>
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60 p-5">
                <p className="font-black text-neutral-900">Targets are not finalized yet.</p>
                <p className="mt-1 text-sm font-semibold text-neutral-500">
                  Finish setup to calculate the targets FuelWell uses for every daily decision.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Link href="/app/settings#health-profile" className="block">
                <Button variant="secondary" className="w-full">
                  <Pencil className="h-4 w-4" />
                  Edit targets in Settings
                </Button>
              </Link>
              <Link href="/app/onboarding" className="block">
                <Button variant="ghost" className="w-full">
                  <Settings className="h-4 w-4" />
                  Retake the setup quiz
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        <section className="grid min-w-0 gap-4 xl:grid-cols-[1fr_0.85fr]">
          <Card className="min-w-0 px-5 py-6 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black text-neutral-900">Body context</h2>
              <Link
                href="/app/settings#health-profile"
                className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700 transition hover:bg-primary-100"
              >
                Edit in Settings
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-primary-100/70">
              <InfoRow icon={Target} label="Goal" value={formatGoal(goal)} />
              <InfoRow icon={Activity} label="Activity" value={formatActivity(activityLevel)} />
              {weightKg && (
                <InfoRow
                  icon={Scale}
                  label="Weight"
                  value={
                    units === "metric"
                      ? `${Math.round(weightKg)} kg`
                      : `${weightLb ?? Math.round(weightKg * 2.20462)} lb`
                  }
                />
              )}
              {heightCm && (
                <InfoRow
                  icon={Ruler}
                  label="Height"
                  value={
                    units === "metric"
                      ? `${Math.round(heightCm)} cm`
                      : `${heightIn ?? Math.round(heightCm / 2.54)} in`
                  }
                />
              )}
            </div>
          </Card>

          <Card className="min-w-0 self-start">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-neutral-900">Account actions</h2>
                <p className="mt-1 text-sm font-semibold text-neutral-500">Manage setup and session state.</p>
              </div>
              {!showSignOutConfirm && (
                <Button variant="danger" onClick={() => setShowSignOutConfirm(true)}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              )}
            </div>

            {showSignOutConfirm && (
              <div className="mt-4 rounded-[1.35rem] border border-red-200 bg-red-50/70 p-4">
                <p className="text-sm font-black text-neutral-900">
                  Are you sure you want to sign out?
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button variant="danger" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-3.5 w-3.5" />
                    Yes, sign out
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowSignOutConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/12 bg-white/10 px-3 py-3 backdrop-blur md:px-4 md:py-4">
      <p className="truncate text-base font-black text-white md:text-lg">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-white/58">{label}</p>
    </div>
  );
}

function TargetCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <Card padding="sm" className={color}>
      <div className="px-3 py-2 text-center">
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs font-medium opacity-70">
          {unit} {label.toLowerCase()}
        </p>
      </div>
    </Card>
  );
}

function MacroSplitBar({
  protein,
  carbs,
  fat,
}: {
  protein: number;
  carbs: number;
  fat: number;
}) {
  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const total = proteinKcal + carbsKcal + fatKcal;
  if (total <= 0) return null;
  const pct = (kcal: number) => Math.round((kcal / total) * 100);
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full">
        <div className="bg-sky-500" style={{ width: `${pct(proteinKcal)}%` }} />
        <div className="bg-lemon-500" style={{ width: `${pct(carbsKcal)}%` }} />
        <div className="bg-accent-500" style={{ width: `${pct(fatKcal)}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-neutral-500">
        {pct(proteinKcal)}% protein · {pct(carbsKcal)}% carbs · {pct(fatKcal)}% fat of calories
      </p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-neutral-400" />
        <span className="text-sm text-neutral-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function formatGoal(goal: string): string {
  const map: Record<string, string> = {
    lose: "Lose weight",
    maintain: "Maintain weight",
    gain: "Gain weight",
  };
  return map[goal] || goal;
}

function formatGoalShort(goal: string): string {
  const map: Record<string, string> = {
    lose: "Lose fat",
    maintain: "Maintain",
    gain: "Gain muscle",
  };
  return map[goal] || goal;
}

function formatActivity(level: string): string {
  const map: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Lightly active",
    moderate: "Moderately active",
    active: "Active",
    very_active: "Very active",
  };
  return map[level] || level;
}

function formatActivityShort(level: string): string {
  const map: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Active",
    very_active: "Very active",
  };
  return map[level] || level;
}
