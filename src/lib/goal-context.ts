import {
  DEFAULT_TARGETS,
  remaining,
  type MacroTargets,
  type MacroTotals,
  type MealRecord,
} from "@/lib/fuelwell-data";

export type PrimaryGoal = "lose" | "maintain" | "gain" | "perform" | "recomp" | "custom";
export type ProteinStrategy = "standard" | "high-protein" | "performance" | "recovery";
export type TrainingPriority = "strength" | "endurance" | "hybrid" | "general";
export type GoalStatus = "active" | "paused" | "completed";
export type IntegrationStatus = "disconnected" | "connected" | "preview_sample" | "error";
export type DataSource = "user_entered" | "garmin" | "healthkit" | "health_connect" | "database" | "estimate";
export type MealConfidence = "exact" | "database" | "estimate" | "manual";

export type GoalPlan = {
  id: string;
  primaryGoal: PrimaryGoal;
  goalReason: string;
  targetWeightKg?: number;
  weeklyRateKg?: number;
  proteinStrategy: ProteinStrategy;
  trainingPriority: TrainingPriority;
  calorieFloor: number;
  calorieCeiling: number;
  macroTargets: MacroTargets;
  adaptationPolicy: "conservative";
  status: GoalStatus;
  updatedAt: string;
};

export type IntegrationDailySummary = {
  provider: "garmin" | "healthkit" | "health_connect";
  status: IntegrationStatus;
  date: string;
  sourceLabel: string;
  steps?: number;
  activeCalories?: number;
  sleepHours?: number;
  stressLevel?: "low" | "moderate" | "high";
  bodyBattery?: number;
  recoveryLabel?: string;
  workoutPlanned?: string;
  lastSyncAt?: string;
  note?: string;
};

export type DailyGoalContext = {
  date: string;
  goalPlan: GoalPlan;
  targets: MacroTargets;
  totals: MacroTotals;
  remaining: MacroTotals;
  mealCount: number;
  dataSources: DataSource[];
  integration?: IntegrationDailySummary;
  guidance: {
    headline: string;
    nextMeal: string;
    sourceNote: string;
  };
};

export type MealGoalImpact = {
  confidence: MealConfidence;
  source: DataSource;
  caloriesLeft: number;
  proteinLeft: number;
  carbsLeft: number;
  fatLeft: number;
  headline: string;
  nextAction: string;
  sourceNote: string;
};

const nowIso = () => new Date().toISOString();

export function normalizePrimaryGoal(goal?: string): PrimaryGoal {
  if (goal === "lose" || goal === "maintain" || goal === "gain") return goal;
  if (goal === "perform" || goal === "recomp" || goal === "custom") return goal;
  return "maintain";
}

export function buildDefaultGoalPlan(input?: {
  goal?: string;
  targets?: MacroTargets;
  activeCalories?: number;
}): GoalPlan {
  const baseTargets = input?.targets ?? DEFAULT_TARGETS;
  const activeCalories = input?.activeCalories ?? 0;
  const activityBump = activeCalories >= 650 ? 250 : activeCalories >= 350 ? 150 : 0;
  const targets = {
    ...baseTargets,
    calories: baseTargets.calories + activityBump,
    carbs: baseTargets.carbs + (activityBump ? Math.round(activityBump / 4) : 0),
  };
  const primaryGoal = normalizePrimaryGoal(input?.goal);
  return {
    id: "goal-default-active",
    primaryGoal,
    goalReason:
      primaryGoal === "perform"
        ? "Fuel training without losing recovery quality."
        : "Use logged meals and daily context to make the next useful nutrition choice.",
    proteinStrategy: primaryGoal === "perform" ? "performance" : "high-protein",
    trainingPriority: primaryGoal === "perform" ? "hybrid" : "general",
    calorieFloor: Math.max(1200, targets.calories - 350),
    calorieCeiling: targets.calories + 350,
    macroTargets: targets,
    adaptationPolicy: "conservative",
    status: "active",
    updatedAt: nowIso(),
  };
}

export function buildPreviewGarminSummary(date: string): IntegrationDailySummary {
  return {
    provider: "garmin",
    status: "preview_sample",
    date,
    sourceLabel: "Garmin preview sample",
    steps: 8200,
    activeCalories: 430,
    sleepHours: 7.2,
    stressLevel: "moderate",
    bodyBattery: 71,
    recoveryLabel: "Ready for normal training",
    workoutPlanned: "45 min tempo ride",
    lastSyncAt: nowIso(),
    note: "Preview-only sample data; no Garmin account is connected.",
  };
}

