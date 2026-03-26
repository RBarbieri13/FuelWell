/**
 * Mifflin-St Jeor equation for BMR calculation
 * and macro target computation based on user profile.
 */

export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

interface ProfileInput {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
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

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

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
export function calculateCalorieTarget(tdee: number, goal: Goal): number {
  const target = tdee + GOAL_CALORIE_ADJUSTMENT[goal];
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
  const calories = calculateCalorieTarget(tdee, profile.goal);

  const splits: Record<Goal, { protein: number; carbs: number; fat: number }> = {
    lose: { protein: 0.35, carbs: 0.35, fat: 0.3 },
    maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    gain: { protein: 0.3, carbs: 0.45, fat: 0.25 },
  };

  const split = splits[profile.goal];

  return {
    calories,
    protein: Math.round((calories * split.protein) / 4), // 4 cal/g protein
    carbs: Math.round((calories * split.carbs) / 4), // 4 cal/g carbs
    fat: Math.round((calories * split.fat) / 9), // 9 cal/g fat
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
