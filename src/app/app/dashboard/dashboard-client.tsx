"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Dumbbell,
  HeartPulse,
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
  // Live client store wins for today's view: meals logged from Log or Coach
  // chat update these totals immediately (D-gate). Server meals are the
  // fallback for first paint / signed-in history.
  const { meals: liveMeals } = useDayLog();
  const todaysMeals = liveMeals.length > 0 ? liveMeals : meals;
  const totals = sumMeals(todaysMeals, fallbackTotals);
  const hasLoggedToday = totals.calories > 0;
  const contributors = buildScoreContributors(totals, targets, todaysMeals.length);
  const healthScore = calculateHealthScore(contributors);
  const coachVerdict = buildCoachVerdict(totals, targets, todaysMeals.length);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      {!onboardingComplete && (
        <Link href="/app/onboarding" className="block group">
          <Card className="border-accent-200/80 bg-accent-50/70 transition-colors group-hover:border-accent-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-accent-800">
                  Finish your setup before trusting the scores
                </p>
                <p className="mt-0.5 text-xs font-medium text-accent-700">
                  FuelWell needs your body, goal, and diet inputs to calculate useful targets.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-accent-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card
          variant="elevated"
          className="overflow-hidden bg-neutral-950 p-0 text-white"
        >
          <div className="relative p-6 md:p-8">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary-200">
                    Today&apos;s decision
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                    {hasLoggedToday ? coachVerdict.title : `Hey, ${displayName}. Start with one real input.`}
                  </h1>
                </div>
                {hasLoggedToday && (
                  <div className="flex gap-3">
                    <EnergyStat
                      label="Calories left"
                      value={`${remaining(totals.calories, targets.calories)}`}
                    />
                    <EnergyStat
                      label="Protein left"
                      value={`${remaining(totals.protein, targets.protein)}g`}
                    />
                  </div>
                )}
              </div>

              <p className="max-w-2xl text-base font-medium leading-7 text-neutral-200">
                {hasLoggedToday
                  ? coachVerdict.body
                  : "No meals, workouts, or recovery inputs are logged yet. FuelWell will show the missing pieces instead of inventing green progress."}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={coachVerdict.href}>
                  <Button size="lg">
                    <Sparkles className="h-4 w-4" />
                    {coachVerdict.action}
                  </Button>
                </Link>
                <Link
                  href="/app/dashboard/score"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-neutral-200 backdrop-blur transition hover:bg-white/15"
                >
                  <span className="text-neutral-400">Health score</span>
                  <span className="tabular-nums text-white">{healthScore ?? "--"}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Today&apos;s plate
              </h2>
              <p className="text-sm text-neutral-500">
                Nutrition is calculated from logged meals only.
              </p>
            </div>
            <Link href="/app/nutrition" className="-m-3 p-3 text-sm font-bold text-primary-700">
              Details
            </Link>
          </div>

          <div className="flex justify-center">
            <CalorieRing consumed={totals.calories} target={targets.calories} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniMetric label="Protein left" value={`${remaining(totals.protein, targets.protein)}g`} />
            <MiniMetric label="Calories left" value={`${remaining(totals.calories, targets.calories)}`} />
            <MiniMetric label="Meals" value={`${todaysMeals.length}`} />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Macro truth</h2>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-500">
              {percentOf(totals.calories, targets.calories)}% calories
            </span>
          </div>
          <MacroBar label="Protein" current={totals.protein} target={targets.protein} color="#3b82f6" />
          <MacroBar label="Carbs" current={totals.carbs} target={targets.carbs} color="#f59e0b" />
          <MacroBar label="Fat" current={totals.fat} target={targets.fat} color="#ef4444" />
          <Link href="/app/nutrition">
            <Button variant="secondary" className="w-full">
              Open meal breakdown
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Today&apos;s focus</h2>
          </div>
          <div className="grid gap-3">
            {contributors.map((contributor) => (
              <Link
                href={contributor.href}
                key={contributor.key}
                className="group rounded-2xl border border-neutral-200/80 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md hover:shadow-neutral-200/70"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-700 group-hover:bg-primary-50 group-hover:text-primary-700">
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
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Quick actions
          </h2>
          <QuickActions />
        </div>

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
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
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
                    className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/80 p-3 transition hover:border-primary-200 hover:bg-primary-50/40"
                  >
                    <div>
                      <p className="font-bold text-neutral-900">
                        {formatMealType(meal.mealType)}
                      </p>
                      <p className="text-sm text-neutral-500">{meal.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black tabular-nums text-neutral-900">
                        {mealTotals.calories} cal
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

      <section className="grid gap-3 sm:grid-cols-3">
        <DeepLinkCard
          href="/app/workouts"
          icon={<Dumbbell className="h-5 w-5" />}
          title="Plan movement"
          body="Pick a workout that matches today's energy and recovery."
        />
        <DeepLinkCard
          href="/app/recipes"
          icon={<BookOpen className="h-5 w-5" />}
          title="Find food that fits"
          body="Use remaining macros to choose dinner or snacks."
        />
        <DeepLinkCard
          href="/app/progress"
          icon={<Activity className="h-5 w-5" />}
          title="Check trajectory"
          body="See what today changes about the weekly direction."
        />
      </section>

      <p className="text-xs font-medium text-neutral-400">
        Profile context: goal {goal}, diet {dietaryPreference}
        {allergies.length > 0 ? `, allergies ${allergies.join(", ")}` : ""}.
      </p>
    </div>
  );
}

function EnergyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">
      <p className="text-2xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-0.5 whitespace-nowrap text-xs font-semibold uppercase tracking-tight text-neutral-300">
        {label}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-100/80 p-3 text-center">
      <p className="text-xl font-black tabular-nums text-neutral-900">{value}</p>
      <p className="mt-0.5 whitespace-nowrap text-xs font-bold uppercase tracking-tight text-neutral-400">{label}</p>
    </div>
  );
}

function DeepLinkCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm shadow-neutral-200/60 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        {icon}
      </div>
      <p className="font-black text-neutral-900">{title}</p>
      <p className="mt-1 text-sm font-medium leading-5 text-neutral-500">{body}</p>
      <div className="mt-4 flex items-center text-sm font-bold text-primary-700">
        Open
        <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
