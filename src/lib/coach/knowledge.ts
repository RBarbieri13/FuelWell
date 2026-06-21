import { formatMealType, remaining, sumMealItems } from "@/lib/fuelwell-data";
import type { CoachDaySnapshot } from "@/lib/coach/types";

export type CoachKnowledgeBase = {
  userId: string;
  updatedAt: string;
  profileFacts: string[];
  nutritionFacts: string[];
  workoutFacts: string[];
  preferenceFacts: string[];
  bodyFacts: string[];
  progressFacts: string[];
  inferredPatterns: string[];
};

export type CoachProfileKnowledgeInput = {
  display_name?: string | null;
  goal?: string | null;
  activity_level?: string | null;
  dietary_preference?: string | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  allergies?: string[] | null;
  meals_per_day?: number | null;
  experience_level?: string | null;
  preferences_jsonb?: {
    units?: "metric" | "imperial";
    diets?: string[];
    likes?: string[];
    dislikes?: string[];
    onboarding?: Record<string, unknown>;
  } | null;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

export function buildCoachKnowledgeFromProfile(
  userId: string,
  profile: CoachProfileKnowledgeInput,
): CoachKnowledgeBase {
  const preferences = profile.preferences_jsonb ?? {};
  const onboarding = preferences.onboarding ?? {};
  const allergies = list(profile.allergies);
  const diets = list(preferences.diets);
  const likes = list(preferences.likes);
  const dislikes = list(preferences.dislikes);
  const preferredWorkoutTypes = list(onboarding.preferredWorkoutTypes);

  return {
    userId,
    updatedAt: new Date().toISOString(),
    profileFacts: unique([
      profile.display_name ? `User name is ${profile.display_name}.` : "",
      profile.goal ? `Primary goal is ${profile.goal}.` : "",
      profile.activity_level ? `Activity level is ${profile.activity_level}.` : "",
      profile.dietary_preference ? `Dietary preference is ${profile.dietary_preference}.` : "",
      profile.weight_kg ? `Recorded weight is ${profile.weight_kg} kg.` : "",
      profile.height_cm ? `Recorded height is ${profile.height_cm} cm.` : "",
      preferences.units ? `Preferred units are ${preferences.units}.` : "",
    ]),
    nutritionFacts: unique([
      profile.meals_per_day ? `Preferred meal rhythm is ${profile.meals_per_day} meals per day.` : "",
      typeof onboarding.nutritionAggressiveness === "string"
        ? `Nutrition adjustment style is ${onboarding.nutritionAggressiveness}.`
        : "",
      typeof onboarding.dietFlexibility === "string" ? `Diet flexibility preference is ${onboarding.dietFlexibility}.` : "",
      typeof onboarding.groceryBudget === "string" ? `Grocery budget preference is ${onboarding.groceryBudget}.` : "",
      typeof onboarding.cookingHabits === "string" ? `Cooking habit preference is ${onboarding.cookingHabits}.` : "",
    ]),
    workoutFacts: unique([
      profile.experience_level ? `Training experience level is ${profile.experience_level}.` : "",
      typeof onboarding.workoutLocation === "string" ? `Workout location preference is ${onboarding.workoutLocation}.` : "",
      preferredWorkoutTypes.length ? `Preferred workout types: ${preferredWorkoutTypes.join(", ")}.` : "",
    ]),
    preferenceFacts: unique([
      allergies.length ? `Allergies: ${allergies.join(", ")}.` : "No allergies recorded.",
      diets.length ? `Diet filters: ${diets.join(", ")}.` : "",
      likes.length ? `Likes: ${likes.join(", ")}.` : "",
      dislikes.length ? `Dislikes: ${dislikes.join(", ")}.` : "",
      typeof onboarding.coachStyle === "string" ? `Coach style preference is ${onboarding.coachStyle}.` : "",
      typeof onboarding.checkInPreference === "string" ? `Check-in preference is ${onboarding.checkInPreference}.` : "",
    ]),
    bodyFacts: unique([
      profile.weight_kg ? `Profile weight is ${profile.weight_kg} kg.` : "",
      profile.height_cm ? `Profile height is ${profile.height_cm} cm.` : "",
    ]),
    progressFacts: unique([
      "Coach knowledge was bootstrapped from the user's profile and onboarding settings.",
    ]),
    inferredPatterns: [
      "Profile-derived coach knowledge should be refined from logged meals, workouts, body logs, app behavior, and explicit user corrections.",
    ],
  };
}

export function buildCoachKnowledgeBase(userId: string, snapshot: CoachDaySnapshot): CoachKnowledgeBase {
  const meals = snapshot.meals ?? [];
  const workouts = snapshot.workouts ?? [];
  const bodyLog = snapshot.bodyLog ?? [];
  const preferences = {
    ...snapshot.preferences,
    diets: snapshot.preferences?.diets ?? [],
    allergies: snapshot.preferences?.allergies ?? [],
    likes: snapshot.preferences?.likes ?? [],
    dislikes: snapshot.preferences?.dislikes ?? [],
  };
  const profile = snapshot.profile ?? {};
  const targets = snapshot.targets ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const totals = snapshot.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const mealTotals = meals.map((meal) => {
    const totals = sumMealItems(meal.items);
    return `${formatMealType(meal.mealType)} "${meal.name}" logged ${totals.calories} kcal, ${totals.protein}g protein, ${totals.carbs}g carbs, ${totals.fat}g fat.`;
  });

  const workoutFacts = workouts.map((workout) =>
    `${workout.name} logged as ${workout.category} for ${workout.durationMin} min${workout.calories ? ` and ${workout.calories} active calories` : ""}.`
  );

  const latestBody = bodyLog.at(-1);
  const remainingCalories = remaining(totals.calories, targets.calories);
  const remainingProtein = remaining(totals.protein, targets.protein);

  const proteinProgress = targets.protein
    ? Math.round((totals.protein / targets.protein) * 100)
    : 0;

  return {
    userId,
    updatedAt: new Date().toISOString(),
    profileFacts: unique([
      profile.displayName ? `User name is ${profile.displayName}.` : "",
      profile.goal ? `Primary goal is ${profile.goal}.` : "",
      profile.activityLevel ? `Activity level is ${profile.activityLevel}.` : "",
      profile.dietaryPreference ? `Dietary preference is ${profile.dietaryPreference}.` : "",
      profile.weightKg ? `Recorded weight is ${profile.weightKg} kg.` : "",
      profile.heightCm ? `Recorded height is ${profile.heightCm} cm.` : "",
      preferences.units ? `Preferred units are ${preferences.units}.` : "",
    ]),
    nutritionFacts: unique([
      `Today totals are ${totals.calories}/${targets.calories} kcal, ${totals.protein}/${targets.protein}g protein, ${totals.carbs}/${targets.carbs}g carbs, ${totals.fat}/${targets.fat}g fat.`,
      `Today remaining is ${remainingCalories} kcal and ${remainingProtein}g protein.`,
      ...mealTotals,
    ]),
    workoutFacts: unique(workoutFacts),
    preferenceFacts: unique([
      preferences.allergies.length ? `Allergies: ${preferences.allergies.join(", ")}.` : "No allergies recorded.",
      preferences.diets.length ? `Diet filters: ${preferences.diets.join(", ")}.` : "",
      preferences.likes.length ? `Likes: ${preferences.likes.join(", ")}.` : "",
      preferences.dislikes.length ? `Dislikes: ${preferences.dislikes.join(", ")}.` : "",
    ]),
    bodyFacts: unique([
      latestBody?.weightKg ? `Latest body log weight is ${latestBody.weightKg} kg on ${latestBody.date}.` : "",
      latestBody?.mood ? `Latest body log mood is ${latestBody.mood}/5.` : "",
      latestBody?.waterMl ? `Latest body log water is ${latestBody.waterMl} ml.` : "",
    ]),
    progressFacts: unique([
      `${meals.length} meals and ${workouts.length} workouts are visible in today's app state.`,
      `Protein progress is about ${proteinProgress}% of target.`,
      snapshot.goalPlan ? `Active goal plan is ${snapshot.goalPlan.primaryGoal} with ${snapshot.goalPlan.trainingPriority} priority.` : "",
      snapshot.integration ? `${snapshot.integration.sourceLabel} integration status is ${snapshot.integration.status}.` : "",
    ]),
    inferredPatterns: unique([
      meals.length === 0 ? "Nutrition context is sparse today; ask for or infer less." : "",
      proteinProgress < 50 ? "Protein is behind pace today." : "Protein is on track or ahead today.",
      workouts.length === 0 ? "No workout has been logged today." : "",
      preferences.allergies.length ? "Food recommendations must filter allergy conflicts first." : "",
    ]),
  };
}

export function mergeCoachKnowledge(
  existing: CoachKnowledgeBase | null | undefined,
  next: CoachKnowledgeBase,
): CoachKnowledgeBase {
  if (!existing || existing.userId !== next.userId) return next;
  return {
    userId: next.userId,
    updatedAt: next.updatedAt,
    profileFacts: unique([...existing.profileFacts, ...next.profileFacts]).slice(-40),
    nutritionFacts: unique([...existing.nutritionFacts, ...next.nutritionFacts]).slice(-80),
    workoutFacts: unique([...existing.workoutFacts, ...next.workoutFacts]).slice(-80),
    preferenceFacts: unique([...existing.preferenceFacts, ...next.preferenceFacts]).slice(-60),
    bodyFacts: unique([...existing.bodyFacts, ...next.bodyFacts]).slice(-60),
    progressFacts: unique([...existing.progressFacts, ...next.progressFacts]).slice(-60),
    inferredPatterns: unique([...existing.inferredPatterns, ...next.inferredPatterns]).slice(-60),
  };
}

export function retrieveCoachKnowledge(
  knowledge: CoachKnowledgeBase,
  userText: string,
): Pick<
  CoachKnowledgeBase,
  "profileFacts" | "nutritionFacts" | "workoutFacts" | "preferenceFacts" | "bodyFacts" | "progressFacts" | "inferredPatterns"
> {
  const text = userText.toLowerCase();
  const wantsNutrition = /meal|food|eat|calorie|protein|carb|fat|recipe|grocery|menu|restaurant/.test(text);
  const wantsWorkout = /workout|exercise|run|walk|lift|training|fitness|move|cardio|strength/.test(text);
  const wantsBody = /weight|body|composition|goal|progress|scale|fat|muscle/.test(text);

  return {
    profileFacts: knowledge.profileFacts.slice(-10),
    nutritionFacts: wantsNutrition || !wantsWorkout ? knowledge.nutritionFacts.slice(-14) : knowledge.nutritionFacts.slice(-5),
    workoutFacts: wantsWorkout ? knowledge.workoutFacts.slice(-14) : knowledge.workoutFacts.slice(-5),
    preferenceFacts: knowledge.preferenceFacts.slice(-10),
    bodyFacts: wantsBody ? knowledge.bodyFacts.slice(-10) : knowledge.bodyFacts.slice(-4),
    progressFacts: knowledge.progressFacts.slice(-10),
    inferredPatterns: knowledge.inferredPatterns.slice(-10),
  };
}

export function formatKnowledgeForPrompt(
  knowledge: ReturnType<typeof retrieveCoachKnowledge>,
): string {
  const section = (label: string, rows: string[]) =>
    rows.length ? `${label}:\n${rows.map((row) => `- ${row}`).join("\n")}` : `${label}:\n- No durable facts yet.`;

  return [
    "Retrieved user-specific coach knowledge:",
    section("Confirmed profile facts", knowledge.profileFacts),
    section("Nutrition history and current state", knowledge.nutritionFacts),
    section("Workout history and current state", knowledge.workoutFacts),
    section("Preferences and restrictions", knowledge.preferenceFacts),
    section("Body composition and body logs", knowledge.bodyFacts),
    section("Progress and adherence", knowledge.progressFacts),
    section("Inferred patterns to treat as uncertain", knowledge.inferredPatterns),
  ].join("\n");
}
