import { z } from "zod";
import { registerTools } from "../registry";
import { buildScoreContributors, calculateHealthScore } from "@/lib/fuelwell-data";
import { buildSampleHistory } from "@/components/progress/sample-history";
import type { BodyLogEntry, CoachToolDef } from "../types";

/** Preserves the schema generic so `input` is typed inside `run`. */
function defineTool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

/**
 * Progress & body-log tools: health score, macro/weight history, energy
 * balance, and quick body-log writes (weight, mood, water).
 *
 * History windows reuse the Progress page's deterministic sample-history
 * synthesis (buildSampleHistory) so Coach charts match the Progress page;
 * today's bar is always the real snapshot.
 */

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;
const LB_TO_KG = 0.45359237;

type MacroHistoryDay = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "logged" | "sample";
};

function buildMacroSeries(
  windowDays: number,
  snapshot: { date: string; totals: { calories: number; protein: number; carbs: number; fat: number } }
): MacroHistoryDay[] {
  return buildSampleHistory(windowDays).map((day) => {
    if (day.date === snapshot.date && snapshot.totals.calories > 0) {
      return { date: day.date, ...snapshot.totals, source: "logged" as const };
    }
    return {
      date: day.date,
      calories:
        day.protein * KCAL_PER_G.protein +
        day.carbs * KCAL_PER_G.carbs +
        day.fat * KCAL_PER_G.fat,
      protein: day.protein,
      carbs: day.carbs,
      fat: day.fat,
      source: "sample" as const,
    };
  });
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  lightly_active: 1.375,
  moderate: 1.55,
  moderately_active: 1.55,
  active: 1.725,
  very_active: 1.725,
  athlete: 1.9,
};

function estimateDailyBurn(profile: { weightKg?: number; heightCm?: number; activityLevel?: string }) {
  const assumptions: string[] = [];

  const weightKg = profile.weightKg ?? 75;
  if (profile.weightKg === undefined) assumptions.push("Weight not in profile; assumed 165 lb.");
  const heightCm = profile.heightCm ?? 175;
  if (profile.heightCm === undefined) assumptions.push("Height not in profile; assumed 69 in.");

  // Mifflin-St Jeor BMR. Profile has no age or sex: assume age 35 and use the
  // midpoint of the male (+5) and female (-161) constants (-78).
  const age = 35;
  assumptions.push("Age not in profile; assumed 35.");
  assumptions.push("Sex not in profile; used midpoint of Mifflin-St Jeor male/female constants.");
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;

  const levelKey = (profile.activityLevel ?? "").toLowerCase().replace(/\s+/g, "_");
  const multiplier = ACTIVITY_MULTIPLIERS[levelKey] ?? 1.375;
  if (ACTIVITY_MULTIPLIERS[levelKey] === undefined) {
    assumptions.push(
      profile.activityLevel
        ? `Unrecognized activity level "${profile.activityLevel}"; used 1.375 (light).`
        : "Activity level not in profile; used 1.375 (light)."
    );
  } else {
    assumptions.push(`Activity multiplier ${multiplier} from level "${profile.activityLevel}".`);
  }

  return { dailyBurnKcal: Math.round(bmr * multiplier), assumptions };
}