export function adaptTargetsForIntegration(
  targets: MacroTargets,
  integration?: IntegrationDailySummary,
): MacroTargets {
  if (!integration || integration.status === "disconnected" || integration.status === "error") {
    return targets;
  }
  const active = integration.activeCalories ?? 0;
  const calorieBump = active >= 700 ? 300 : active >= 400 ? 180 : active >= 250 ? 100 : 0;
  return {
    calories: targets.calories + calorieBump,
    protein: targets.protein,
    carbs: targets.carbs + Math.round(calorieBump / 4),
    fat: targets.fat,
  };
}

export function buildDailyGoalContext(input: {
  date: string;
  meals: MealRecord[];
  totals: MacroTotals;
  targets: MacroTargets;
  profile?: { goal?: string };
  goalPlan?: GoalPlan;
  integration?: IntegrationDailySummary;
}): DailyGoalContext {
  const goalPlan = input.goalPlan ?? buildDefaultGoalPlan({
    goal: input.profile?.goal,
    targets: input.targets,
    activeCalories: input.integration?.activeCalories,
  });
  const targets = adaptTargetsForIntegration(goalPlan.macroTargets, input.integration);
  const left = {
    calories: remaining(input.totals.calories, targets.calories),
    protein: remaining(input.totals.protein, targets.protein),
    carbs: remaining(input.totals.carbs, targets.carbs),
    fat: remaining(input.totals.fat, targets.fat),
  };
  const hasIntegration =
    input.integration?.status === "connected" || input.integration?.status === "preview_sample";
  const trainingNote =
    hasIntegration && input.integration?.workoutPlanned
      ? ` ${input.integration.sourceLabel} shows ${input.integration.workoutPlanned}, so keep the next meal supportive.`
      : "";
  return {
    date: input.date,
    goalPlan: { ...goalPlan, macroTargets: targets },
    targets,
    totals: input.totals,
    remaining: left,
    mealCount: input.meals.length,
    dataSources: hasIntegration ? ["user_entered", "database", "garmin"] : ["user_entered", "database"],
    integration: input.integration,
    guidance: {
      headline:
        input.totals.calories > 0
          ? `${left.calories} kcal and ${left.protein}g protein remain.`
          : "Log the first meal to activate goal guidance.",
      nextMeal:
        left.protein > 50
          ? `Make the next meal protein-forward.${trainingNote}`
          : `Keep the next meal balanced against the remaining budget.${trainingNote}`,
      sourceNote: hasIntegration
        ? `Targets include ${input.integration?.sourceLabel}.`
        : "Targets use profile activity until a health platform is connected.",
    },
  };
}

export function buildMealGoalImpact(input: {
  totalsAfter: MacroTotals;
  targets: MacroTargets;
  confidence: MealConfidence;
  source: DataSource;
  integration?: IntegrationDailySummary;
}): MealGoalImpact {
  const left = {
    calories: remaining(input.totalsAfter.calories, input.targets.calories),
    protein: remaining(input.totalsAfter.protein, input.targets.protein),
    carbs: remaining(input.totalsAfter.carbs, input.targets.carbs),
    fat: remaining(input.totalsAfter.fat, input.targets.fat),
  };
  const sourceNote =
    input.integration?.status === "connected" || input.integration?.status === "preview_sample"
      ? `Goal math includes ${input.integration.sourceLabel}.`
      : input.source === "database"
        ? "Macro source: FuelWell food database."
        : input.source === "estimate"
          ? "Macro source: estimate; review before relying on it."
          : "Macro source: user-entered.";
  return {
    confidence: input.confidence,
    source: input.source,
    caloriesLeft: left.calories,
    proteinLeft: left.protein,
    carbsLeft: left.carbs,
    fatLeft: left.fat,
    headline: `${left.calories} kcal and ${left.protein}g protein remain for today.`,
    nextAction:
      left.protein > 50
        ? "Build the next meal around lean protein."
        : left.calories < 350
          ? "Keep the rest of the day light and protein-forward."
          : "Use the remaining budget for a balanced next meal.",
    sourceNote,
  };
}
