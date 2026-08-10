"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  HeartPulse,
  Info,
  Plus,
  Salad,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { MacroBar } from "@/components/dashboard/macro-bar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { MacroTargets, MacroTotals, MealRecord } from "@/lib/fuelwell-data";
import { usePreviewOnboardingOverride } from "@/lib/preview-onboarding";
import {
  buildCoachVerdict,
  buildScoreContributors,
  calculateHealthScore,
  formatMealType,
  percentOf,
  remaining,
  sumMealItems,
  sumMeals,
} from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";

/** One glyph plate treatment for every icon that sits alone on this surface. */
const ICON_PLATE =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100 transition-colors";

function getTimeGreeting(now: Date) {
  const hour = now.getHours();
  const weekday = now.toLocaleDateString(undefined, { weekday: "long" });
  if (hour < 5) return { salutation: "Good evening", tagline: `${weekday} · time to wind down` };
  if (hour < 12) return { salutation: "Good morning", tagline: `${weekday} · fuel up for the day` };
  if (hour < 17) return { salutation: "Good afternoon", tagline: `${weekday} · keep the momentum` };
  return { salutation: "Good evening", tagline: `${weekday} · time to wind down` };
}

interface DashboardClientProps {
  displayName: string;
  targets: MacroTargets;
  fallbackTotals: MacroTotals;
  meals: MealRecord[];
  onboardingComplete: boolean;
  goal: string;
  dietaryPreference: string;
  allergies: string[];
}