registerTools([
  defineTool({
    name: "get_health_score",
    description:
      "Get today's FuelWell health score (0-100 or null when no meals are logged) with its nutrition/activity/recovery contributors. Use when the user asks how they're doing overall or about their score.",
    schema: z.object({
      detail: z
        .boolean()
        .optional()
        .describe("Set true to include each contributor's detail text and suggested next action."),
    }),
    run: (input, ctx) => {
      const { totals, targets, meals } = ctx.snapshot;
      const contributors = buildScoreContributors(totals, targets, meals.length);
      const score = calculateHealthScore(contributors);
      return {
        persisted: false,
        modelResult: {
          score,
          contributors: contributors.map((c) => ({
            key: c.key,
            score: c.score,
            status: c.status,
            ...(input.detail ? { detail: c.detail, nextAction: c.nextAction } : {}),
          })),
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "health_score",
          score,
          contributors: contributors.map((c) => ({
            key: c.key,
            label: c.label,
            score: c.score,
            status: c.status,
            detail: c.detail,
            nextAction: c.nextAction,
          })),
          compact: true,
        },
      };
    },
  }),
  defineTool({
    name: "get_macro_history",
    description:
      "Get a daily calories/protein/carbs/fat series for the last 7, 14, or 30 days. Today is real logged data; earlier days are deterministic sample history (same synthesis as the Progress page), flagged sample.",
    schema: z.object({
      window: z.enum(["7d", "14d", "30d"]).describe("History window to chart: 7, 14, or 30 days ending today."),
    }),
    run: (input, ctx) => {
      const windowDays = { "7d": 7, "14d": 14, "30d": 30 }[input.window];
      const series = buildMacroSeries(windowDays, ctx.snapshot);
      const sample = series.some((d) => d.source === "sample");
      const avg = (key: "calories" | "protein") =>
        Math.round(series.reduce((sum, d) => sum + d[key], 0) / series.length);
      const today = series.find((d) => d.source === "logged");
      return {
        persisted: false,
        modelResult: {
          window: input.window,
          avgCalories: avg("calories"),
          avgProtein: avg("protein"),
          today: today
            ? { calories: today.calories, protein: today.protein, carbs: today.carbs, fat: today.fat }
            : null,
          sample,
          note: sample ? "Past days are sample history, not measured intake." : undefined,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "macro_history",
          window: input.window,
          series,
          targets: ctx.snapshot.targets,
          sample,
        },
      };
    },
  }),
  defineTool({
    name: "get_inflows_outflows",
    description:
      "Compare calories consumed (inflow) against estimated calories burned (outflow: Mifflin-St Jeor BMR from profile weight/height times an activity multiplier) for today or the last 7 days. Outflow is an estimate; assumptions are listed.",
    schema: z.object({
      window: z.enum(["today", "7d"]).describe("Energy-balance window: today only, or the last 7 days."),
    }),
    run: (input, ctx) => {
      const { dailyBurnKcal, assumptions } = estimateDailyBurn(ctx.snapshot.profile);
      let inflowKcal: number;
      let outflowKcal: number;
      if (input.window === "today") {
        inflowKcal = ctx.snapshot.totals.calories;
        outflowKcal = dailyBurnKcal;
      } else {
        const series = buildMacroSeries(7, ctx.snapshot);
        inflowKcal = series.reduce((sum, d) => sum + d.calories, 0);
        outflowKcal = dailyBurnKcal * 7;
        assumptions.push("7d inflow uses sample history for past days (only today is logged).");
      }
      const net = inflowKcal - outflowKcal;
      return {
        persisted: false,
        modelResult: { window: input.window, inflowKcal, outflowKcal, net, assumptions },
        artifact: {
          id: ctx.newArtifactId(),
          type: "inflows_outflows",
          window: input.window,
          inflowKcal,
          outflowKcal,
          net,
          assumptions,
        },
      };
    },
  }),
  defineTool({
    name: "get_weight_trend",
    description:
      "Get the user's logged weight entries over the last 30 or 90 days with the net change. Honestly reports when fewer than 2 entries exist (no trend can be computed).",
    schema: z.object({
      window: z.enum(["30d", "90d"]).describe("Trend window: weight entries from the last 30 or 90 days."),
    }),
    run: (input, ctx) => {
      const windowDays = input.window === "30d" ? 30 : 90;
      const cutoff = new Date(`${ctx.snapshot.date}T00:00:00`);
      cutoff.setDate(cutoff.getDate() - windowDays);
      const cutoffIso = cutoff.toISOString().slice(0, 10);

      const series = ctx.snapshot.bodyLog
        .filter((e): e is BodyLogEntry & { weightKg: number } => e.weightKg !== undefined)
        .filter((e) => e.date >= cutoffIso)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({ date: e.date, weightKg: e.weightKg }));

      const insufficient = series.length < 2;
      const delta = insufficient
        ? null
        : Math.round((series[series.length - 1].weightKg - series[0].weightKg) * 10) / 10;

      return {
        persisted: false,
        modelResult: insufficient
          ? {
              insufficient: true,
              entries: series.length,
              note: "Not enough weight entries to compute a trend; need at least 2 in the window.",
            }
          : { entries: series.length, deltaKg: delta, latestKg: series[series.length - 1].weightKg },
        artifact: {
          id: ctx.newArtifactId(),
          type: "weight_trend",
          series,
          delta,
          insufficient,
        },
      };
    },
  }),
  defineTool({
    name: "log_weight",
    description:
      "Log the user's body weight for today. Prefer lb for user-facing language; kg is accepted only for conversion/storage. Use when the user states their current weight.",
    schema: z.object({
      weight: z.number().min(20).max(700).describe("Body weight value in the given unit."),
      unit: z.enum(["kg", "lb"]).describe("Unit of the weight value: kg or lb."),
    }),
    run: (input, ctx) => {
      const weightKg = Math.round((input.unit === "lb" ? input.weight * LB_TO_KG : input.weight) * 10) / 10;
      const mutation = { kind: "add_body_log" as const, entry: { date: ctx.snapshot.date, weightKg } };
      ctx.applyMutation(mutation);
      return {
        persisted: true,
        mutations: [mutation],
        modelResult: { logged: true, weightKg },
        artifact: {
          id: ctx.newArtifactId(),
          type: "body_log_confirm",
          kind: "weight",
          value: input.unit === "lb" ? input.weight : Math.round(weightKg * 2.20462 * 10) / 10,
          unit: "lb",
          displayValue: `${input.weight} ${input.unit}`,
        },
      };
    },
  }),
  defineTool({
    name: "log_mood",
    description:
      "Log the user's mood for today on a 1-5 scale (1 = very low, 5 = great). Use when the user reports how they're feeling.",
    schema: z.object({
      score: z.number().int().min(1).max(5).describe("Mood score from 1 (very low) to 5 (great)."),
    }),
    run: (input, ctx) => {
      const mutation = { kind: "add_body_log" as const, entry: { date: ctx.snapshot.date, mood: input.score } };
      ctx.applyMutation(mutation);
      return {
        persisted: true,
        mutations: [mutation],
        modelResult: { logged: true, mood: input.score },
        artifact: {
          id: ctx.newArtifactId(),
          type: "body_log_confirm",
          kind: "mood",
          value: input.score,
        },
      };
    },
  }),
  defineTool({
    name: "log_water",
    description:
      "Log water intake for today in milliliters. Use when the user mentions drinking water (convert cups/oz to ml first: 1 cup = 240 ml, 1 oz = 30 ml).",
    schema: z.object({
      amount_ml: z.number().min(1).max(10000).describe("Water amount in milliliters (1-10000)."),
    }),
    run: (input, ctx) => {
      const mutation = {
        kind: "add_body_log" as const,
        entry: { date: ctx.snapshot.date, waterMl: input.amount_ml },
      };
      ctx.applyMutation(mutation);
      return {
        persisted: true,
        mutations: [mutation],
        modelResult: { logged: true, waterMl: input.amount_ml },
        artifact: {
          id: ctx.newArtifactId(),
          type: "body_log_confirm",
          kind: "water",
          value: input.amount_ml,
        },
      };
    },
  }),
]);
