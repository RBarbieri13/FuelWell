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

export default async function ScoreDetailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayIsoDate();

  const [profileResult, logResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("calorie_target, protein_target, carbs_target, fat_target")
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
  const contributors = buildScoreContributors(totals, targets, mealCount);
  const healthScore = calculateHealthScore(contributors);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <Card variant="elevated" className="bg-neutral-950 text-white">
        <p className="text-sm font-bold text-primary-200">Health score detail</p>
        <div className="mt-4 grid gap-6 md:grid-cols-[0.35fr_0.65fr] md:items-end">
          <div>
            <p className="text-7xl font-black tabular-nums">{healthScore ?? "--"}</p>
            <p className="mt-2 text-sm font-semibold text-neutral-300">
              {healthScore === null
                ? "No score yet because no scored inputs exist."
                : "Average of available scored contributors."}
            </p>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              FuelWell only scores what it can explain.
            </h1>
            <p className="mt-3 text-sm font-medium leading-6 text-neutral-300">
              Nutrition, activity, and recovery each need real inputs. Missing inputs are shown as missing instead of being filled with fake green progress.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {contributors.map((contributor) => (
          <Card key={contributor.key} className="p-0">
            <Link href={contributor.href} className="block p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                    {contributor.key === "nutrition" && <Salad className="h-6 w-6" />}
                    {contributor.key === "activity" && <Activity className="h-6 w-6" />}
                    {contributor.key === "recovery" && <HeartPulse className="h-6 w-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900">
                      {contributor.label}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-neutral-500">
                      {contributor.status}
                    </p>
                    <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-neutral-600">
                      {contributor.detail}
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary-700">
                      Next: {contributor.nextAction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:block md:text-right">
                  <div>
                    <p className="text-4xl font-black tabular-nums text-neutral-900">
                      {contributor.score ?? "--"}
                    </p>
                    <p className="text-xs font-bold uppercase text-neutral-400">
                      contributor score
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-neutral-300" />
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
  );
}
