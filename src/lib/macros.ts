/**
 * Mifflin-St Jeor equation for BMR calculation
 * and macro target computation based on user profile.
 */

export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";
export type GoalAggressiveness =
  | "gentle_loss"
  | "steady_loss"
  | "aggressive_loss"
  | "maintain"
  | "lean_gain"
  | "strong_gain"
  | "rapid_gain";

interface ProfileInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  goalAggressiveness?: string;
}

interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_AGGRESSIVENESS_OPTIONS: Array<{
  value: GoalAggressiveness;
  label: string;
  shortLabel: string;
  description: string;
  calorieAdjustmentPct: number;
}> = [
  {
    value: "gentle_loss",
    label: "Gentle loss",
    shortLabel: "Gentle cut",
    description: "About a 10% deficit for lower-pressure fat loss.",
    calorieAdjustmentPct: -0.1,
  },
  {
    value: "steady_loss",
    label: "Steady loss",
    shortLabel: "Steady cut",
    description: "About a 15% deficit for visible progress with flexibility.",
    calorieAdjustmentPct: -0.15,
  },
  {
    value: "aggressive_loss",
    label: "Aggressive loss",
    shortLabel: "Aggressive cut",
    description: "About a 20% deficit with tighter hunger and recovery tradeoffs.",
    calorieAdjustmentPct: -0.2,
  },
  {
    value: "maintain",
    label: "Maintain / recomp",
    shortLabel: "Maintain",
    description: "Stay near maintenance while prioritizing consistency and training quality.",
    calorieAdjustmentPct: 0,
  },
  {
    value: "lean_gain",
    label: "Lean gain",
    shortLabel: "Lean gain",
    description: "About a 5% surplus for slower muscle gain with less spillover.",
    calorieAdjustmentPct: 0.05,
  },
  {
    value: "strong_gain",
    label: "Strong gain",
    shortLabel: "Muscle gain",
    description: "About a 10% surplus for a more deliberate building phase.",
    calorieAdjustmentPct: 0.1,
  },
  {
    value: "rapid_gain",
    label: "Rapid bulk",
    shortLabel: "Rapid bulk",
    description: "About a 15% surplus when gaining weight is the clear priority.",
    calorieAdjustmentPct: 0.15,
  },
];

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
 * For "other" gender, we average male and female formulas.
 */
export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const maleBase = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const femaleBase = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  if (gender === "male") return Math.round(maleBase);
  if (gender === "female") return Math.round(femaleBase);
  return Math.round((maleBase + femaleBase) / 2);
}

/**
 * Calculate Total Daily Energy Expenditure.
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate calorie target based on TDEE and goal.
 */
export function normalizeGoalAggressiveness(
  goal: Goal,
  value?: ProfileInput["goalAggressiveness"],
): GoalAggressiveness {
  if (value && GOAL_AGGRESSIVENESS_OPTIONS.some((option) => option.value === value)) {
    return value as GoalAggressiveness;
  }

  if (value === "mild") {
    if (goal === "gain") return "lean_gain";
    if (goal === "lose") return "gentle_loss";
    return "maintain";
  }
  if (value === "moderate") {
    if (goal === "gain") return "strong_gain";
    if (goal === "lose") return "steady_loss";
    return "maintain";
  }
  if (value === "aggressive") {
    if (goal === "gain") return "rapid_gain";
    if (goal === "lose") return "aggressive_loss";
    return "maintain";
  }

  if (goal === "lose") return "steady_loss";
  if (goal === "gain") return "lean_gain";
  return "maintain";
}

export function calculateCalorieTarget(
  tdee: number,
  goal: Goal,
  goalAggressiveness?: ProfileInput["goalAggressiveness"],
): number {
  const resolved = normalizeGoalAggressiveness(goal, goalAggressiveness);
  const adjustment =
    GOAL_AGGRESSIVENESS_OPTIONS.find((option) => option.value === resolved)?.calorieAdjustmentPct ?? 0;
  const target = tdee * (1 + adjustment);
  return Math.max(1200, Math.round(target)); // minimum 1200 for safety
}

/**
 * Calculate macro gram targets from calorie target.
 *
 * Macro splits by goal:
 * - Lose:     35% protein, 35% carbs, 30% fat
 * - Maintain: 30% protein, 40% carbs, 30% fat
 * - Gain:     30% protein, 45% carbs, 25% fat
 */
export function calculateMacroTargets(profile: ProfileInput): MacroTargets {
  const bmr = calculateBMR(profile.gender, profile.weightKg, profile.heightCm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calories = calculateCalorieTarget(tdee, profile.goal, profile.goalAggressiveness);

  const weightLb = profile.weightKg * 2.20462;
  const resolved = normalizeGoalAggressiveness(profile.goal, profile.goalAggressiveness);
  const proteinPerLb =
    profile.goal === "gain"
      ? resolved === "rapid_gain"
        ? 1
        : 0.9
      : profile.goal === "lose"
        ? resolved === "aggressive_loss"
          ? 1
          : 0.9
        : 0.8;
  const protein = Math.round(weightLb * proteinPerLb);
  const fatPct = profile.goal === "gain" ? 0.25 : 0.28;
  const fat = Math.round((calories * fatPct) / 9);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(80, Math.round((calories - proteinCalories - fatCalories) / 4));

  return {
    calories,
    protein,
    carbs,
    fat,
  };
}

/**
 * Calculate age from date of birth.
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
