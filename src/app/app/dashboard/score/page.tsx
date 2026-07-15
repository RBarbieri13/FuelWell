import Link from "next/link";
import { headers } from "next/headers";
import { Activity, ArrowRight, HeartPulse, Salad } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildScoreContributors,
  calculateHealthScore,
  DEFAULT_TARGETS,
  todayIsoDate,
  type MacroTotals,
} from "@/lib/fuelwell-data";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";
import { loadServerDailyGoalContext } from "@/lib/server-goal-context";

export default async function ScoreDetailPage() {
  const host = (await headers()).get("host");
  if (isPreviewHost(host)) {
    const sample = getSampleDay();
    const contributors = buildScoreContributors(
      sample.totals,
      sample.targets,
      sample.meals.length
    );
    const healthScore = calculateHealthScore(contributors);

    return <ScoreDetail contributors={contributors} healthScore={healthScore} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayIsoDate();

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
      <div className="fw-page-inner max-w-5xl space-y-4 md:space-y-6">
      <Card variant="elevated" className="fw-dark-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
          Health score detail
        </p>
        <div className="mt-4 grid gap-4 md:mt-5 md:grid-cols-[0.35fr_0.65fr] md:items-end md:gap-6">
          <div>
            <p className="text-5xl font-black tabular-nums md:text-7xl">
              {healthScore ?? "--"}
              {healthScore !== null && (
                <span className="ml-1 text-2xl font-bold text-white/60">/100</span>
              )}
            </p>
            <p className="mt-2 text-sm font-semibold text-white/65">
              {healthScore === null
                ? "No score yet because no scored inputs exist."
                : "Average of the scored contributors below."}
            </p>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
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
                    <p className="mt-1 text-sm font-bold text-muted-foreground">
                      {contributor.status}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">
                      {contributor.detail}
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary-700">
                      Next: {contributor.nextAction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3">
                  <div className="md:text-right">
                    {contributor.score !== null ? (
                      <p className="text-3xl font-black tabular-nums text-[#16302a] md:text-4xl">
                        {contributor.score}
                      </p>
                    ) : (
                      <Badge>No inputs yet</Badge>
                    )}
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
                      contributor score
                    </p>
                    {contributor.score !== null && (
                      <div className="mt-2 h-[7px] w-32 overflow-hidden rounded-full bg-primary-100 md:ml-auto">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${contributor.score}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-primary-500" />
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
