"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { usePreferences, DIET_FILTERS } from "@/lib/use-preferences";
import { useUnits, type UnitSystem } from "./use-units";
import { CoachActivity } from "./coach-activity";
import {
  User,
  Mail,
  Ruler,
  Salad,
  ShieldAlert,
  Bell,
  Download,
  LogOut,
  Info,
} from "lucide-react";

interface SettingsClientProps {
  email: string;
  displayName: string;
  isPreview: boolean;
  appVersion: string;
}

export function SettingsClient({
  email,
  displayName,
  isPreview,
  appVersion,
}: SettingsClientProps) {
  const router = useRouter();
  const { units, setUnits } = useUnits();
  const { diets, allergies } = usePreferences();
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Settings
      </h1>

      {isPreview && (
        <Card className="border-primary-100 bg-primary-50/70">
          <p className="text-sm font-bold text-primary-900">
            Preview mode is using a sample account. Account details below are
            placeholder values, not a real signed-in user.
          </p>
        </Card>
      )}

      {/* Account */}
      <Section title="Account">
        <Card padding="sm" className="divide-y divide-neutral-100">
          <Row icon={User} label="Display name">
            <span className="text-sm font-medium text-neutral-900">
              {displayName || (
                <span className="text-neutral-400">Not set</span>
              )}
            </span>
          </Row>
          <Row icon={Mail} label="Email">
            <span className="block min-w-0 truncate text-sm font-medium text-neutral-900">
              {email || <span className="text-neutral-400">Not set</span>}
            </span>
          </Row>
        </Card>
        {isPreview && (
          <p className="mt-2 px-1 text-xs text-neutral-500">
            Sign in to manage your real account details.
          </p>
        )}
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Card padding="sm" className="space-y-4">
          <div className="px-1">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500">Units</span>
            </div>
            <div className="inline-flex rounded-xl bg-neutral-100 p-1">
              {(["metric", "imperial"] as UnitSystem[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnits(u)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize",
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

          <div className="border-t border-neutral-100 pt-3 px-1">
            <div className="flex items-center gap-2 mb-2">
              <Salad className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500">
                Dietary preferences
              </span>
            </div>
            {dietLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dietLabels.map((label) => (
                  <Badge key={label} variant="success">
                    {label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">
                No dietary filters selected. Choose some in Log or Recipes.
              </p>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-3 px-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500">Allergies</span>
            </div>
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allergies.map((a) => (
                  <Badge key={a} variant="warning">
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No allergies recorded.</p>
            )}
          </div>
        </Card>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Card padding="sm">
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="flex items-start gap-3">
              <Bell className="w-4 h-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Meal reminders &amp; coach nudges
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Push and email notifications are not available yet.
                </p>
              </div>
            </div>
            <Badge>Coming soon</Badge>
          </div>
        </Card>
      </Section>

      {/* Data export */}
      <Section title="Data">
        <Card padding="sm">
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="flex items-start gap-3">
              <Download className="w-4 h-4 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Export your data
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Download your logs and preferences as a file.
                </p>
              </div>
            </div>
            <Badge>Coming soon</Badge>
          </div>
          <div className="mt-3 ml-7">
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="opacity-50 cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Request export
            </Button>
            <p className="mt-2 text-xs text-neutral-500">
              Data export isn&apos;t available yet. We&apos;ll enable this in a
              future release.
            </p>
          </div>
        </Card>
      </Section>

      {/* Coach activity (E6 audit trail) */}
      <Section title="Coach activity">
        <CoachActivity />
      </Section>

      {/* Sign out */}
      <Section title="Session">
        <Button
          variant="danger"
          onClick={handleSignOut}
          loading={signingOut}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </Section>

      {/* About */}
      <Section title="About">
        <Card padding="sm" className="divide-y divide-neutral-100">
          <Row icon={Info} label="App">
            <span className="text-sm font-medium text-neutral-900">
              FuelWell — AI Nutrition Coach
            </span>
          </Row>
          <Row icon={Info} label="Version">
            <span className="text-sm font-medium text-neutral-900 tabular-nums">
              {appVersion}
            </span>
          </Row>
        </Card>
      </Section>
    </div>
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
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
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
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3 shrink-0">
        <Icon className="w-4 h-4 text-neutral-400" />
        <span className="text-sm text-neutral-500">{label}</span>
      </div>
      <div className="min-w-0 text-right">{children}</div>
    </div>
  );
}
