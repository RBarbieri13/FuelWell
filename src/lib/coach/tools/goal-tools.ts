import { z } from "zod";
import { registerTools } from "../registry";
import type { CoachToolDef } from "../types";
import {
  buildDailyGoalContext,
  buildDefaultGoalPlan,
  adaptTargetsForIntegration,
  type GoalPlan,
  type PrimaryGoal,
  type ProteinStrategy,
  type TrainingPriority,
} from "@/lib/goal-context";

function tool<S extends z.ZodTypeAny>(def: CoachToolDef<S>): CoachToolDef {
  return def as unknown as CoachToolDef;
}

const primaryGoal = z.enum(["lose", "maintain", "gain", "perform", "recomp", "custom"]);
const proteinStrategy = z.enum(["standard", "high-protein", "performance", "recovery"]);
const trainingPriority = z.enum(["strength", "endurance", "hybrid", "general"]);

function activeGoal(ctx: { snapshot: { goalPlan?: GoalPlan; profile?: { goal?: string }; targets: GoalPlan["macroTargets"] } }) {
  return ctx.snapshot.goalPlan ?? buildDefaultGoalPlan({
    goal: ctx.snapshot.profile?.goal,
    targets: ctx.snapshot.targets,
  });
}

function contextFor(ctx: Parameters<CoachToolDef["run"]>[1]) {
  return buildDailyGoalContext({
    date: ctx.snapshot.date,
    meals: ctx.snapshot.meals,
    totals: ctx.snapshot.totals,
    targets: ctx.snapshot.targets,
    profile: ctx.snapshot.profile,
    goalPlan: ctx.snapshot.goalPlan,
    integration: ctx.snapshot.integration,
  });
}

