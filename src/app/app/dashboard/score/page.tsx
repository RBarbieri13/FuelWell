import Link from "next/link";
import { Activity, ArrowRight, HeartPulse, Salad } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildScoreContributors,
  calculateHealthScore,
  DEFAULT_TARGETS,
  todayIsoDate,
  type MacroTotals,
} from "@/lib/fuelwell-data";
import { getSampleDay } from "@/lib/preview-session";
import { loadServerDailyGoalContext } from "@/lib/server-goal-context";

export default async function ScoreDetailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayIsoDate();

  if (!user) {
    const sample = getSampleDay();
    const contributors = buildScoreContributors(
      sample.totals,
      sample.targets,
      sample.meals.length
    );
    const healthScore = calculateHealthScore(contributors);

    return <ScoreDetail contributors={contributors} healthScore={healthScore} />;
  }

  const [profileResult, logResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("calorie_target, protein_target, carbs_target, fat_target, goal")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("daily_logs")
      .select("calories_consumed, protein_consumed, carbs_consumed, fat_consumed")
      .eq("user_id", user!.id)
      .eq("log_date", today)
      .maybeSingle(),
  ]);

  const targets = {
    calories: profileResult.data?.calorie_target ?? DEFAULT_TARGETS.calories,
    protein: profileResult.data?.protein_target ?? DEFAULT_TARGETS.protein,
    carbs: profileResult.data?.carbs_target ?? DEFAULT_TARGETS.carbs,
    fat: profileResult.data?.fat_target ?? DEFAULT_TARGETS.fat,
  };
  const totals: MacroTotals = {
    calories: Number(logResult.data?.calories_consumed ?? 0),
    protein: Number(logResult.data?.protein_consumed ?? 0),
    carbs: Number(logResult.data?.carbs_consumed ?? 0),
    fat: Number(logResult.data?.fat_consumed ?? 0),
  };

  const mealCount = totals.calories > 0 ? 1 : 0;
  const goalContext = await loadServerDailyGoalContext(supabase, {
    userId: user!.id,
    date: today,
    meals: [],
    totals,
    targets,
    profile: { goal: profileResult.data?.goal },
  });
  const contributors = buildScoreContributors(totals, goalContext.targets, mealCount);
  const healthScore = calculateHealthScore(contributors);

  return <ScoreDetail contributors={contributors} healthScore={healthScore} />;
}

function ScoreDetail({
  contributors,
  healthScore,
}: {
  contributors: ReturnType<typeof buildScoreContributors>;
  healthScore: number | null;
}) {
  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner max-w-5xl space-y-6">
      <Card variant="elevated" className="fw-dark-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
          Health score detail
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-[0.35fr_0.65fr] md:items-end">
          <div>
            <p className="text-7xl font-black tabular-nums">{healthScore ?? "--"}</p>
            <p className="mt-2 text-sm font-semibold text-white/65">
              {healthScore === null
                ? "No score yet because no scored inputs exist."
                : "Average of available scored contributors."}
            </p>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              FuelWell only scores what it can explain.
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/68">
              Nutrition, activity, and recovery each need real inputs. Missing inputs are shown as missing instead of being filled with fake green progress.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {contributors.map((contributor) => (
          <Card key={contributor.key} variant="elevated" className="p-0">
            <Link href={contributor.href} className="block p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="fw-icon-chip shrink-0">
                    {contributor.key === "nutrition" && <Salad className="h-6 w-6" />}
                    {contributor.key === "activity" && <Activity className="h-6 w-6" />}
                    {contributor.key === "recovery" && <HeartPulse className="h-6 w-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#16302a]">
                      {contributor.label}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-[#78928a]">
                      {contributor.status}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#516b63]">
                      {contributor.detail}
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary-700">
                      Next: {contributor.nextAction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:block md:text-right">
                  <div>
                    <p className="text-4xl font-black tabular-nums text-[#16302a]">
                      {contributor.score ?? "--"}
                    </p>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#91a7a0]">
                      contributor score
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary-500" />
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      <Link href="/app/dashboard">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
      </div>
    </div>
  );
}
