export type ExerciseDiagram = {
  name: string;
  displayName: string;
  imageUrl?: string;
  sourceLabel: string;
  sourceUrl?: string;
  equipment?: string;
  primaryMuscles: string[];
  cues: string[];
  fallbackLabel: string;
};

const FREE_EXERCISE_DB_RAW =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export const TOP_EXERCISE_DIAGRAM_NAMES = [
  "Dumbbell press",
  "Dumbbell bench press",
  "Barbell bench press",
  "Incline press",
  "Push-up",
  "Landmine press",
  "Overhead press",
  "Dumbbell shoulder press",
  "Arnold press",
  "Lateral raise",
  "Front raise",
  "Cable fly",
  "Triceps pressdown",
  "Dips",
  "Lat pulldown",
  "Pull-up",
  "Chin-up",
  "Cable row",
  "Seated cable row",
  "One-arm row",
  "Dumbbell row",
  "Barbell row",
  "Face pull",
  "Rear delt fly",
  "Biceps curl",
  "Hammer curl",
  "Goblet squat",
  "Back squat",
  "Front squat",
  "Box squat",
  "Split squat",
  "Bulgarian split squat",
  "Step-up",
  "Step-down",
  "Reverse lunge",
  "Lateral lunge",
  "Leg press",
  "Leg extension",
  "Calf raise",
  "Romanian deadlift",
  "Deadlift",
  "Hip thrust",
  "Glute bridge",
  "Hamstring curl",
  "Cable pull-through",
  "Kettlebell swing",
  "Hinge drill",
  "Farmer carry",
  "Suitcase carry",
  "Dead bug",
  "Bird dog",
  "Pallof press",
  "Plank",
  "Side plank",
  "Hollow hold",
  "Mountain climber",
  "Cable crunch",
  "Hanging leg raise",
  "Russian twist",
  "Bear crawl",
  "90/90 switch",
  "Thoracic reach",
  "Couch stretch",
  "Ankle rocks",
  "Scapular wall slide",
  "Wall slide",
  "Child's pose",
  "Hip airplane",
  "Banded walk",
  "Glute med walk",
  "Warm-up walk",
  "Incline walk",
  "Steady effort",
  "Cadence pickup",
  "Recovery interval",
  "Tempo finish",
  "Cool-down walk",
  "Rowing machine intervals",
  "Jump rope",
  "Burpee",
  "Dumbbell thruster",
  "Bodyweight squat",
  "Air squat",
  "Walking lunge",
  "Bench step-up",
  "Cable rotation",
  "Medicine ball slam",
  "Battle ropes",
  "Elliptical",
  "Stationary bike",
  "Zone 2 ride",
  "Swimming laps",
  "Yoga flow",
  "Pilates bridge",
  "Mobility flow",
  "Breathing reset",
  "Hamstring floss",
  "Hip flexor stretch",
  "Tibialis raise",
  "Deep squat breathing",
  "Suitcase march",
  "Inchworm",
  "Squat-to-stand",
  "Band pull-apart",
  "Dead hang",
  "Crocodile breathing",
] as const;