export function DashboardClient({
  displayName,
  targets,
  fallbackTotals,
  meals,
  onboardingComplete,
  goal,
  dietaryPreference,
  allergies,
}: DashboardClientProps) {
  const previewOverride = usePreviewOnboardingOverride();
  const [setupCompleteBanner, setSetupCompleteBanner] = useState(false);

  useEffect(() => {
    // Both the URL check and the cleanup live inside the frame callback so a
    // StrictMode double-invoke (which cancels the first frame) still sees the
    // completion param on the second run.
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("setup") !== "complete" && params.get("preview") !== "new-user-complete") {
        return;
      }
      setSetupCompleteBanner(true);
      params.delete("setup");
      params.delete("preview");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : "")
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const effectiveDisplayName =
    previewOverride?.data?.displayName?.trim() || displayName;
  const effectiveTargets: MacroTargets = {
    calories: Number(previewOverride?.macros?.calories) || targets.calories,
    protein: Number(previewOverride?.macros?.protein) || targets.protein,
    carbs: Number(previewOverride?.macros?.carbs) || targets.carbs,
    fat: Number(previewOverride?.macros?.fat) || targets.fat,
  };
  const effectiveGoal = previewOverride?.data?.goal || goal;
  const effectiveDietaryPreference =
    previewOverride?.data?.dietaryPreference || dietaryPreference;
  const effectiveAllergies = previewOverride?.data?.allergies ?? allergies;
  const effectiveOnboardingComplete = onboardingComplete || Boolean(previewOverride);

  // Live client store wins for today's view: meals logged from Log or Coach
  // chat update these totals immediately (D-gate). Server meals are the
  // fallback for first paint / signed-in history.
  const { meals: liveMeals } = useDayLog();
  const todaysMeals = liveMeals.length > 0 ? liveMeals : meals;
  const totals = sumMeals(todaysMeals, fallbackTotals);
  const hasLoggedToday = totals.calories > 0;
  const contributors = buildScoreContributors(totals, effectiveTargets, todaysMeals.length);
  const healthScore = calculateHealthScore(contributors);
  const coachVerdict = buildCoachVerdict(totals, effectiveTargets, todaysMeals.length);
  const { salutation, tagline } = getTimeGreeting(new Date());
  const caloriePercent = percentOf(totals.calories, effectiveTargets.calories);

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-3 py-4 md:gap-4 md:py-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="fw-heading text-2xl md:text-[1.7rem]" suppressHydrationWarning>
              {salutation}, {effectiveDisplayName}
            </h1>
            <p className="fw-muted mt-1 text-sm" suppressHydrationWarning>
              {tagline}
            </p>
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
      {setupCompleteBanner && (
        <Card
          padding="sm"
          className="border-primary-200 bg-primary-50/80 shadow-e1"
          role="status"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-glow"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="min-w-0 text-sm font-black text-ink">
                Setup complete — your plan and targets are live.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSetupCompleteBanner(false)}
              className="shrink-0 text-primary-700"
            >
              Done
            </Button>
          </div>
        </Card>
      )}
      {!effectiveOnboardingComplete && (
        <Link
          href="/app/onboarding"
          className="group block rounded-[24px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          <Card
            variant="elevated"
            className="fw-press border-primary-200 bg-gradient-to-r from-primary-50/90 to-surface group-hover:-translate-y-0.5 group-hover:border-primary-300 group-hover:shadow-e4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow"
                >
                  <Sparkles className="h-6 w-6" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black text-ink">
                    Take the 3-minute setup quiz
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-muted">
                    Targets, coach context, and meal suggestions all start here.
                  </p>
                </div>
              </div>
              <span className="hidden shrink-0 items-center gap-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-black text-white shadow-e1 transition group-hover:bg-primary-700 sm:inline-flex">
                Start
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-primary-600 sm:hidden"
                strokeWidth={2}
              />
            </div>
          </Card>
        </Link>
      )}

      <section className="grid gap-4 md:gap-5 lg:grid-cols-[1.32fr_1fr]">
        <Card
          variant="elevated"
          className="fw-dark-panel overflow-hidden p-0 shadow-e4"
        >
          <div className="relative p-5 md:p-[30px]">
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary-200">
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                    Today&apos;s decision
                  </p>
                  <h2 className="mt-3 max-w-[24rem] text-[1.6rem] font-black leading-[1.15] md:leading-[1.08] tracking-normal text-white md:text-[2.45rem]">
                    {hasLoggedToday ? coachVerdict.title : `Hey, ${effectiveDisplayName}. Start with one real input.`}
                  </h2>
                </div>
                {hasLoggedToday && (
                  <div className="flex w-full flex-wrap gap-3 lg:w-auto lg:flex-nowrap">
                    <EnergyStat
                      label="Calories left"
                      value={remaining(totals.calories, effectiveTargets.calories).toLocaleString()}
                      href="/app/nutrition"
                    />
                    <EnergyStat
                      label="Protein left"
                      value={`${remaining(totals.protein, effectiveTargets.protein)}g`}
                      href="/app/nutrition"
                    />
                  </div>
                )}
              </div>

              <p className="max-w-[26rem] text-sm font-semibold leading-6 text-white/80">
                {hasLoggedToday
                  ? coachVerdict.body
                  : "No meals, workouts, or recovery inputs are logged yet. FuelWell will show the missing pieces instead of inventing green progress."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={coachVerdict.href}
                  className="fw-press inline-flex min-h-11 select-none items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-primary-500 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 active:from-primary-700 active:to-primary-800 active:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  {coachVerdict.action}
                </Link>
                <Link
                  href="/app/dashboard/score"
                  className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
                >
                  <span className="text-white/85">Health score</span>
                  <span className="tabular-nums text-primary-200">
                    {healthScore !== null ? `${healthScore}/100` : "--"}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/70" strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <SectionHeader
            as="h3"
            title={"Today's plate"}
            description={`Calculated from ${todaysMeals.length} logged ${
              todaysMeals.length === 1 ? "meal" : "meals"
            } only.`}
            action={
              <Badge variant={caloriePercent > 100 ? "warning" : "default"} className="tabular-nums">
                {caloriePercent}% of calories eaten
              </Badge>
            }
          />

          <div className="my-2 flex justify-center">
            <MealMakeupHover meals={todaysMeals}>
              <CalorieRing consumed={totals.calories} target={effectiveTargets.calories} emphasis="compact" />
            </MealMakeupHover>
          </div>

          <div className="mt-auto space-y-4 rounded-[1.25rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
            <MacroBar label="Protein" current={totals.protein} target={effectiveTargets.protein} color="var(--color-macro-protein)" />
            <MacroBar label="Carbs" current={totals.carbs} target={effectiveTargets.carbs} color="var(--color-macro-carbs)" />
            <MacroBar label="Fat" current={totals.fat} target={effectiveTargets.fat} color="var(--color-macro-fat)" />
          </div>
          <Link
            href="/app/nutrition"
            className="fw-press mt-4 inline-flex min-h-11 w-full select-none items-center justify-center gap-2 rounded-[1.15rem] border border-primary-100 bg-surface/92 px-4 py-3 text-sm font-bold text-primary-800 shadow-e1 hover:border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            Open meal breakdown
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </Card>
      </section>

      <section>
        <SectionHeader as="h3" title="Quick actions" className="mb-3" />
        <QuickActions />
      </section>

      <section className="grid gap-4 md:gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeader as="h3" title={"Today's focus"} />
          <div className="grid gap-3">
            {contributors.map((contributor) => (
              <Link
                href={contributor.href}
                key={contributor.key}
                className="fw-press group fw-soft-row block p-4 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-surface hover:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className={cn(ICON_PLATE, "group-hover:bg-primary-100")}>
                      {contributor.key === "nutrition" && <Salad className="h-5 w-5" strokeWidth={2} />}
                      {contributor.key === "activity" && <Activity className="h-5 w-5" strokeWidth={2} />}
                      {contributor.key === "recovery" && <HeartPulse className="h-5 w-5" strokeWidth={2} />}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{contributor.label}</p>
                      <p className="text-sm font-medium text-ink-muted">{contributor.status}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {contributor.score !== null ? (
                      <span className="text-lg font-black tabular-nums text-ink">
                        {contributor.score}
                      </span>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        No inputs
                      </Badge>
                    )}
                    <ChevronRight
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader
            as="h3"
            title="Logged today"
            description="Tap Nutrition for full macro detail by meal."
            icon={UtensilsCrossed}
          />

          {todaysMeals.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-primary-200 bg-primary-50/50">
              <EmptyState
                size="inline"
                icon={UtensilsCrossed}
                title="No meals logged yet."
                description="Add your first meal to unlock today's nutrition detail and plate."
                secondaryAction={{ label: "Log a meal", href: "/app/log" }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {todaysMeals.slice(0, 4).map((meal) => {
                const mealTotals = sumMealItems(meal.items);
                return (
                  <Link
                    href="/app/nutrition"
                    key={meal.id}
                    className="fw-press flex min-h-[3.75rem] items-center justify-between gap-3 rounded-[1.25rem] bg-surface-muted p-4 ring-1 ring-inset ring-hairline hover:bg-primary-50/80 hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-ink">
                        {formatMealType(meal.mealType)}
                      </p>
                      <p className="truncate text-sm text-ink-muted">{meal.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black tabular-nums text-ink">
                        {mealTotals.calories.toLocaleString()} kcal
                      </p>
                      <p className="text-xs font-bold tabular-nums text-ink-muted">
                        {mealTotals.protein}g protein
                      </p>
                    </div>
                  </Link>
                );
              })}
              {!todaysMeals.some((meal) => meal.mealType === "dinner") && (
                <Link
                  href="/app/log"
                  className="fw-press group flex min-h-[3.75rem] items-center justify-between gap-3 rounded-[1.25rem] border border-dashed border-primary-200 bg-primary-50/50 p-4 hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-ink">Dinner</p>
                    <p className="text-sm text-ink-muted">Not logged yet</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-primary-200 transition-colors group-hover:bg-primary-50">
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Log dinner
                  </span>
                </Link>
              )}
            </div>
          )}
        </Card>
      </section>

      <Card className="space-y-4">
        <SectionHeader as="h3" title="Go deeper" />
        <div className="grid gap-3 sm:grid-cols-2">
          <DeepLinkRow
            href="/app/daily-review"
            icon={<ClipboardList className="h-5 w-5" strokeWidth={2} />}
            title="Review the full day"
            body="Nutrition, activity, and energy in one ledger."
          />
          <DeepLinkRow
            href="/app/workouts"
            icon={<Dumbbell className="h-5 w-5" strokeWidth={2} />}
            title="Plan movement"
            body="Match a workout to today's energy."
          />
          <DeepLinkRow
            href="/app/recipes"
            icon={<BookOpen className="h-5 w-5" strokeWidth={2} />}
            title="Find food that fits"
            body="Choose dinner from remaining macros."
          />
          <DeepLinkRow
            href="/app/progress"
            icon={<Activity className="h-5 w-5" strokeWidth={2} />}
            title="Check trajectory"
            body="What today changes for the week."
          />
        </div>
      </Card>

      <p className="text-xs font-semibold leading-5 text-ink-muted">
        Profile context: goal {effectiveGoal}, diet {effectiveDietaryPreference}
        {effectiveAllergies.length > 0 ? `, allergies ${effectiveAllergies.join(", ")}` : ""}.
      </p>
      </div>
    </div>
  );
}

function MealMakeupHover({
  meals,
  children,
}: {
  meals: MealRecord[];
  children: ReactNode;
}) {
  const mealTypes = ["breakfast", "lunch", "dinner"] as const;
  const [open, setOpen] = useState(false);
  const panelId = `${useId().replace(/[^a-zA-Z0-9]/g, "")}-meal-makeup`;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Visibility is driven only by `open` — a hover-only reveal would show
          the panel to pointer users while aria-expanded still said collapsed. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Show meal makeup breakdown"
        className="fw-press rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        {children}
      </button>
      <p className="mt-1 text-[11px] font-bold text-ink-subtle">
        Tap the ring for meal makeup
      </p>
      <div
        id={panelId}
        aria-hidden={!open}
        className={cn(
          "absolute left-1/2 top-[calc(100%+0.5rem)] z-20 w-[min(24rem,calc(100vw-3rem))] -translate-x-1/2 rounded-[1.35rem] border border-hairline-strong bg-surface p-4 text-left shadow-e4 transition duration-150 ease-out-soft",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
          >
            <Info className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-ink">Meal makeup</p>
            <p className="text-xs font-semibold text-ink-muted">Breakfast, lunch, and dinner counted today</p>
          </div>
        </div>

        <div className="space-y-2">
          {mealTypes.map((mealType) => {
            const meal = meals.find((entry) => entry.mealType === mealType);
            const mealTotals = meal ? sumMealItems(meal.items) : null;

            return (
              <div
                key={mealType}
                className={cn(
                  "rounded-[1rem] p-3 ring-1 ring-inset",
                  mealTotals
                    ? "bg-surface-muted ring-hairline"
                    : "bg-surface-subtle ring-hairline-strong"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-ink">{formatMealType(mealType)}</p>
                    <p className="mt-0.5 text-xs font-semibold text-ink-muted">
                      {meal ? meal.items.map((item) => item.name).join(", ") : "Not logged yet"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black tabular-nums text-ink">
                      {mealTotals ? `${mealTotals.calories.toLocaleString()} kcal` : "--"}
                    </p>
                    <p className="text-xs font-bold tabular-nums text-primary-700">
                      {mealTotals ? `${mealTotals.protein}g protein` : "open"}
                    </p>
                  </div>
                </div>
                {mealTotals && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px] font-black tabular-nums">
                    <span className="rounded-full bg-sky-50 px-2 py-1 text-sky-700 ring-1 ring-inset ring-sky-100">
                      {mealTotals.protein}g pro
                    </span>
                    <span className="rounded-full bg-lemon-50 px-2 py-1 text-lemon-700 ring-1 ring-inset ring-lemon-100">
                      {mealTotals.carbs}g carb
                    </span>
                    <span className="rounded-full bg-accent-50 px-2 py-1 text-accent-700 ring-1 ring-inset ring-accent-100">
                      {mealTotals.fat}g fat
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EnergyStat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`${label}: ${value}. Open nutrition detail.`}
      className="fw-press group min-h-11 min-w-[7.5rem] flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-left backdrop-blur hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
    >
      <p className="text-[1.45rem] font-black leading-none tabular-nums text-white">{value}</p>
      <p className="mt-1.5 flex items-center gap-1 whitespace-nowrap text-xs font-bold uppercase tracking-[0.06em] text-white/70">
        {label}
        <ChevronRight className="h-3 w-3 text-white/60 transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 group-hover:text-white/90" />
      </p>
    </Link>
  );
}

function DeepLinkRow({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="fw-press group fw-soft-row block p-4 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-surface hover:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden="true" className={cn(ICON_PLATE, "group-hover:bg-primary-100")}>
            {icon}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-ink">{title}</p>
            <p className="text-sm font-medium text-ink-muted">{body}</p>
          </div>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600"
          strokeWidth={2}
        />
      </div>
    </Link>
  );
}
