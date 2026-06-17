import {
  Bike,
  Dumbbell,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type WorkoutCategory =
  | "upper"
  | "lower"
  | "full"
  | "core"
  | "mobility"
  | "cardio";

export type WorkoutType =
  | "Strength"
  | "Cardio"
  | "Mobility"
  | "Recovery"
  | "Conditioning";

export interface WorkoutBlock {
  name: string;
  time: string;
  detail: string;
}

export interface WorkoutLibraryItem {
  id: string;
  title: string;
  duration: string;
  intensity: string;
  focus: string;
  category: WorkoutCategory;
  categoryLabel: string;
  workoutType: WorkoutType;
  equipment: string;
  goal: string;
  icon: LucideIcon;
  detail: string;
  summary: string;
  verdict: string;
  why: string;
  fuel: string;
  estimatedBurn: string;
  recoveryCost: string;
  bestFor: string[];
  blocks: WorkoutBlock[];
}

export const workouts: WorkoutLibraryItem[] = [
  {
    id: "low-impact-strength",
    title: "Low-impact strength",
    duration: "34 min",
    intensity: "Moderate",
    focus: "Full body technique",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Strength",
    equipment: "Dumbbells, bench",
    goal: "Technique and low soreness cost",
    icon: Dumbbell,
    detail: "Keeps leg volume gentle while still keeping your training streak going.",
    summary:
      "A controlled full-body session that keeps lower-body volume modest while still giving you a useful training stimulus.",
    verdict: "Recommended today",
    why:
      "FuelWell is using user-entered soreness and meals plus estimated activity. Because leg soreness is elevated, this avoids jumps, sprints, and high-rep squats.",
    fuel: "Eat 25-35g protein within two hours. Add 35-50g carbs before training if lunch was light.",
    estimatedBurn: "210-270 cal",
    recoveryCost: "Low-moderate",
    bestFor: ["Training streak", "Technique", "Low soreness cost"],
    blocks: [
      { name: "Warm-up", time: "6 min", detail: "Easy bike, hip circles, shoulder openers" },
      { name: "Strength circuit", time: "20 min", detail: "Incline push-up, hinge drill, cable row, dead bug" },
      { name: "Cool down", time: "8 min", detail: "Hamstring floss, couch stretch, nasal breathing" },
    ],
  },
  {
    id: "zone-2-ride",
    title: "Zone 2 ride",
    duration: "42 min",
    intensity: "Easy",
    focus: "Aerobic base",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Cardio",
    equipment: "Bike",
    goal: "Aerobic base",
    icon: Bike,
    detail: "Nice if you want to move without adding soreness before tomorrow.",
    summary:
      "A conversational aerobic ride that builds base fitness without asking sore legs for peak output.",
    verdict: "Good alternative",
    why:
      "This stays below interval intensity because FuelWell does not yet have live heart-rate or HRV data connected.",
    fuel: "Hydrate before starting. Add a carb snack if the ride begins more than three hours after lunch.",
    estimatedBurn: "260-360 cal",
    recoveryCost: "Low",
    bestFor: ["Aerobic base", "Low impact", "Steady sweat"],
    blocks: [
      { name: "Ramp", time: "8 min", detail: "Gradually settle into easy breathing" },
      { name: "Steady ride", time: "28 min", detail: "Keep effort at 4-5/10, able to speak in sentences" },
      { name: "Spin down", time: "6 min", detail: "Light cadence, no final push" },
    ],
  },
  {
    id: "mobility-reset",
    title: "Mobility reset",
    duration: "18 min",
    intensity: "Light",
    focus: "Hips and upper back",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Mobility",
    equipment: "Mat",
    goal: "Restore range of motion",
    icon: Waves,
    detail: "A calm reset for the hips and upper back when energy is running low.",
    summary:
      "A short reset for hips, upper back, and breathing when the better choice is protecting tomorrow's training.",
    verdict: "Recovery option",
    why:
      "FuelWell has user-entered soreness but no wearable readiness yet. This option intentionally creates the lowest recovery cost.",
    fuel: "No special pre-fuel needed. Log dinner protein afterward so the recovery estimate improves.",
    estimatedBurn: "45-80 cal",
    recoveryCost: "Very low",
    bestFor: ["Downshifting", "Stiff hips", "Desk posture"],
    blocks: [
      { name: "Downshift", time: "4 min", detail: "Box breathing and easy spinal rotations" },
      { name: "Mobility flow", time: "10 min", detail: "90/90 switches, couch stretch, thoracic reach" },
      { name: "Finish", time: "4 min", detail: "Long exhales, calves, light walk" },
    ],
  },
  {
    id: "upper-push-base",
    title: "Upper push base",
    duration: "38 min",
    intensity: "Moderate",
    focus: "Chest, shoulders, triceps",
    category: "upper",
    categoryLabel: "Upper body",
    workoutType: "Strength",
    equipment: "Dumbbells, cable",
    goal: "Pressing strength",
    icon: Dumbbell,
    detail: "A controlled push session with shoulder-friendly volume.",
    summary:
      "A pressing day that builds chest, shoulders, and triceps while keeping reps crisp and joints quiet.",
    verdict: "Push strength",
    why:
      "This is a good fit when lower body is sore but you still want a real strength session.",
    fuel: "Pair with a protein-forward meal. Add a carb serving if the last meal was more than three hours ago.",
    estimatedBurn: "190-260 cal",
    recoveryCost: "Moderate",
    bestFor: ["Upper body", "Pressing", "Gym day"],
    blocks: [
      { name: "Prime shoulders", time: "6 min", detail: "Band pull-aparts, wall slides, light push-ups" },
      { name: "Main work", time: "24 min", detail: "Dumbbell press, landmine press, cable fly, triceps pressdown" },
      { name: "Reset", time: "8 min", detail: "Pec doorway stretch, lat breathing, easy walk" },
    ],
  },
  {
    id: "upper-pull-posture",
    title: "Upper pull posture",
    duration: "36 min",
    intensity: "Moderate",
    focus: "Back and rear delts",
    category: "upper",
    categoryLabel: "Upper body",
    workoutType: "Strength",
    equipment: "Cable, bands",
    goal: "Rows and posture",
    icon: Dumbbell,
    detail: "Rows, pulldowns, and scapular control for desk-heavy days.",
    summary:
      "A back-focused lift that balances desk posture with rows, pulldowns, rear delts, and carries.",
    verdict: "Posture builder",
    why:
      "This avoids leg fatigue while still giving the day a clear strength target.",
    fuel: "Protein matters most here. A light carb snack helps if you are training late afternoon.",
    estimatedBurn: "180-245 cal",
    recoveryCost: "Moderate",
    bestFor: ["Back strength", "Desk posture", "Upper body"],
    blocks: [
      { name: "Scap prep", time: "6 min", detail: "Band rows, dead hangs, thoracic reach" },
      { name: "Pull session", time: "23 min", detail: "Lat pulldown, cable row, face pull, farmer carry" },
      { name: "Unwind", time: "7 min", detail: "Child's pose reach, neck reset, nasal breathing" },
    ],
  },
  {
    id: "lower-hinge-strength",
    title: "Lower hinge strength",
    duration: "44 min",
    intensity: "Hard",
    focus: "Glutes and hamstrings",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Strength",
    equipment: "Barbell or dumbbells",
    goal: "Posterior chain",
    icon: Dumbbell,
    detail: "Hinge-dominant strength without turning it into a conditioning test.",
    summary:
      "A posterior-chain session for days when energy is high and hamstrings are ready for heavier work.",
    verdict: "Hard strength day",
    why:
      "This is intentionally higher recovery cost, so it belongs on a day with good sleep and lower soreness.",
    fuel: "Have carbs in the prior meal and plan 30g+ protein after. This is not a fasted-session pick.",
    estimatedBurn: "280-380 cal",
    recoveryCost: "High",
    bestFor: ["Glutes", "Hamstrings", "Heavy lifting"],
    blocks: [
      { name: "Ramp", time: "8 min", detail: "Glute bridges, hinge patterning, light RDL sets" },
      { name: "Strength", time: "28 min", detail: "Romanian deadlift, hip thrust, hamstring curl, suitcase carry" },
      { name: "Exit", time: "8 min", detail: "Hamstring floss, hip flexor stretch, easy walk" },
    ],
  },
  {
    id: "lower-knee-friendly",
    title: "Knee-friendly lower",
    duration: "32 min",
    intensity: "Moderate",
    focus: "Glutes, calves, stability",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Strength",
    equipment: "Mini band, dumbbells",
    goal: "Leg work with less knee stress",
    icon: Dumbbell,
    detail: "A lower-body option when knees need a quieter training day.",
    summary:
      "A lower-body session that biases hips, calves, and control instead of high knee flexion.",
    verdict: "Joint-friendlier legs",
    why:
      "This gives lower-body work without asking for deep squats or jump volume.",
    fuel: "A normal meal is enough. Add electrolytes if you are pairing it with a longer walk.",
    estimatedBurn: "170-240 cal",
    recoveryCost: "Low-moderate",
    bestFor: ["Glutes", "Stability", "Knee-sensitive days"],
    blocks: [
      { name: "Prep", time: "6 min", detail: "Banded walks, calf raises, hip airplanes" },
      { name: "Controlled strength", time: "20 min", detail: "Box squat, step-down, hip bridge, calf raise" },
      { name: "Mobility", time: "6 min", detail: "Ankle rocks, quad stretch, low lunge breathing" },
    ],
  },
  {
    id: "core-anti-rotation",
    title: "Core anti-rotation",
    duration: "22 min",
    intensity: "Light",
    focus: "Obliques and trunk control",
    category: "core",
    categoryLabel: "Core",
    workoutType: "Strength",
    equipment: "Cable or band",
    goal: "Bracing and rotation control",
    icon: Dumbbell,
    detail: "Pallof presses, carries, and dead bug variations.",
    summary:
      "A core session built around resisting rotation, holding position, and improving trunk control.",
    verdict: "Core control",
    why:
      "Short core work can fit between heavier sessions without creating much soreness.",
    fuel: "No special pre-fuel needed unless this follows a long cardio session.",
    estimatedBurn: "70-120 cal",
    recoveryCost: "Low",
    bestFor: ["Core", "Bracing", "Short session"],
    blocks: [
      { name: "Brace", time: "4 min", detail: "Crocodile breathing and dead bug practice" },
      { name: "Anti-rotation", time: "14 min", detail: "Pallof press, suitcase carry, side plank, bird dog" },
      { name: "Decompress", time: "4 min", detail: "Child's pose, spinal rocks, long exhales" },
    ],
  },
  {
    id: "core-finisher",
    title: "Core finisher",
    duration: "14 min",
    intensity: "Moderate",
    focus: "Abs and carries",
    category: "core",
    categoryLabel: "Core",
    workoutType: "Conditioning",
    equipment: "Kettlebell optional",
    goal: "Short trunk finisher",
    icon: Dumbbell,
    detail: "A compact finisher when the main workout was short.",
    summary:
      "A short trunk finisher that adds useful density without taking over the whole session.",
    verdict: "Fast add-on",
    why:
      "Use it when today's workout felt too short but you do not want another full lift.",
    fuel: "No special fuel needed. Keep water nearby if pairing with conditioning.",
    estimatedBurn: "80-135 cal",
    recoveryCost: "Low-moderate",
    bestFor: ["Finisher", "Carries", "Time crunch"],
    blocks: [
      { name: "Set up", time: "2 min", detail: "Light plank, hollow hold practice" },
      { name: "Rounds", time: "10 min", detail: "Carry, mountain climber, dead bug, side plank" },
      { name: "Breathe", time: "2 min", detail: "Tall kneeling breathing and spinal flexion" },
    ],
  },
  {
    id: "full-body-circuit",
    title: "Full-body circuit",
    duration: "40 min",
    intensity: "Hard",
    focus: "Push, pull, squat, carry",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Conditioning",
    equipment: "Dumbbells",
    goal: "Sweat and strength blend",
    icon: Dumbbell,
    detail: "Circuit work for days when energy is high and soreness is low.",
    summary:
      "A sweatier full-body circuit that blends strength patterns with conditioning pace.",
    verdict: "High-energy option",
    why:
      "This is better when soreness is low and you want an efficient training effect.",
    fuel: "Eat carbs before this if the last meal was light. Prioritize protein and fluids afterward.",
    estimatedBurn: "300-430 cal",
    recoveryCost: "High",
    bestFor: ["Conditioning", "Full body", "Sweat"],
    blocks: [
      { name: "Warm-up", time: "7 min", detail: "Bike, squat-to-stand, inchworm, light rows" },
      { name: "Circuit", time: "26 min", detail: "Goblet squat, push-up, row, carry, dead bug for 4 rounds" },
      { name: "Cool down", time: "7 min", detail: "Hip flexor stretch, lat stretch, easy breathing" },
    ],
  },
  {
    id: "full-body-minimal",
    title: "Minimal-equipment full body",
    duration: "28 min",
    intensity: "Moderate",
    focus: "Bodyweight strength",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Strength",
    equipment: "Bodyweight",
    goal: "Travel-friendly training",
    icon: Dumbbell,
    detail: "Push-ups, split squats, hinges, and planks with no gym dependency.",
    summary:
      "A practical no-gym session for travel days, home days, or any day when setup needs to be minimal.",
    verdict: "No-equipment fit",
    why:
      "It keeps the movement pattern complete without depending on a gym or equipment availability.",
    fuel: "Normal meal timing is fine. Add protein afterward if this replaces a planned lift.",
    estimatedBurn: "150-220 cal",
    recoveryCost: "Moderate",
    bestFor: ["Travel", "Home workout", "No equipment"],
    blocks: [
      { name: "Prime", time: "5 min", detail: "Squat-to-stand, plank walkout, glute bridge" },
      { name: "Strength", time: "18 min", detail: "Push-up, split squat, single-leg hinge, plank shoulder tap" },
      { name: "Reset", time: "5 min", detail: "Couch stretch, child's pose, calf rocks" },
    ],
  },
  {
    id: "walk-run-intervals",
    title: "Walk-run intervals",
    duration: "30 min",
    intensity: "Moderate",
    focus: "Aerobic conditioning",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Cardio",
    equipment: "Treadmill or outdoors",
    goal: "Build running tolerance",
    icon: Bike,
    detail: "Gentle intervals that keep effort repeatable.",
    summary:
      "A repeatable walk-run session that builds tolerance without turning every interval into a test.",
    verdict: "Cardio builder",
    why:
      "Intervals help you run more total minutes while keeping effort and impact manageable.",
    fuel: "Have a small carb source if training before a meal. Hydrate well if outdoors.",
    estimatedBurn: "220-340 cal",
    recoveryCost: "Moderate",
    bestFor: ["Running base", "Intervals", "Cardio"],
    blocks: [
      { name: "Warm-up walk", time: "6 min", detail: "Easy pace, gradually lengthen stride" },
      { name: "Intervals", time: "20 min", detail: "Alternate 1 min run with 2 min walk at repeatable effort" },
      { name: "Cool down", time: "4 min", detail: "Walk until breathing is easy" },
    ],
  },
  {
    id: "incline-walk",
    title: "Incline walk",
    duration: "35 min",
    intensity: "Easy",
    focus: "Low-impact cardio",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Cardio",
    equipment: "Treadmill",
    goal: "Steps and steady burn",
    icon: Bike,
    detail: "A low-impact cardio option that pairs well with strength days.",
    summary:
      "A steady incline walk for steps, sweat, and recovery-friendly calorie burn.",
    verdict: "Low-impact cardio",
    why:
      "It adds movement without asking for running impact or heavy lifting recovery.",
    fuel: "Hydration is enough for most days. Bring water if the room is warm.",
    estimatedBurn: "190-310 cal",
    recoveryCost: "Low",
    bestFor: ["Steps", "Low impact", "Easy cardio"],
    blocks: [
      { name: "Build", time: "7 min", detail: "Start flat, then raise incline gradually" },
      { name: "Steady climb", time: "23 min", detail: "Keep breathing controlled and posture tall" },
      { name: "Downshift", time: "5 min", detail: "Lower incline and walk easy" },
    ],
  },
  {
    id: "hips-ankles-reset",
    title: "Hips and ankles reset",
    duration: "16 min",
    intensity: "Light",
    focus: "Hips, ankles, calves",
    category: "mobility",
    categoryLabel: "Mobility",
    workoutType: "Mobility",
    equipment: "Mat",
    goal: "Lower-body mobility",
    icon: Waves,
    detail: "Mobility prep for squats, rides, and long walks.",
    summary:
      "A lower-body mobility preview for opening hips, ankles, and calves before training or after a long sit.",
    verdict: "Lower reset",
    why:
      "This sits close to the mobility reset but focuses the work below the waist.",
    fuel: "No pre-fuel needed. Use it before dinner or before a lower-body session.",
    estimatedBurn: "35-65 cal",
    recoveryCost: "Very low",
    bestFor: ["Hips", "Ankles", "Squat prep"],
    blocks: [
      { name: "Open hips", time: "5 min", detail: "90/90 switches, hip flexor pulses, glute bridge hold" },
      { name: "Own ankles", time: "7 min", detail: "Knee-to-wall rocks, calf stretch, tibialis raises" },
      { name: "Integrate", time: "4 min", detail: "Deep squat breathing and easy walking" },
    ],
  },
  {
    id: "upper-back-reset",
    title: "Upper back reset",
    duration: "15 min",
    intensity: "Light",
    focus: "Thoracic spine and shoulders",
    category: "mobility",
    categoryLabel: "Mobility",
    workoutType: "Mobility",
    equipment: "Foam roller optional",
    goal: "Undo desk posture",
    icon: Waves,
    detail: "A quick upper-back flow for breathing and overhead comfort.",
    summary:
      "A shoulder and thoracic reset for desk-heavy days, overhead stiffness, or pre-lift prep.",
    verdict: "Posture reset",
    why:
      "This is the closest option when the goal is moving better rather than training harder.",
    fuel: "No special fuel needed. Treat it like movement hygiene.",
    estimatedBurn: "30-55 cal",
    recoveryCost: "Very low",
    bestFor: ["Upper back", "Shoulders", "Desk posture"],
    blocks: [
      { name: "Release", time: "4 min", detail: "Foam roller extensions or towel-supported breathing" },
      { name: "Reach", time: "7 min", detail: "Thread-the-needle, wall slides, scap push-ups" },
      { name: "Set posture", time: "4 min", detail: "Band pull-aparts and tall breathing" },
    ],
  },
  {
    id: "recovery-walk",
    title: "Recovery walk",
    duration: "25 min",
    intensity: "Easy",
    focus: "Steps and downshift",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Recovery",
    equipment: "None",
    goal: "Move without fatigue",
    icon: Bike,
    detail: "A walk that counts as momentum without draining tomorrow.",
    summary:
      "A recovery-focused walk that keeps your streak alive and helps digestion without creating training debt.",
    verdict: "Recovery day",
    why:
      "This is the lowest-friction option when readiness is uncertain or you are protecting tomorrow.",
    fuel: "No pre-fuel needed. Consider it a walk after a meal when possible.",
    estimatedBurn: "90-160 cal",
    recoveryCost: "Very low",
    bestFor: ["Recovery", "Steps", "After meals"],
    blocks: [
      { name: "Start easy", time: "5 min", detail: "Walk at a pace that lowers stress" },
      { name: "Steady steps", time: "16 min", detail: "Keep shoulders loose and breathing nasal if possible" },
      { name: "Finish calm", time: "4 min", detail: "Slow pace and note how legs feel afterward" },
    ],
  },
];

export function workoutHref(id: string) {
  return `/app/workouts/${id}`;
}

export function getWorkoutById(id: string) {
  return workouts.find((workout) => workout.id === id);
}

export function getAdjacentWorkouts(id: string) {
  const index = workouts.findIndex((workout) => workout.id === id);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: workouts[(index - 1 + workouts.length) % workouts.length],
    next: workouts[(index + 1) % workouts.length],
  };
}

export function getSimilarWorkouts(id: string, limit = 3) {
  const current = getWorkoutById(id);
  if (!current) {
    return [];
  }

  const sameCategory = workouts.filter(
    (workout) => workout.id !== id && workout.category === current.category
  );
  const sameType = workouts.filter(
    (workout) =>
      workout.id !== id &&
      workout.category !== current.category &&
      workout.workoutType === current.workoutType
  );

  return [...sameCategory, ...sameType].slice(0, limit);
}
