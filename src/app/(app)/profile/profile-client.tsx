"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
}: ProfileClientProps) {
  const router = useRouter();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(displayName);
  const [savingName, setSavingName] = useState(false);

  async function handleSaveName() {
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Profile
      </h1>

      {/* User info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Your name"
                  className="!py-1.5 !text-base"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName} loading={savingName}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingName(false);
                    setNameValue(displayName);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-neutral-900 truncate">
                  {displayName || "Set your name"}
                </p>
                <button
                  onClick={() => setEditingName(true)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label="Edit name"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-neutral-500 truncate">{email}</p>
          </div>
        </div>
      </Card>

      {/* Current targets */}
      {onboardingComplete && (
        <div>
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            Daily Targets
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <TargetCard
              label="Calories"
              value={`${calorieTarget}`}
              unit="kcal"
              color="bg-primary-50 text-primary-700"
            />
            <TargetCard
              label="Protein"
              value={`${proteinTarget}`}
              unit="g"
              color="bg-blue-50 text-blue-700"
            />
            <TargetCard
              label="Carbs"
              value={`${carbsTarget}`}
              unit="g"
              color="bg-amber-50 text-amber-700"
            />
            <TargetCard
              label="Fat"
              value={`${fatTarget}`}
              unit="g"
              color="bg-red-50 text-red-700"
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Your Info
        </h2>
        <Card padding="sm" className="divide-y divide-neutral-100">
          <InfoRow icon={Target} label="Goal" value={formatGoal(goal)} />
          <InfoRow icon={Activity} label="Activity" value={formatActivity(activityLevel)} />
          {weightKg && <InfoRow icon={Scale} label="Weight" value={`${weightKg} kg`} />}
          {heightCm && <InfoRow icon={Ruler} label="Height" value={`${heightCm} cm`} />}
        </Card>
      </div>

      {/* Settings links */}
      <div>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Settings
        </h2>
        <Card padding="sm" className="divide-y divide-neutral-100">
          <Link
            href="/app/onboarding"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700">
                Recalculate nutrition targets
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
          </Link>
        </Card>
      </div>

      {/* Sign out */}
      {showSignOutConfirm ? (
        <Card className="border-red-200 bg-red-50/50">
          <p className="text-sm font-medium text-neutral-900 mb-3">
            Are you sure you want to sign out?
          </p>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={handleSignOut}>
              <LogOut className="w-3.5 h-3.5" />
              Yes, sign out
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSignOutConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="danger" onClick={() => setShowSignOutConfirm(true)}>
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      )}
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
