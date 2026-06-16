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
import { useGoalContextStore } from "@/lib/use-goal-context";
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
  Watch,
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
  const {
    integrationSummary,
    enablePreviewGarminSummary,
    disconnectIntegrationSummary,
  } = useGoalContextStore();
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
