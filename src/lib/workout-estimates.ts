import type { WorkoutEntry } from "@/lib/coach/types";

export type ManualActivityOption = {
  id: string;
  label: string;
  category: string;
  met: number;
  defaultPaceMph?: number;
  distanceLabel?: string;
  detail: string;
};

export const PROFILE_WEIGHT_KG = 82;
export const PROFILE_WEIGHT_LB = 181;
export const PROFILE_AGE = 38;

export const MANUAL_ACTIVITY_OPTIONS: ManualActivityOption[] = [
  {
    id: "walking",
    label: "Walking",
    category: "Cardio",
    met: 3.5,
    defaultPaceMph: 3,
    distanceLabel: "Easy walk",
    detail: "Neighborhood walks, errands, and steps that deserve activity credit.",
  },
  {
    id: "hiking",
    label: "Hiking",
    category: "Cardio",
    met: 6,
    defaultPaceMph: 2.4,
    distanceLabel: "Trail miles",
    detail: "Trail walks, hills, uneven terrain, and loaded outdoor movement.",
  },
  {
    id: "running",
    label: "Running",
    category: "Cardio",
    met: 9.8,
    defaultPaceMph: 6,
    distanceLabel: "Run miles",
    detail: "Steady runs, treadmill miles, or outdoor pace work.",
  },
  {
    id: "interval-training",
    label: "Interval training",
    category: "Conditioning",
    met: 8,
    detail: "HIIT, circuits, sprints, and mixed conditioning sessions.",
  },
  {
    id: "swimming",
    label: "Swimming",
    category: "Cardio",
    met: 6,
    defaultPaceMph: 1.5,
    distanceLabel: "Swim miles",
    detail: "Laps, steady pool work, and aerobic swimming sessions.",
  },
  {
    id: "biking",
    label: "Biking",
    category: "Cardio",
    met: 7.5,
    defaultPaceMph: 12,
    distanceLabel: "Ride miles",
    detail: "Road, indoor, or casual bike rides when the exact workout is not in the database.",
  },
  {
    id: "rowing",
    label: "Rowing",
    category: "Cardio",
    met: 7,
    defaultPaceMph: 5,
    distanceLabel: "Row miles",
    detail: "Erg, rower, or steady rowing intervals.",
  },
  {
    id: "elliptical",
    label: "Elliptical",
    category: "Cardio",
    met: 5,
    detail: "Low-impact cardio machine work.",
  },
  {
    id: "stair-climber",
    label: "Stair climber",
    category: "Cardio",
    met: 8.8,
    detail: "Stair machine work, stadium steps, and sustained climbing efforts.",
  },
  {
    id: "jump-rope",
    label: "Jump rope",
    category: "Conditioning",
    met: 11.8,
    detail: "Rope intervals, boxing warmups, and high-output conditioning blocks.",
  },
  {
    id: "strength-training",
    label: "Strength training",
    category: "Strength",
    met: 5,
    detail: "General lifting, machines, dumbbells, and mixed resistance sessions.",
  },
  {
    id: "pilates",
    label: "Pilates",
    category: "Mobility",
    met: 3,
    detail: "Mat or reformer work focused on core control, stability, and range.",
  },
  {
    id: "yoga-mobility",
    label: "Yoga / mobility",
    category: "Mobility",
    met: 2.5,
    detail: "Mobility, stretching, breath-led yoga, and recovery sessions.",
  },
  {
    id: "boxing",
    label: "Boxing",
    category: "Conditioning",
    met: 7.8,
    detail: "Bag work, mitts, sparring-style conditioning, and boxing classes.",
  },
  {
    id: "martial-arts",
    label: "Martial arts",
    category: "Conditioning",
    met: 10.3,
    detail: "Grappling, striking, drills, and mixed martial arts classes.",
  },
  {
    id: "tennis",
    label: "Tennis",
    category: "Sport",
    met: 7.3,
    detail: "Singles, doubles, clinics, and match-play court sessions.",
  },
  {
    id: "pickleball",
    label: "Pickleball",
    category: "Sport",
    met: 5,
    detail: "Casual or competitive pickleball games and drills.",
  },
  {
    id: "basketball",
    label: "Basketball",
    category: "Sport",
    met: 8,
    detail: "Pickup, shooting drills, full-court play, and conditioning runs.",
  },
  {
    id: "soccer",
    label: "Soccer",
    category: "Sport",
    met: 10,
    detail: "Games, drills, small-sided play, and sustained field work.",
  },
  {
    id: "golf-walking",
    label: "Golf, walking",
    category: "Sport",
    met: 4.8,
    defaultPaceMph: 2.8,
    distanceLabel: "Course miles",
    detail: "Walking rounds, carrying clubs, or push-cart rounds.",
  },
  {
    id: "skiing",
    label: "Skiing",
    category: "Sport",
    met: 7,
    detail: "Downhill skiing, sustained snow sessions, and mountain days.",
  },
  {
    id: "dancing",
    label: "Dancing",
    category: "Cardio",
    met: 5.5,
    detail: "Dance classes, social dancing, and sustained movement sessions.",
  },
];

export function estimateMinutesFromDistance(option: ManualActivityOption, distanceMiles: number) {
  if (!option.defaultPaceMph || distanceMiles <= 0) return 0;
  return Math.round((distanceMiles / option.defaultPaceMph) * 60);
}

export function estimateWorkoutCalories({
  met,
  minutes,
  weightKg = PROFILE_WEIGHT_KG,
}: {
  met: number;
  minutes: number;
  weightKg?: number;
}) {
  if (minutes <= 0 || weightKg <= 0) return 0;
  return Math.round(((met * 3.5 * weightKg) / 200) * minutes);
}

export function buildManualWorkoutEntry({
  option,
  minutes,
  distanceMiles,
  calories,
}: {
  option: ManualActivityOption;
  minutes: number;
  distanceMiles?: number;
  calories: number;
}): WorkoutEntry {
  const id = `manual-${option.id}-${Date.now()}`;
  return {
    id,
    name: option.label,
    category: option.category,
    durationMin: minutes,
    calories,
    distanceMiles,
    met: option.met,
    source: "manual_activity",
    loggedAt: new Date().toISOString(),
    notes: distanceMiles
      ? `${option.detail} Distance: ${distanceMiles.toFixed(1)} mi.`
      : option.detail,
  };
}
