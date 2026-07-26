"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import {
  AlertTriangle,
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
  ShieldQuestion,
  UserCog,
  X,
  type LucideIcon,
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
            className="fw-press inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-surface px-5 py-3 text-sm font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-50 hover:ring-primary-200 md:self-auto"
          >
            Settings
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
        {isPreview && (
          <Card variant="tinted" padding="sm" className="flex gap-3 bg-primary-50/80">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-surface text-primary-700 ring-1 ring-inset ring-primary-100">
              <ShieldQuestion className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="min-w-0 text-sm font-bold leading-6 text-primary-900">
              Preview mode is using a sample user. Edits are local-only for this demo.
            </p>
          </Card>
        )}

        <section className="grid min-w-0 gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          {/* Deliberately not <Card>: fw-dark-panel owns its own background and
              shadow, and layering Card's bg-surface/shadow-e2 utilities on top
              meant two competing elevations on one element. */}
          <div className="fw-dark-panel min-w-0 rounded-[24px] border px-5 py-5 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/12 text-white ring-1 ring-inset ring-white/15 md:h-24 md:w-24 md:rounded-[2rem]">
                <User className="h-8 w-8 md:h-11 md:w-11" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.18em] text-primary-200">
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
                      className="fw-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 hover:bg-white/20 hover:text-white"
                      aria-label="Edit name"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
                {nameError && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-bold text-red-100">
                    {nameError}
                  </p>
                )}
                <p className="mt-2 truncate text-sm font-semibold text-white/70 md:mt-3 md:text-base">{email}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-8 md:gap-3">
              <HeroStat label="Goal" value={formatGoalShort(effectiveGoal)} />
              <HeroStat label="Activity" value={formatActivityShort(effectiveActivityLevel)} />
              <HeroStat
                label="Setup"
                value={onboardingComplete ? "Complete" : "Needs setup"}
                tone={onboardingComplete ? "default" : "attention"}
              />
            </div>
          </div>

          <Card variant="elevated" className="min-w-0 space-y-5">
            <SectionHeader
              icon={Target}
              title="Daily targets"
              description="Current plan values used across dashboard, coach, recipes, and logging."
            />

            {onboardingComplete ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <TargetCard
                    label="Calories"
                    value={effectiveCalorieTarget}
                    unit="kcal"
                    color="bg-primary-50 text-primary-700 ring-primary-100"
                  />
                  <TargetCard
                    label="Protein"
                    value={effectiveProteinTarget}
                    unit="g"
                    color="bg-sky-50 text-sky-700 ring-sky-100"
                  />
                  <TargetCard
                    label="Carbs"
                    value={effectiveCarbsTarget}
                    unit="g"
                    color="bg-lemon-50 text-lemon-700 ring-lemon-100"
                  />
                  <TargetCard
                    label="Fat"
                    value={effectiveFatTarget}
                    unit="g"
                    color="bg-accent-50 text-accent-700 ring-accent-100"
                  />
                </div>
                <MacroSplitBar
                  protein={effectiveProteinTarget}
                  carbs={effectiveCarbsTarget}
                  fat={effectiveFatTarget}
                />
              </div>
            ) : (
              <div className="rounded-[1.35rem] bg-surface-muted ring-1 ring-inset ring-hairline">
                <EmptyState
                  size="inline"
                  icon={Target}
                  title="Targets are not finalized yet."
                  description="Finish setup to calculate the targets FuelWell uses for every daily decision."
                  action={{ label: "Finish setup", href: "/app/onboarding" }}
                />
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
            <SectionHeader
              icon={Ruler}
              title="Body context"
              className="mb-4"
              action={
                <Link
                  href="/app/settings#health-profile"
                  className="fw-press inline-flex min-h-11 items-center gap-1 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100"
                >
                  Edit in Settings
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </Link>
              }
            />
            {/* Weight and height stay in the list when unrecorded. Dropping the
                rows silently shortened the panel and gave no clue that the two
                values feeding the targets were missing. */}
            <div className="divide-y divide-hairline overflow-hidden rounded-[1.35rem] bg-surface-muted ring-1 ring-inset ring-hairline">
              <InfoRow icon={Target} label="Goal" value={formatGoal(goal)} />
              <InfoRow icon={Activity} label="Activity" value={formatActivity(activityLevel)} />
              <InfoRow
                icon={Scale}
                label="Weight"
                value={
                  weightKg
                    ? units === "metric"
                      ? `${Math.round(weightKg)} kg`
                      : `${weightLb ?? Math.round(weightKg * 2.20462)} lb`
                    : "Not set"
                }
                numeric={!!weightKg}
                unset={!weightKg}
              />
              <InfoRow
                icon={Ruler}
                label="Height"
                value={
                  heightCm
                    ? units === "metric"
                      ? `${Math.round(heightCm)} cm`
                      : `${heightIn ?? Math.round(heightCm / 2.54)} in`
                    : "Not set"
                }
                numeric={!!heightCm}
                unset={!heightCm}
              />
            </div>
          </Card>

          <Card className="min-w-0 self-start">
            <SectionHeader
              as="h3"
              icon={UserCog}
              title="Account actions"
              description="Manage setup and session state."
              action={
                !showSignOutConfirm ? (
                  <Button variant="danger" size="sm" onClick={() => setShowSignOutConfirm(true)}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                ) : undefined
              }
            />

            {showSignOutConfirm && (
              <div
                role="group"
                aria-live="polite"
                aria-label="Confirm sign out"
                className="animate-in fade-in slide-in-from-top-1 mt-4 flex gap-3 rounded-[1.35rem] bg-red-50/70 p-4 ring-1 ring-inset ring-red-200 duration-200 ease-out-soft"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-red-600 ring-1 ring-inset ring-red-100">
                  <AlertTriangle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black leading-6 text-ink">
                    Are you sure you want to sign out?
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="danger" size="sm" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      Yes, sign out
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowSignOutConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

/**
 * `attention` is not decoration: it is the only place an unfinished setup is
 * visible on this page, so the tile has to read as a state, not a value.
 */
function HeroStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "attention";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] px-3 py-3 ring-1 ring-inset backdrop-blur md:px-4 md:py-4",
        tone === "attention"
          ? "bg-accent-400/15 ring-accent-300/45"
          : "bg-white/10 ring-white/15"
      )}
    >
      <p
        className={cn(
          "truncate text-base font-black md:text-lg",
          tone === "attention" ? "text-accent-200" : "text-white"
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-[0.6875rem] font-black uppercase tracking-[0.12em]",
          tone === "attention" ? "text-accent-100/80" : "text-white/65"
        )}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * Label reads first, figure second. The previous order buried the macro name
 * under the number and produced "kcal calories" as a single run-on caption.
 */
function TargetCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className={cn("rounded-[1.35rem] px-4 py-4 text-center ring-1 ring-inset", color)}>
      <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] opacity-75">
        {label}
      </p>
      <p className="mt-1.5 flex items-baseline justify-center gap-1">
        <span className="text-3xl font-black leading-none tabular-nums">{value}</span>
        <span className="text-xs font-black uppercase tracking-[0.08em] opacity-70">
          {unit}
        </span>
      </p>
    </div>
  );
}

/**
 * Share-of-calories split for the saved macro targets. Values are derived from
 * the targets themselves (4/4/9 kcal per gram) — there is no separate series.
 */
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
  const segments = [
    { label: "Protein", pct: pct(proteinKcal), bar: "bg-sky-500", dot: "bg-sky-500" },
    { label: "Carbs", pct: pct(carbsKcal), bar: "bg-lemon-500", dot: "bg-lemon-500" },
    { label: "Fat", pct: pct(fatKcal), bar: "bg-accent-500", dot: "bg-accent-500" },
  ];

  return (
    <div className="rounded-[1.35rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-ink-muted">
          Share of calories
        </p>
        <p className="text-[0.6875rem] font-bold tabular-nums text-ink-muted">
          {Math.round(total)} kcal from macros
        </p>
      </div>
      <div
        role="img"
        aria-label={`Calorie split: ${segments[0].pct}% protein, ${segments[1].pct}% carbs, ${segments[2].pct}% fat.`}
        className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-hairline"
      >
        <div className="flex h-full gap-0.5">
          {segments.map((segment) => (
            <span
              key={segment.label}
              className={cn(
                "min-w-0.5 transition-[width] duration-700 ease-out-soft",
                segment.bar
              )}
              style={{ width: `${segment.pct}%` }}
            />
          ))}
        </div>
        {/* Quarter rules give the eye a scale; a stacked bar with no ticks is
            impossible to read comparatively. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          {[25, 50, 75].map((tick) => (
            <span
              key={tick}
              className="absolute inset-y-0 w-px bg-surface/60"
              style={{ left: `${tick}%` }}
            />
          ))}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <span key={segment.label} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", segment.dot)} />
            <span className="text-xs font-bold text-ink-muted">
              {segment.label} <span className="tabular-nums text-ink">{segment.pct}%</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  numeric = false,
  unset = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  numeric?: boolean;
  /** Renders the value as a placeholder rather than a recorded figure. */
  unset?: boolean;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] ring-1 ring-inset",
            unset
              ? "bg-surface-sunken text-ink-muted ring-hairline"
              : "bg-surface text-primary-700 ring-hairline"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="truncate text-sm font-bold text-ink-muted">{label}</span>
      </div>
      <span
        className={cn(
          "max-w-[55%] truncate text-right text-sm font-black",
          numeric && "tabular-nums",
          // "Not set" is a real status the user has to be able to read, so it
          // steps down to ink-muted rather than the ink-faint watermark tone.
          unset ? "text-ink-muted" : "text-ink"
        )}
      >
        {value}
      </span>
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
