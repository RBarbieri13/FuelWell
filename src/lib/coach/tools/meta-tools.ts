import { z } from "zod";
import { registerTools } from "../registry";
import { popLastAction } from "../last-action";
import {
  buildScoreContributors,
  calculateHealthScore,
  calculateNutritionScore,
} from "@/lib/fuelwell-data";
import type { CoachDaySnapshot } from "../types";

/**
 * Meta tools: explain app metrics, undo the last coach write, deep-link to a
 * page, and ask the user a quick-reply followup.
 */

type MetricKey =
  | "health_score"
  | "nutrition_score"
  | "protein_target"
  | "calorie_target"
  | "macro_split"
  | "inflows_outflows";

const METRIC_COPY: Record<MetricKey, { title: string; body: string }> = {
  health_score: {
    title: "Health Score",
    body:
      "Your Health Score averages whichever pillars have real data today — nutrition, activity, recovery. Pillars with no inputs are left out instead of faked, so the score only moves when you log something. No data, no number.",
  },
  nutrition_score: {
    title: "Nutrition Score",
    body:
      "The Nutrition Score grades today's intake against your targets: calories and protein carry 35% each, carbs and fat 15% each. Hitting a target scores it 100; going well over pulls it down. It stays empty until you log your first meal.",
  },
  protein_target: {
    title: "Protein Target",
    body:
      "Your daily protein target, in grams, is set from your profile (weight, goal, activity level). Protein is weighted heaviest alongside calories in your Nutrition Score because it drives satiety and muscle retention.",
  },
  calorie_target: {
    title: "Calorie Target",
    body:
      "Your daily calorie budget, set from your profile and goal. It is a planning number, not a pass/fail line — landing near it consistently matters more than nailing it on any single day.",
  },
  macro_split: {
    title: "Macro Split",
    body:
      "The macro split is how today's calories divide between protein, carbs, and fat (4 kcal per gram of protein and carbs, 9 per gram of fat). It shows the shape of your day, not just the size — the same calories can be protein-forward or carb-heavy.",
  },
  inflows_outflows: {
    title: "Inflows & Outflows",
    body:
      "Inflows are the calories you log eating; outflows are the work you log doing. FuelWell tracks both sides so the day reads as one ledger, but it does not subtract estimated burn from your calorie budget — workout calorie estimates are too noisy to spend.",
  },
};

function currentMetricValue(metric: MetricKey, snapshot: CoachDaySnapshot): string {
  const { totals, targets, meals, workouts } = snapshot;
  switch (metric) {
    case "health_score": {
      const score = calculateHealthScore(
        buildScoreContributors(totals, targets, meals.length)
      );
      return score === null ? "No data yet today" : `${score} / 100`;
    }
    case "nutrition_score": {
      const score = calculateNutritionScore(totals, targets);
      return score === null ? "No meals logged yet" : `${score} / 100`;
    }
    case "protein_target":
      return `${totals.protein}g of ${targets.protein}g today`;
    case "calorie_target":
      return `${totals.calories} of ${targets.calories} kcal today`;
    case "macro_split": {
      const proteinKcal = totals.protein * 4;
      const carbKcal = totals.carbs * 4;
      const fatKcal = totals.fat * 9;
      const macroKcal = proteinKcal + carbKcal + fatKcal;
      if (macroKcal <= 0) return "No meals logged yet";
      const pct = (kcal: number) => Math.round((kcal / macroKcal) * 100);
      return `${pct(proteinKcal)}% protein / ${pct(carbKcal)}% carbs / ${pct(fatKcal)}% fat`;
    }
    case "inflows_outflows": {
      const workoutMin = workouts.reduce((sum, w) => sum + w.durationMin, 0);
      return `${totals.calories} kcal in, ${workouts.length} workout${
        workouts.length === 1 ? "" : "s"
      } (${workoutMin} min) out`;
    }
  }
}

registerTools([
  {
    name: "explain_metric",
    description:
      "Explain what a FuelWell metric means and show the user's current value for it. Use when the user asks what a score, target, or split is or how it is calculated.",
    schema: z.object({
      metric: z
        .enum([
          "health_score",
          "nutrition_score",
          "protein_target",
          "calorie_target",
          "macro_split",
          "inflows_outflows",
        ])
        .describe("Which metric to explain."),
    }),
    run: (input, ctx) => {
      const { metric } = input as { metric: MetricKey };
      const { title, body } = METRIC_COPY[metric];
      const currentValue = currentMetricValue(metric, ctx.snapshot);
      return {
        persisted: false,
        modelResult: { metric, currentValue },
        artifact: {
          id: ctx.newArtifactId(),
          type: "metric_explainer",
          metric,
          title,
          body,
          currentValue,
        },
      };
    },
  },
  {
    name: "undo_last_action",
    description:
      "Undo the coach's most recent write (meal, workout, grocery, etc.) within the last 5 minutes. Use when the user says undo, revert, or that the last action was a mistake.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const last = popLastAction(ctx.userId);
      if (!last) {
        return {
          persisted: false,
          modelResult: { undone: false, reason: "nothing to undo in the last 5 minutes" },
        };
      }
      for (const m of last.inverse) ctx.applyMutation(m);
      return {
        persisted: true,
        mutations: last.inverse,
        modelResult: { undone: true, label: last.label },
        artifact: {
          id: ctx.newArtifactId(),
          type: "undo_confirm",
          label: last.label,
        },
      };
    },
  },
  {
    name: "open_page",
    description:
      "Offer a deep link to an app page, ONLY for things genuinely unavailable in chat (e.g. editing settings forms, browsing full history). Always also offer the in-chat alternative when one exists.",
    schema: z.object({
      route: z
        .enum([
          "/app/log",
          "/app/workouts",
          "/app/recipes",
          "/app/progress",
          "/app/settings",
          "/app/grocery-list",
        ])
        .describe("The app route to link to."),
      reason: z
        .string()
        .describe("One short sentence: why the user should open this page."),
    }),
    run: (input, ctx) => {
      const { route, reason } = input as { route: string; reason: string };
      return {
        persisted: false,
        modelResult: {
          linked: route,
          reminder:
            "You must also offer the in-chat alternative if the task can be done here.",
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "open_page",
          route,
          reason,
        },
      };
    },
  },
  {
    name: "ask_user_followup",
    description:
      "Ask the user a clarifying question with 2-4 tappable quick-reply choices, then stop and wait for their answer. Use when you need a decision before acting (e.g. which meal slot, which portion size).",
    schema: z.object({
      question: z.string().describe("The clarifying question to ask the user."),
      options: z
        .array(z.string().describe("A short tappable choice, a few words at most."))
        .min(2)
        .max(4)
        .describe("2-4 short answer choices."),
    }),
    run: (input, ctx) => {
      const { question, options } = input as { question: string; options: string[] };
      return {
        persisted: false,
        modelResult: { shown: true, instruction: "stop and wait for the user's choice" },
        artifact: {
          id: ctx.newArtifactId(),
          type: "quick_replies",
          question,
          options,
        },
      };
    },
  },
]);
