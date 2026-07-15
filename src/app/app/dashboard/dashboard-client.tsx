"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  HeartPulse,
  Info,
  Salad,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { MacroBar } from "@/components/dashboard/macro-bar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-3 py-4 md:gap-4 md:py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="fw-heading text-2xl md:text-[1.7rem]" suppressHydrationWarning>
              {salutation}, {effectiveDisplayName}
            </h1>
            <p className="fw-muted mt-1 text-sm" suppressHydrationWarning>
              {tagline}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-base font-black text-white shadow-[0_8px_18px_rgba(30,174,132,0.3)]">
              {effectiveDisplayName.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="fw-page-inner space-y-4 md:space-y-6">
      {setupCompleteBanner && (
        <Card className="border-primary-200 bg-primary-50/80">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <p className="text-sm font-black text-[#16302a]">
                Setup complete — your plan and targets are live.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSetupCompleteBanner(false)}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-black text-primary-700 transition hover:bg-primary-100"
            >
              Done
            </button>
          </div>
        </Card>
      )}
      {!effectiveOnboardingComplete && (
        <Link href="/app/onboarding" className="block group">
          <Card
            variant="elevated"
            className="border-primary-200 bg-gradient-to-r from-primary-50/90 to-white transition-colors group-hover:border-primary-300"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-[0_10px_24px_rgba(21,145,108,0.35)]">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-base font-black text-[#16302a]">
                    Take the 3-minute setup quiz
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#6f8981]">
                    Targets, coach context, and meal suggestions all start here.
                  </p>
                </div>
              </div>
              <span className="hidden shrink-0 items-center gap-1 rounded-full bg-primary-600 px-4 py-2 text-sm font-black text-white transition group-hover:bg-primary-700 sm:inline-flex">
                Start
                <ArrowRight className="h-4 w-4" />
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-primary-600 sm:hidden" />
            </div>
          </Card>
        </Link>
      )}

      <section className="grid gap-[18px] lg:grid-cols-[1.32fr_1fr]">
        <Card
          variant="elevated"
          className="fw-dark-panel overflow-hidden rounded-[26px] p-0 shadow-[0_24px_50px_rgba(16,48,40,0.34)]"
        >
          <div className="relative p-5 md:p-[30px]">
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary-200">
                    <Sparkles className="h-4 w-4" />
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
                    />
                    <EnergyStat
                      label="Protein left"
                      value={`${remaining(totals.protein, effectiveTargets.protein)}g`}
                    />
                  </div>
                )}
              </div>

              <p className="max-w-[26rem] text-sm font-semibold leading-6 text-white/75">
                {hasLoggedToday
                  ? coachVerdict.body
                  : "No meals, workouts, or recovery inputs are logged yet. FuelWell will show the missing pieces instead of inventing green progress."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href={coachVerdict.href}>
                  <Button size="lg" className="rounded-full px-6 py-3 text-sm">
                    <Sparkles className="h-4 w-4" />
                    {coachVerdict.action}
                  </Button>
                </Link>
                <Link
                  href="/app/dashboard/score"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
                >
                  <span className="text-white/80">Health score</span>
                  <span className="tabular-nums text-primary-200">{healthScore ?? "--"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col rounded-[26px] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-neutral-900">
                Today&apos;s plate
              </h2>
              <p className="mt-1 max-w-[14rem] text-xs font-semibold leading-5 text-neutral-500">
                Calculated from {todaysMeals.length} logged {todaysMeals.length === 1 ? "meal" : "meals"} only.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-black text-primary-700">
              {percentOf(totals.calories, effectiveTargets.calories)}% calories
            </span>
          </div>

          <div className="my-2 flex justify-center">
            <MealMakeupHover meals={todaysMeals}>
              <CalorieRing consumed={totals.calories} target={effectiveTargets.calories} emphasis="compact" />
            </MealMakeupHover>
          </div>

          <div className="mt-auto space-y-4">
            <MacroBar label="Protein" current={totals.protein} target={effectiveTargets.protein} color="#3e92c9" />
            <MacroBar label="Carbs" current={totals.carbs} target={effectiveTargets.carbs} color="#c7a91e" />
            <MacroBar label="Fat" current={totals.fat} target={effectiveTargets.fat} color="#f0795b" />
            <Link href="/app/nutrition" className="block">
              <Button variant="secondary" className="w-full rounded-[0.9rem]">
                Open meal breakdown
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
          Quick actions
        </h2>
        <QuickActions />
      </section>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Card className="space-y-4 rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Today&apos;s focus</h2>
          </div>
          <div className="grid gap-3">
            {contributors.map((contributor) => (
              <Link
                href={contributor.href}
                key={contributor.key}
                    className="group fw-soft-row block p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-md hover:shadow-primary-900/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-[1rem] bg-primary-100 p-3 text-primary-700 group-hover:bg-primary-200 group-hover:text-primary-800">
                      {contributor.key === "nutrition" && <Salad className="h-5 w-5" />}
                      {contributor.key === "activity" && <Activity className="h-5 w-5" />}
                      {contributor.key === "recovery" && <HeartPulse className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{contributor.label}</p>
                      <p className="text-sm font-medium text-neutral-500">{contributor.status}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Logged today</h2>
              <p className="text-sm text-neutral-500">
                Tap Nutrition for full macro detail by meal.
              </p>
            </div>
            <UtensilsCrossed className="h-6 w-6 text-primary-600" />
          </div>

          {todaysMeals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 p-5">
              <p className="font-bold text-neutral-900">No meals logged yet.</p>
              <p className="mt-1 text-sm text-neutral-500">
                Add your first meal to unlock today&apos;s nutrition detail and plate.
              </p>
              <Link href="/app/log" className="mt-4 inline-flex">
                <Button>
                  <UtensilsCrossed className="h-4 w-4" />
                  Log a meal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysMeals.slice(0, 4).map((meal) => {
                const mealTotals = sumMealItems(meal.items);
                return (
                  <Link
                    href="/app/nutrition"
                    key={meal.id}
                    className="flex items-center justify-between rounded-[1.25rem] bg-neutral-50/85 p-4 transition hover:bg-primary-50/80"
                  >
                    <div>
                      <p className="font-bold text-neutral-900">
                        {formatMealType(meal.mealType)}
                      </p>
                      <p className="text-sm text-neutral-500">{meal.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black tabular-nums text-neutral-900">
                        {mealTotals.calories.toLocaleString()} kcal
                      </p>
                      <p className="text-xs font-bold text-neutral-400">
                        {mealTotals.protein}g protein
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      <Card className="space-y-4 rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
        <h2 className="text-lg font-bold text-neutral-900">Go deeper</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <DeepLinkRow
            href="/app/daily-review"
            icon={<ClipboardList className="h-5 w-5" />}
            title="Review the full day"
            body="Nutrition, activity, and energy in one ledger."
          />
          <DeepLinkRow
            href="/app/workouts"
            icon={<Dumbbell className="h-5 w-5" />}
            title="Plan movement"
            body="Match a workout to today's energy."
          />
          <DeepLinkRow
            href="/app/recipes"
            icon={<BookOpen className="h-5 w-5" />}
            title="Find food that fits"
            body="Choose dinner from remaining macros."
          />
          <DeepLinkRow
            href="/app/progress"
            icon={<Activity className="h-5 w-5" />}
            title="Check trajectory"
            body="What today changes for the week."
          />
        </div>
      </Card>

      <p className="text-xs font-medium text-neutral-400">
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

  return (
    <div className="group relative flex justify-center" tabIndex={0}>
      {children}
      <div className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-20 w-[min(24rem,calc(100vw-3rem))] -translate-x-1/2 translate-y-3 rounded-[1.35rem] border border-primary-100 bg-white p-4 text-left opacity-0 shadow-[0_24px_70px_rgba(22,48,42,0.16)] transition duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <Info className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-neutral-900">Meal makeup</p>
            <p className="text-xs font-semibold text-neutral-400">Breakfast, lunch, and dinner counted today</p>
          </div>
        </div>

        <div className="space-y-2">
          {mealTypes.map((mealType) => {
            const meal = meals.find((entry) => entry.mealType === mealType);
            const mealTotals = meal ? sumMealItems(meal.items) : null;

            return (
              <div key={mealType} className="rounded-[1rem] border border-neutral-100 bg-neutral-50/80 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-neutral-900">{formatMealType(mealType)}</p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-500">
                      {meal ? meal.items.map((item) => item.name).join(", ") : "Not logged yet"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black tabular-nums text-neutral-900">
                      {mealTotals ? `${mealTotals.calories.toLocaleString()} kcal` : "--"}
                    </p>
                    <p className="text-xs font-bold text-primary-600">
                      {mealTotals ? `${mealTotals.protein}g protein` : "open"}
                    </p>
                  </div>
                </div>
                {mealTotals && (
                  <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[11px] font-black">
                    <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">
                      {mealTotals.protein}g pro
                    </span>
                    <span className="rounded-full bg-lemon-100 px-2 py-1 text-lemon-700">
                      {mealTotals.carbs}g carb
                    </span>
                    <span className="rounded-full bg-accent-100 px-2 py-1 text-accent-700">
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

function EnergyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[7.5rem] flex-1 rounded-2xl border border-white/14 bg-white/10 px-4 py-2.5 text-left backdrop-blur">
      <p className="text-[1.45rem] font-black leading-none tabular-nums text-white">{value}</p>
      <p className="mt-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-[0.06em] text-white/60">
        {label}
      </p>
    </div>
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
      className="group fw-soft-row block p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:shadow-md hover:shadow-primary-900/10"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-[1rem] bg-primary-100 p-3 text-primary-700 group-hover:bg-primary-200 group-hover:text-primary-800">
            {icon}
          </div>
          <div>
            <p className="font-bold text-neutral-900">{title}</p>
            <p className="text-sm font-medium text-neutral-500">{body}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
      </div>
    </Link>
  );
}
