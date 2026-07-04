import {
  Bike,
  Dumbbell,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { rankedSearch } from "@/lib/search-utils";

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

export type WorkoutLengthBucket = "under-20" | "20-35" | "35-50" | "50-plus";

export interface WorkoutExercise {
  id: string;
  name: string;
  target: string;
  sets: number;
  reps: string;
  time: string;
  rest: string;
  notes: string;
  graphicHint: string;
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
  targetMuscles?: string[];
  tags?: string[];
  exercisePlan?: WorkoutExercise[];
}

const CURATED_WORKOUTS: WorkoutLibraryItem[] = [
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

type GeneratedWorkoutTemplate = {
  id: string;
  title: string;
  category: WorkoutCategory;
  categoryLabel: string;
  workoutType: WorkoutType;
  equipment: string;
  icon: LucideIcon;
  focus: string;
  goal: string;
  intensity: string;
  minutes: number;
  burn: string;
  recoveryCost: string;
  bestFor: string[];
  blocks: WorkoutBlock[];
};

const workoutTemplates: GeneratedWorkoutTemplate[] = [
  {
    id: "upper-push",
    title: "Upper push",
    category: "upper",
    categoryLabel: "Upper body",
    workoutType: "Strength",
    equipment: "Dumbbells or machines",
    icon: Dumbbell,
    focus: "Chest, shoulders, triceps",
    goal: "Pressing strength",
    intensity: "Moderate",
    minutes: 36,
    burn: "170-260 cal",
    recoveryCost: "Moderate",
    bestFor: ["Chest", "Shoulders", "Pressing"],
    blocks: [
      { name: "Warm-up", time: "6 min", detail: "Band pull-aparts, wall slides, light presses" },
      { name: "Main work", time: "24 min", detail: "Press, incline press, lateral raise, triceps pressdown" },
      { name: "Regression", time: "as needed", detail: "Use machines or reduce range if shoulders feel pinchy" },
    ],
  },
  {
    id: "upper-pull",
    title: "Upper pull",
    category: "upper",
    categoryLabel: "Upper body",
    workoutType: "Strength",
    equipment: "Cable, bands, or dumbbells",
    icon: Dumbbell,
    focus: "Back, rear delts, biceps",
    goal: "Rows and posture",
    intensity: "Moderate",
    minutes: 34,
    burn: "160-245 cal",
    recoveryCost: "Moderate",
    bestFor: ["Back", "Posture", "Pulling"],
    blocks: [
      { name: "Prime", time: "5 min", detail: "Scap rows, dead hangs, thoracic reaches" },
      { name: "Main work", time: "23 min", detail: "Pulldown, row, face pull, curl" },
      { name: "Progression", time: "as ready", detail: "Add load only if reps stay smooth" },
    ],
  },
  {
    id: "lower-squat",
    title: "Lower squat",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Strength",
    equipment: "Dumbbells, rack, or leg press",
    icon: Dumbbell,
    focus: "Quads, glutes, calves",
    goal: "Squat pattern",
    intensity: "Hard",
    minutes: 42,
    burn: "260-390 cal",
    recoveryCost: "High",
    bestFor: ["Leg strength", "Quads", "Glutes"],
    blocks: [
      { name: "Prep", time: "8 min", detail: "Ankle rocks, goblet squat holds, glute bridge" },
      { name: "Main work", time: "27 min", detail: "Squat or press, split squat, calf raise, carry" },
      { name: "Limitation note", time: "as needed", detail: "Swap deep knee flexion for box squats when knees are irritated" },
    ],
  },
  {
    id: "lower-hinge",
    title: "Lower hinge",
    category: "lower",
    categoryLabel: "Lower body",
    workoutType: "Strength",
    equipment: "Barbell, dumbbells, or bands",
    icon: Dumbbell,
    focus: "Hamstrings, glutes, back line",
    goal: "Posterior chain",
    intensity: "Hard",
    minutes: 40,
    burn: "240-360 cal",
    recoveryCost: "High",
    bestFor: ["Glutes", "Hamstrings", "Strength"],
    blocks: [
      { name: "Pattern", time: "7 min", detail: "Hip hinge drill, RDL ramp sets" },
      { name: "Main work", time: "26 min", detail: "RDL, hip thrust, hamstring curl, suitcase carry" },
      { name: "Regression", time: "as needed", detail: "Use a kickstand hinge or cable pull-through if back feels loaded" },
    ],
  },
  {
    id: "core-stability",
    title: "Core stability",
    category: "core",
    categoryLabel: "Core",
    workoutType: "Strength",
    equipment: "Mat, cable, or band",
    icon: Dumbbell,
    focus: "Bracing, anti-rotation, carries",
    goal: "Trunk control",
    intensity: "Light",
    minutes: 22,
    burn: "70-130 cal",
    recoveryCost: "Low",
    bestFor: ["Core", "Back-friendly", "Short session"],
    blocks: [
      { name: "Brace", time: "4 min", detail: "Breathing, dead bug, plank setup" },
      { name: "Main work", time: "14 min", detail: "Pallof press, side plank, carry, bird dog" },
      { name: "Progression", time: "as ready", detail: "Increase lever length before adding load" },
    ],
  },
  {
    id: "zone-2",
    title: "Zone 2",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Cardio",
    equipment: "Bike, treadmill, rower, or outdoors",
    icon: Bike,
    focus: "Aerobic base",
    goal: "Easy steady conditioning",
    intensity: "Easy",
    minutes: 35,
    burn: "180-330 cal",
    recoveryCost: "Low",
    bestFor: ["Aerobic base", "Low impact", "Recovery-friendly"],
    blocks: [
      { name: "Ramp", time: "7 min", detail: "Ease into conversational effort" },
      { name: "Steady work", time: "24 min", detail: "Keep effort at 4-5/10; nasal breathing if possible" },
      { name: "Progression", time: "weekly", detail: "Add 5 minutes before increasing intensity" },
    ],
  },
  {
    id: "intervals",
    title: "Intervals",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Conditioning",
    equipment: "Treadmill, bike, rower, or track",
    icon: Bike,
    focus: "Repeatable harder efforts",
    goal: "Conditioning",
    intensity: "Hard",
    minutes: 28,
    burn: "220-420 cal",
    recoveryCost: "High",
    bestFor: ["Conditioning", "Speed", "Time-efficient"],
    blocks: [
      { name: "Warm-up", time: "8 min", detail: "Easy effort plus two short pickups" },
      { name: "Work", time: "15 min", detail: "Hard/easy repeats while keeping form controlled" },
      { name: "Contraindication", time: "check first", detail: "Skip when sleep, soreness, or injury risk is poor" },
    ],
  },
  {
    id: "mobility-flow",
    title: "Mobility flow",
    category: "mobility",
    categoryLabel: "Mobility",
    workoutType: "Mobility",
    equipment: "Mat",
    icon: Waves,
    focus: "Range of motion and breathing",
    goal: "Move better",
    intensity: "Light",
    minutes: 18,
    burn: "35-80 cal",
    recoveryCost: "Very low",
    bestFor: ["Stiffness", "Recovery", "Warm-up"],
    blocks: [
      { name: "Downshift", time: "3 min", detail: "Slow breathing and spinal rocks" },
      { name: "Flow", time: "12 min", detail: "Hip, ankle, shoulder, and thoracic mobility" },
      { name: "Progression", time: "as ready", detail: "Own the range before adding load or speed" },
    ],
  },
  {
    id: "recovery",
    title: "Recovery",
    category: "cardio",
    categoryLabel: "Cardio",
    workoutType: "Recovery",
    equipment: "None",
    icon: Bike,
    focus: "Easy movement and digestion",
    goal: "Recover without fatigue",
    intensity: "Easy",
    minutes: 24,
    burn: "70-160 cal",
    recoveryCost: "Very low",
    bestFor: ["Recovery", "Steps", "Stress downshift"],
    blocks: [
      { name: "Walk", time: "18 min", detail: "Easy pace, relaxed shoulders, no performance target" },
      { name: "Breathe", time: "4 min", detail: "Long exhales and gentle mobility" },
      { name: "Limitation note", time: "as needed", detail: "Keep it pain-free and shorten it when fatigue is high" },
    ],
  },
  {
    id: "full-body",
    title: "Full-body",
    category: "full",
    categoryLabel: "Full body",
    workoutType: "Strength",
    equipment: "Dumbbells, machines, or bodyweight",
    icon: Dumbbell,
    focus: "Push, pull, hinge, squat, carry",
    goal: "Balanced strength",
    intensity: "Moderate",
    minutes: 38,
    burn: "210-330 cal",
    recoveryCost: "Moderate",
    bestFor: ["Balanced training", "Busy week", "General strength"],
    blocks: [
      { name: "Prepare", time: "6 min", detail: "Squat-to-stand, rows, hinges, easy carry" },
      { name: "Main work", time: "25 min", detail: "One push, one pull, one lower, one core movement" },
      { name: "Regression", time: "as needed", detail: "Use bodyweight and longer rests on low-energy days" },
    ],
  },
];

const variants = [
  { id: "base", label: "base", minutes: 0, intensity: "", focus: "" },
  { id: "beginner", label: "beginner", minutes: -8, intensity: "Easy", focus: "skill and confidence" },
  { id: "advanced", label: "advanced", minutes: 8, intensity: "Hard", focus: "progressive overload" },
  { id: "low-impact", label: "low-impact", minutes: -2, intensity: "Easy", focus: "joint-friendly work" },
  { id: "travel", label: "travel", minutes: -6, intensity: "Moderate", focus: "minimal equipment" },
  { id: "time-crunch", label: "time-crunch", minutes: -12, intensity: "Moderate", focus: "short session" },
  { id: "posture", label: "posture", minutes: -4, intensity: "Light", focus: "position and control" },
  { id: "metabolic", label: "metabolic", minutes: 4, intensity: "Hard", focus: "higher work density" },
  { id: "deload", label: "deload", minutes: -10, intensity: "Light", focus: "reduced recovery cost" },
];

const formats = [
  {
    id: "gym",
    label: "gym",
    equipmentSuffix: "",
    minuteDelta: 0,
    focus: "structured gym work",
  },
  {
    id: "home",
    label: "home",
    equipmentSuffix: "Bodyweight, bands, or dumbbells",
    minuteDelta: -3,
    focus: "home setup",
  },
  {
    id: "machine",
    label: "machine",
    equipmentSuffix: "Machines or cardio equipment",
    minuteDelta: 2,
    focus: "stable machine setup",
  },
  {
    id: "outdoor",
    label: "outdoor",
    equipmentSuffix: "Outdoors or minimal equipment",
    minuteDelta: 4,
    focus: "outdoor movement",
  },
];

const exerciseBank: Record<WorkoutCategory, string[]> = {
  upper: [
    "Incline press",
    "One-arm row",
    "Lat pulldown",
    "Face pull",
    "Lateral raise",
    "Half-kneeling press",
  ],
  lower: [
    "Goblet squat",
    "Romanian deadlift",
    "Step-up",
    "Hip thrust",
    "Calf raise",
    "Lateral lunge",
  ],
  full: [
    "Dumbbell press",
    "Split squat",
    "Cable row",
    "Hinge drill",
    "Farmer carry",
    "Dead bug",
  ],
  core: [
    "Dead bug",
    "Pallof press",
    "Side plank",
    "Suitcase carry",
    "Bird dog",
    "Hollow hold",
  ],
  mobility: [
    "90/90 switch",
    "Thoracic reach",
    "Couch stretch",
    "Ankle rocks",
    "Scapular wall slide",
    "Breathing reset",
  ],
  cardio: [
    "Warm-up walk",
    "Steady effort",
    "Cadence pickup",
    "Recovery interval",
    "Tempo finish",
    "Cool-down walk",
  ],
};

function minutesFromDuration(duration: string) {
  const match = duration.match(/(\d+)/);
  return match ? Number(match[1]) : 30;
}

export function getWorkoutLengthBucket(workout: WorkoutLibraryItem): WorkoutLengthBucket {
  const minutes = minutesFromDuration(workout.duration);
  if (minutes < 20) return "under-20";
  if (minutes <= 35) return "20-35";
  if (minutes <= 50) return "35-50";
  return "50-plus";
}

function buildExercisePlan({
  category,
  title,
  minutes,
  intensity,
}: {
  category: WorkoutCategory;
  title: string;
  minutes: number;
  intensity: string;
}): WorkoutExercise[] {
  const names = exerciseBank[category];
  const count = category === "mobility" ? 5 : category === "cardio" ? 5 : minutes >= 40 ? 6 : 5;
  const sets = intensity === "Hard" ? 4 : intensity === "Light" || category === "mobility" ? 2 : 3;
  return names.slice(0, count).map((name, index) => {
    const isTimed = category === "cardio" || category === "mobility";
    return {
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
      name,
      target:
        category === "upper"
          ? "Chest, back, shoulders, arms"
          : category === "lower"
            ? "Glutes, hamstrings, quads, calves"
            : category === "core"
              ? "Core and trunk control"
              : category === "mobility"
                ? "Range of motion and breathing"
                : category === "cardio"
                  ? "Aerobic system"
                  : "Full-body movement",
      sets: isTimed ? 1 : sets,
      reps: isTimed ? "steady" : index === 0 ? "8-10" : index % 2 === 0 ? "10-12" : "12-15",
      time: isTimed ? `${Math.max(3, Math.round(minutes / count))} min` : "45-60 sec",
      rest: isTimed ? "as needed" : intensity === "Hard" ? "75-90 sec" : "45-60 sec",
      notes:
        index === 0
          ? "Start with a conservative effort and make the first set feel crisp."
          : "Keep form quiet; stop the set before technique falls apart.",
      graphicHint: `Simple form graphic: ${name.toLowerCase()} setup, movement path, and common correction.`,
    };
  });
}

export function getWorkoutExercisePlan(workout: WorkoutLibraryItem): WorkoutExercise[] {
  if (workout.exercisePlan?.length) return workout.exercisePlan;
  const minutes = minutesFromDuration(workout.duration);
  return buildExercisePlan({
    category: workout.category,
    title: workout.id,
    minutes,
    intensity: workout.intensity,
  });
}

function generatedWorkouts(): WorkoutLibraryItem[] {
  return workoutTemplates.flatMap((template) =>
    variants.flatMap((variant) =>
      formats.map((format) => {
      const title =
        variant.id === "base"
          ? `${template.title} ${format.label} builder`
          : variant.id === "posture"
            ? `${template.title} ${format.label} posture tune-up`
            : `${template.title} ${format.label} ${variant.label}`;
      const minutes = Math.max(12, template.minutes + variant.minutes + format.minuteDelta);
      const intensity = variant.intensity || template.intensity;
      const formatFocus = variant.focus || format.focus || template.focus;

      return {
      id: `generated-${template.id}-${variant.id}-${format.id}`,
      title,
      duration: `${minutes} min`,
      intensity,
      focus: formatFocus,
      category: template.category,
      categoryLabel: template.categoryLabel,
      workoutType: template.workoutType,
      equipment:
        format.equipmentSuffix ||
        (variant.id === "travel" || variant.id === "time-crunch"
          ? "Bodyweight or minimal equipment"
          : template.equipment),
      goal: template.goal,
      icon: template.icon,
      detail: `${template.focus} with ${formatFocus} emphasis.`,
      summary: `${template.title} session for ${variant.label} ${format.label} training days, including progressions, regressions, target muscles, and recovery-cost guidance.`,
      verdict: variant.id === "base" ? "Database option" : `${variant.label} option`,
      why: `Use this when the user's goal is ${template.goal.toLowerCase()} and today's context supports ${formatFocus.toLowerCase()}.`,
      fuel:
        template.intensity === "Hard" || intensity === "Hard"
          ? "Prefer a protein-forward meal plus carbs before or after this session."
          : "No special fuel needed beyond hydration and normal protein targets.",
      estimatedBurn: template.burn,
      recoveryCost: variant.id === "deload" ? "Low" : template.recoveryCost,
      bestFor: Array.from(new Set([...template.bestFor, variant.label, format.label])),
      blocks: template.blocks,
      targetMuscles: exerciseBank[template.category].slice(0, 4),
      tags: Array.from(new Set([template.category, template.workoutType, template.goal, variant.label, format.label, intensity])),
      exercisePlan: buildExercisePlan({
        category: template.category,
        title,
        minutes,
        intensity,
      }),
    };
    }),
    ),
  );
}

export const workouts: WorkoutLibraryItem[] = [...CURATED_WORKOUTS, ...generatedWorkouts()];

export const WORKOUT_COUNT = workouts.length;

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

  const currentMinutes = minutesFromDuration(current.duration);
  const currentMuscles = new Set((current.targetMuscles ?? []).map((item) => item.toLowerCase()));
  const currentTags = new Set([
    current.category,
    current.workoutType,
    current.intensity,
    current.recoveryCost,
    current.equipment,
    current.goal,
    ...(current.tags ?? []),
    ...current.bestFor,
  ].map((item) => item.toLowerCase()));

  return workouts
    .filter((workout) => workout.id !== id)
    .map((workout) => {
      const minutes = minutesFromDuration(workout.duration);
      const muscles = new Set((workout.targetMuscles ?? []).map((item) => item.toLowerCase()));
      const tags = [
        workout.category,
        workout.workoutType,
        workout.intensity,
        workout.recoveryCost,
        workout.equipment,
        workout.goal,
        ...(workout.tags ?? []),
        ...workout.bestFor,
      ].map((item) => item.toLowerCase());
      const tagOverlap = tags.filter((tag) => currentTags.has(tag)).length;
      const muscleOverlap = Array.from(muscles).filter((muscle) => currentMuscles.has(muscle)).length;
      const score =
        (workout.category === current.category ? 35 : 0) +
        (workout.workoutType === current.workoutType ? 24 : 0) +
        (workout.intensity === current.intensity ? 14 : 0) +
        (workout.recoveryCost === current.recoveryCost ? 10 : 0) +
        (Math.abs(minutes - currentMinutes) <= 8 ? 8 : 0) +
        muscleOverlap * 8 +
        tagOverlap * 2;
      return { workout, score };
    })
    .sort((a, b) => b.score - a.score || a.workout.title.localeCompare(b.workout.title))
    .slice(0, limit)
    .map(({ workout }) => workout);
}

export function searchWorkouts(query: string, limit = workouts.length): WorkoutLibraryItem[] {
  return rankedSearch(
    workouts,
    query,
    (workout) => [
      workout.title,
      workout.focus,
      workout.goal,
      workout.category,
      workout.categoryLabel,
      workout.workoutType,
      workout.equipment,
      workout.intensity,
      ...(workout.tags ?? []),
      ...(workout.targetMuscles ?? []),
      ...workout.bestFor,
      ...workout.blocks.map((block) => `${block.name} ${block.detail}`),
      ...getWorkoutExercisePlan(workout).map(
        (exercise) => `${exercise.name} ${exercise.target} ${exercise.notes}`,
      ),
    ],
    limit,
  );
}
