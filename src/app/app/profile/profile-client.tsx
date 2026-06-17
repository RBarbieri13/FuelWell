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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(displayName);
  const [savingName, setSavingName] = useState(false);

  async function handleSaveName() {
    if (isPreview) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: nameValue })
        .eq("id", user.id);
    }
    setSavingName(false);
    setEditingName(false);
    router.refresh();
  }

  async function handleSignOut() {
    if (isPreview) {
      router.push("/app/dashboard");
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-3xl md:text-4xl">Profile</h1>
            <p className="fw-muted mt-1 text-base">Account, body context, and daily macro targets</p>
          </div>
          <Link
            href="/app/settings"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)] transition hover:bg-primary-700"
          >
            Settings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="fw-page-inner space-y-6">
        {isPreview && (
          <Card className="border-primary-100 bg-primary-50/80">
            <p className="text-sm font-black text-primary-900">
              Preview mode is using a sample user. Edits are local-only for this demo.
            </p>
          </Card>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="fw-dark-panel px-8 py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-white/12 text-white shadow-inner shadow-white/10">
                <User className="h-11 w-11" />
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
                          setNameValue(displayName);
                        }}
                        aria-label="Cancel name edit"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex min-w-0 items-center gap-3">
                    <h2 className="truncate text-4xl font-black leading-tight text-white md:text-5xl">
                      {displayName || "Set your name"}
                    </h2>
                    <button
                      onClick={() => setEditingName(true)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
                      aria-label="Edit name"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p className="mt-3 truncate text-base font-semibold text-white/66">{email}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroStat label="Goal" value={formatGoal(goal)} />
              <HeroStat label="Activity" value={formatActivityShort(activityLevel)} />
              <HeroStat label="Setup" value={onboardingComplete ? "Complete" : "Needs setup"} />
            </div>
          </Card>

          <Card variant="elevated" className="space-y-5">
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
              <div className="grid grid-cols-2 gap-3">
                <TargetCard label="Calories" value={`${calorieTarget}`} unit="kcal" color="bg-primary-50 text-primary-700" />
                <TargetCard label="Protein" value={`${proteinTarget}`} unit="g" color="bg-sky-50 text-sky-700" />
                <TargetCard label="Carbs" value={`${carbsTarget}`} unit="g" color="bg-lemon-50 text-lemon-700" />
                <TargetCard label="Fat" value={`${fatTarget}`} unit="g" color="bg-accent-50 text-accent-700" />
              </div>
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60 p-5">
                <p className="font-black text-neutral-900">Targets are not finalized yet.</p>
                <p className="mt-1 text-sm font-semibold text-neutral-500">
                  Finish setup to calculate the targets FuelWell uses for every daily decision.
                </p>
              </div>
            )}

            <Link href="/app/onboarding">
              <Button variant="secondary" className="w-full">
                <Settings className="h-4 w-4" />
                Recalculate nutrition targets
              </Button>
            </Link>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
          <Card className="px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-black text-neutral-900">Body context</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">
                Profile inputs
              </span>
            </div>
            <div className="divide-y divide-primary-100/70">
              <InfoRow icon={Target} label="Goal" value={formatGoal(goal)} />
              <InfoRow icon={Activity} label="Activity" value={formatActivity(activityLevel)} />
              {weightKg && <InfoRow icon={Scale} label="Weight" value={`${weightKg} kg`} />}
              {heightCm && <InfoRow icon={Ruler} label="Height" value={`${heightCm} cm`} />}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="fw-icon-chip">
                <Settings className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-neutral-900">Account actions</h2>
                <p className="text-sm font-semibold text-neutral-500">Manage setup and session state.</p>
              </div>
            </div>

            {showSignOutConfirm ? (
              <div className="rounded-[1.35rem] border border-red-200 bg-red-50/70 p-4">
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
            ) : (
              <Button variant="danger" onClick={() => setShowSignOutConfirm(true)}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur">
      <p className="truncate text-lg font-black text-white">{value}</p>
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
