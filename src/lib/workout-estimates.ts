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
    id: "yoga-mobility",
    label: "Yoga / mobility",
    category: "Mobility",
    met: 2.5,
    detail: "Mobility, stretching, breath-led yoga, and recovery sessions.",
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