registerTools([
  tool({
    name: "get_goal_plan",
    description:
      "Read the user's active goal plan, current targets, today's logged progress, and connected platform context before making goal-based recommendations.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const daily = contextFor(ctx);
      return {
        persisted: false,
        modelResult: daily,
        artifact: {
          id: ctx.newArtifactId(),
          type: "goal_progress",
          goalPlan: daily.goalPlan,
          remaining: daily.remaining,
          guidance: daily.guidance,
          dataSources: daily.dataSources,
          integration: daily.integration,
        },
      };
    },
  }),
  tool({
    name: "update_goal_plan",
    description:
      "Update the active goal plan after the user explicitly asks to change their goal. Use conservative bounds; do not change targets as a hidden side effect.",
    schema: z.object({
      primary_goal: primaryGoal.optional(),
      goal_reason: z.string().max(220).optional(),
      target_weight_kg: z.number().min(35).max(300).optional(),
      weekly_rate_kg: z.number().min(0).max(1.5).optional(),
      protein_strategy: proteinStrategy.optional(),
      training_priority: trainingPriority.optional(),
      calorie_floor: z.number().min(1000).max(5000).optional(),
      calorie_ceiling: z.number().min(1200).max(7000).optional(),
      target_calories: z.number().min(1000).max(7000).optional(),
      target_protein: z.number().min(40).max(400).optional(),
      target_carbs: z.number().min(40).max(800).optional(),
      target_fat: z.number().min(20).max(250).optional(),
    }),
    run: (input, ctx) => {
      const current = activeGoal(ctx);
      const next: GoalPlan = {
        ...current,
        id: current.id.startsWith("goal-default") ? crypto.randomUUID() : current.id,
        primaryGoal: (input.primary_goal as PrimaryGoal | undefined) ?? current.primaryGoal,
        goalReason: input.goal_reason ?? current.goalReason,
        targetWeightKg: input.target_weight_kg ?? current.targetWeightKg,
        weeklyRateKg: input.weekly_rate_kg ?? current.weeklyRateKg,
        proteinStrategy: (input.protein_strategy as ProteinStrategy | undefined) ?? current.proteinStrategy,
        trainingPriority: (input.training_priority as TrainingPriority | undefined) ?? current.trainingPriority,
        calorieFloor: input.calorie_floor ?? current.calorieFloor,
        calorieCeiling: input.calorie_ceiling ?? current.calorieCeiling,
        macroTargets: {
          calories: input.target_calories ?? current.macroTargets.calories,
          protein: input.target_protein ?? current.macroTargets.protein,
          carbs: input.target_carbs ?? current.macroTargets.carbs,
          fat: input.target_fat ?? current.macroTargets.fat,
        },
        updatedAt: new Date().toISOString(),
      };
      return {
        persisted: true,
        modelResult: { goalPlan: next, audit: "goal_plan_updated" },
        mutations: [{ kind: "set_goal_plan", plan: next }],
        artifact: {
          id: ctx.newArtifactId(),
          type: "goal_progress",
          goalPlan: next,
          remaining: contextFor({ ...ctx, snapshot: { ...ctx.snapshot, goalPlan: next } }).remaining,
          guidance: {
            headline: "Goal updated.",
            nextMeal: "Future meal guidance will use this goal plan.",
            sourceNote: "Target changes are auditable goal events for signed-in users.",
          },
          dataSources: ctx.snapshot.goalContext?.dataSources ?? ["user_entered", "database"],
          integration: ctx.snapshot.integration,
        },
      };
    },
  }),
  tool({
    name: "explain_goal_progress",
    description:
      "Explain how today's meals and platform context map to the active goal. Use source notes and avoid shame phrasing.",
    schema: z.object({ detail: z.boolean().optional() }),
    run: (input, ctx) => {
      const daily = contextFor(ctx);
      return {
        persisted: false,
        modelResult: {
          goal: daily.goalPlan.primaryGoal,
          remaining: daily.remaining,
          targets: daily.targets,
          totals: daily.totals,
          guidance: daily.guidance,
          detail: input.detail ? daily : undefined,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "goal_progress",
          goalPlan: daily.goalPlan,
          remaining: daily.remaining,
          guidance: daily.guidance,
          dataSources: daily.dataSources,
          integration: daily.integration,
        },
      };
    },
  }),
  tool({
    name: "adapt_today_target",
    description:
      "Preview today's target adaptation from connected activity/recovery context. This proposes guidance only; persistent target changes require user approval through update_goal_plan.",
    schema: z.object({ reason: z.string().max(220).optional() }),
    run: (input, ctx) => {
      const daily = contextFor(ctx);
      const hasPlatform =
        daily.integration?.status === "connected" || daily.integration?.status === "preview_sample";
      return {
        persisted: false,
        modelResult: {
          proposed: hasPlatform,
          reason:
            input.reason ??
            (hasPlatform
              ? daily.guidance.sourceNote
              : "No connected activity platform is available, so targets remain profile-based."),
          targets: daily.targets,
          remaining: daily.remaining,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "goal_progress",
          goalPlan: daily.goalPlan,
          remaining: daily.remaining,
          guidance: {
            headline: hasPlatform ? "Today's target is adapted." : "Today's target is profile-based.",
            nextMeal: daily.guidance.nextMeal,
            sourceNote: daily.guidance.sourceNote,
          },
          dataSources: daily.dataSources,
          integration: daily.integration,
        },
      };
    },
  }),
  tool({
    name: "get_weekly_goal_review",
    description:
      "Create a weekly goal review card from current targets, logged trend evidence, and platform context. This does not change targets.",
    schema: z.object({}),
    run: (_input, ctx) => {
      const daily = contextFor(ctx);
      const mealDays = ctx.snapshot.totals.calories > 0 ? 1 : 0;
      const platform =
        daily.integration?.status === "connected" || daily.integration?.status === "preview_sample"
          ? `${daily.integration.sourceLabel}: ${daily.integration.activeCalories ?? 0} active calories, ${daily.integration.recoveryLabel ?? "recovery unknown"}`
          : "No connected platform data this week.";
      const evidence = [
        `${ctx.snapshot.meals.length} meal${ctx.snapshot.meals.length === 1 ? "" : "s"} logged today; ${mealDays} logged day in this local review window.`,
        `${daily.remaining.calories} kcal and ${daily.remaining.protein}g protein remain against today's target.`,
        platform,
      ];
      return {
        persisted: false,
        modelResult: {
          summary: "Weekly review is ready; no target change has been applied.",
          targets: daily.targets,
          evidence,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "weekly_goal_review",
          summary: "Review the week before changing targets.",
          targets: daily.targets,
          evidence,
          recommendation:
            "Keep targets steady unless several days show the same pattern. One unusual day should not change the plan.",
        },
      };
    },
  }),
  tool({
    name: "propose_target_change",
    description:
      "Propose a target change with evidence. This only renders an accept/decline card; accepted changes call update_goal_plan.",
    schema: z.object({
      target_calories: z.number().min(1000).max(7000),
      target_protein: z.number().min(40).max(400),
      target_carbs: z.number().min(40).max(800),
      target_fat: z.number().min(20).max(250),
      reason: z.string().min(8).max(220),
      evidence: z.array(z.string().min(4).max(160)).min(1).max(4),
    }),
    run: (input, ctx) => {
      const current = activeGoal(ctx);
      const currentTargets = adaptTargetsForIntegration(current.macroTargets, ctx.snapshot.integration);
      const proposedTargets = {
        calories: input.target_calories,
        protein: input.target_protein,
        carbs: input.target_carbs,
        fat: input.target_fat,
      };
      return {
        persisted: false,
        modelResult: {
          proposedTargets,
          reason: input.reason,
          requiresUserApproval: true,
          noChangeApplied: true,
        },
        artifact: {
          id: ctx.newArtifactId(),
          type: "target_change_proposal",
          currentTargets,
          proposedTargets,
          reason: input.reason,
          evidence: input.evidence,
        },
      };
    },
  }),
]);