const IMAGE_ALIASES: Record<string, { slug: string; displayName: string; equipment?: string; muscles: string[] }> = {
  "dumbbell press": {
    slug: "Decline_Dumbbell_Bench_Press/0.jpg",
    displayName: "Dumbbell bench press",
    equipment: "Dumbbells, bench",
    muscles: ["Chest", "Shoulders", "Triceps"],
  },
  "dumbbell bench press": {
    slug: "Decline_Dumbbell_Bench_Press/0.jpg",
    displayName: "Dumbbell bench press",
    equipment: "Dumbbells, bench",
    muscles: ["Chest", "Shoulders", "Triceps"],
  },
  "barbell bench press": {
    slug: "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
    displayName: "Barbell bench press",
    equipment: "Barbell, bench",
    muscles: ["Chest", "Shoulders", "Triceps"],
  },
  "split squat": {
    slug: "Barbell_Side_Split_Squat/0.jpg",
    displayName: "Split squat",
    equipment: "Bodyweight or load",
    muscles: ["Quads", "Glutes", "Adductors"],
  },
  "cable row": {
    slug: "Seated_Cable_Rows/0.jpg",
    displayName: "Seated cable row",
    equipment: "Cable",
    muscles: ["Lats", "Upper back", "Biceps"],
  },
  "seated cable row": {
    slug: "Seated_Cable_Rows/0.jpg",
    displayName: "Seated cable row",
    equipment: "Cable",
    muscles: ["Lats", "Upper back", "Biceps"],
  },
  "romanian deadlift": {
    slug: "Romanian_Deadlift/0.jpg",
    displayName: "Romanian deadlift",
    equipment: "Barbell or dumbbells",
    muscles: ["Hamstrings", "Glutes", "Back line"],
  },
  "goblet squat": {
    slug: "Goblet_Squat/0.jpg",
    displayName: "Goblet squat",
    equipment: "Dumbbell or kettlebell",
    muscles: ["Quads", "Glutes", "Core"],
  },
  "push-up": {
    slug: "Pushups/0.jpg",
    displayName: "Push-up",
    equipment: "Bodyweight",
    muscles: ["Chest", "Shoulders", "Triceps", "Core"],
  },
  "plank": {
    slug: "Plank/0.jpg",
    displayName: "Plank",
    equipment: "Bodyweight",
    muscles: ["Core", "Shoulders", "Glutes"],
  },
  "face pull": {
    slug: "Face_Pull/0.jpg",
    displayName: "Face pull",
    equipment: "Cable or band",
    muscles: ["Rear delts", "Upper back", "Rotator cuff"],
  },
  "lat pulldown": {
    slug: "Close-Grip_Front_Lat_Pulldown/0.jpg",
    displayName: "Lat pulldown",
    equipment: "Cable machine",
    muscles: ["Lats", "Upper back", "Biceps"],
  },
  "dead bug": {
    slug: "Dead_Bug/0.jpg",
    displayName: "Dead bug",
    equipment: "Mat",
    muscles: ["Core", "Hip flexors", "Trunk control"],
  },
  "pallof press": {
    slug: "Pallof_Press/0.jpg",
    displayName: "Pallof press",
    equipment: "Cable or band",
    muscles: ["Obliques", "Core", "Glutes"],
  },
  "side plank": {
    slug: "Side_Bridge/0.jpg",
    displayName: "Side plank",
    equipment: "Mat",
    muscles: ["Obliques", "Shoulders", "Glutes"],
  },
  "mountain climber": {
    slug: "Mountain_Climbers/0.jpg",
    displayName: "Mountain climber",
    equipment: "Bodyweight",
    muscles: ["Core", "Hip flexors", "Shoulders"],
  },
};

const MUSCLE_HINTS: Array<{ pattern: RegExp; muscles: string[]; equipment?: string }> = [
  { pattern: /press|push|dip|fly/i, muscles: ["Chest", "Shoulders", "Triceps"] },
  { pattern: /row|pull|pulldown|curl|hang/i, muscles: ["Back", "Lats", "Biceps"] },
  { pattern: /squat|lunge|step|calf|leg/i, muscles: ["Quads", "Glutes", "Calves"] },
  { pattern: /deadlift|hinge|thrust|bridge|hamstring|swing/i, muscles: ["Hamstrings", "Glutes", "Back line"] },
  { pattern: /plank|bug|bird|pallof|core|crunch|twist|hollow/i, muscles: ["Core", "Trunk control"] },
  { pattern: /walk|ride|bike|row|rope|interval|tempo|swim/i, muscles: ["Aerobic system", "Legs", "Heart"] },
  { pattern: /stretch|mobility|90\/90|reach|ankle|wall|breathing|pose/i, muscles: ["Mobility", "Breathing", "Range of motion"] },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9/]+/g, " ").trim();
}

function inferMuscles(name: string) {
  return MUSCLE_HINTS.find((hint) => hint.pattern.test(name))?.muscles ?? ["Full body", "Control", "Technique"];
}

export function getExerciseDiagram(name: string): ExerciseDiagram {
  const normalized = normalize(name);
  const exact = IMAGE_ALIASES[normalized];
  const alias =
    exact ??
    Object.entries(IMAGE_ALIASES).find(([key]) => normalized.includes(key) || key.includes(normalized))?.[1];

  if (alias) {
    return {
      name,
      displayName: alias.displayName,
      imageUrl: `${FREE_EXERCISE_DB_RAW}/${alias.slug}`,
      sourceLabel: "Free Exercise DB",
      sourceUrl: "https://github.com/yuhonas/free-exercise-db",
      equipment: alias.equipment,
      primaryMuscles: alias.muscles,
      cues: [
        "Set up slowly before the first rep.",
        "Keep the movement path controlled.",
        "Stop the set before form breaks down.",
      ],
      fallbackLabel: `${alias.displayName} setup, movement path, and finish position.`,
    };
  }

  return {
    name,
    displayName: name,
    sourceLabel: "FuelWell exercise library",
    equipment: "As programmed",
    primaryMuscles: inferMuscles(name),
    cues: [
      "Start with a conservative effort.",
      "Move through the range you can control.",
      "Use the notes field if you substitute equipment.",
    ],
    fallbackLabel: `${name} form guide: setup, controlled movement path, and common correction.`,
  };
}
