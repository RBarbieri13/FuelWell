import Link from "next/link";
import { headers } from "next/headers";
import { Activity, ArrowLeft, ArrowRight, HeartPulse, Salad } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressMeter } from "@/components/ui/progress-meter";
import {
  buildScoreContributors,
  calculateHealthScore,
  DEFAULT_TARGETS,
  todayIsoDate,
  type MacroTotals,
} from "@/lib/fuelwell-data";
import { getSampleDay, isPreviewHost } from "@/lib/preview-session";
import { loadServerDailyGoalContext } from "@/lib/server-goal-context";

/** One glyph plate treatment, matched to the dashboard's contributor rows. */
const ICON_PLATE =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100";

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
  const scoredCount = contributors.filter(
    (contributor) => contributor.score !== null
  ).length;

  return (
    <div className="fw-app-surface min-h-full">
      <div className="fw-page-inner max-w-5xl space-y-4 md:space-y-6">
      <Card variant="elevated" className="fw-dark-panel shadow-e4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
          Health score detail
        </p>
        <div className="mt-4 grid gap-5 md:mt-5 md:grid-cols-[0.35fr_0.65fr] md:items-end md:gap-6">
          <div className="min-w-0">
            <p className="text-5xl font-black tabular-nums md:text-7xl">
              {healthScore ?? "--"}
              {healthScore !== null && (
                <span className="ml-1 text-2xl font-bold text-white/60">/100</span>
              )}
            </p>

            {/* The headline number is meaningless without its scale, so the
                bar carries the 0-100 axis it is measured against. */}
            <div
              className="mt-4 max-w-xs"
              role="img"
              aria-label={
                healthScore === null
                  ? "No health score yet. Zero of three contributors scored."
                  : `Health score ${healthScore} out of 100, from ${scoredCount} of ${contributors.length} contributors.`
              }
            >
              <div className="relative h-2.5 overflow-hidden rounded-full bg-white/15 ring-1 ring-inset ring-white/10">
                {healthScore !== null && (
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-300 to-primary-100"
                    style={{ width: `${Math.min(Math.max(healthScore, 0), 100)}%` }}
                  />
                )}
                {/* Quartile gridlines — a bar without them has no reference. */}
                {[25, 50, 75].map((mark) => (
                  <span
                    key={mark}
                    aria-hidden="true"
                    className="absolute inset-y-0 w-px bg-white/25"
                    style={{ left: `${mark}%` }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[0.6875rem] font-bold tabular-nums text-white/55">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <p className="mt-3 text-sm font-semibold text-white/70">
              {healthScore === null
                ? "No score yet because no scored inputs exist."
                : "Average of the scored contributors below."}
            </p>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              FuelWell only scores what it can explain.
            </h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/75">
              Nutrition, activity, and recovery each need real inputs. Missing inputs are shown as missing instead of being filled with fake green progress.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-black tabular-nums text-white/85 backdrop-blur">
              {scoredCount} of {contributors.length} contributors scored
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {contributors.map((contributor) => (
          <Card key={contributor.key} className="p-0">
            <Link
              href={contributor.href}
              className="fw-press block rounded-[24px] p-5 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span aria-hidden="true" className={ICON_PLATE}>
                    {contributor.key === "nutrition" && <Salad className="h-5 w-5" strokeWidth={2} />}
                    {contributor.key === "activity" && <Activity className="h-5 w-5" strokeWidth={2} />}
                    {contributor.key === "recovery" && <HeartPulse className="h-5 w-5" strokeWidth={2} />}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-ink">
                      {contributor.label}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-ink-muted">
                      {contributor.status}
                    </p>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-ink-muted">
                      {contributor.detail}
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary-700">
                      Next: {contributor.nextAction}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3">
                  <div className="min-w-0 md:text-right">
                    {contributor.score !== null ? (
                      <p className="text-3xl font-black tabular-nums text-ink md:text-4xl">
                        {contributor.score}
                        <span className="ml-0.5 text-base font-bold text-ink-muted">
                          /100
                        </span>
                      </p>
                    ) : (
                      <Badge variant="neutral" dot>
                        No inputs yet
                      </Badge>
                    )}
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-ink-subtle">
                      contributor score
                    </p>
                    {contributor.score !== null && (
                      <div className="mt-2 w-32 max-w-full md:ml-auto">
                        <ProgressMeter
                          value={contributor.score}
                          target={100}
                          size="sm"
                          color="var(--color-primary-500)"
                          label={`${contributor.label} contributor score: ${contributor.score} out of 100`}
                        />
                        <div className="mt-1 flex items-center justify-between text-[0.625rem] font-bold tabular-nums text-ink-muted">
                          <span>0</span>
                          <span>100</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-primary-600"
                    strokeWidth={2}
                  />
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      <Link
        href="/app/dashboard"
        className="fw-press inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-[1.15rem] border border-primary-100 bg-surface/92 px-4 py-3 text-sm font-bold text-primary-800 shadow-e1 hover:border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to dashboard
      </Link>
      </div>
    </div>
  );
}
