"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type Goal = "cut" | "maintain" | "bulk";

const ACTIVITY_MULTIPLIERS: Record<Activity, { value: number; label: string; sub: string }> = {
  sedentary: { value: 1.2, label: "Sedentary", sub: "Desk job, little exercise" },
  light: { value: 1.375, label: "Light", sub: "1\u20133 workouts/week" },
  moderate: { value: 1.55, label: "Moderate", sub: "3\u20135 workouts/week" },
  active: { value: 1.725, label: "Active", sub: "6\u20137 workouts/week" },
  veryActive: { value: 1.9, label: "Very Active", sub: "Twice-a-day training" },
};

const GOAL_DELTA: Record<Goal, { value: number; label: string; proteinPerLb: number; fatPct: number }> = {
  cut: { value: -500, label: "Cut (lose fat)", proteinPerLb: 1.0, fatPct: 0.25 },
  maintain: { value: 0, label: "Maintain", proteinPerLb: 0.85, fatPct: 0.28 },
  bulk: { value: 300, label: "Bulk (gain muscle)", proteinPerLb: 0.9, fatPct: 0.28 },
};

function mifflinStJeor(sex: Sex, weightLb: number, heightIn: number, age: number): number {
  const kg = weightLb * 0.453592;
  const cm = heightIn * 2.54;
  return sex === "male"
    ? 10 * kg + 6.25 * cm - 5 * age + 5
    : 10 * kg + 6.25 * cm - 5 * age - 161;
}

export function MacroCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(32);
  const [weight, setWeight] = useState(180);
  const [height, setHeight] = useState(70);
  const [activity, setActivity] = useState<Activity>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");

  const result = useMemo(() => {
    const bmr = mifflinStJeor(sex, weight, height, age);
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity].value;
    const calories = Math.round(tdee + GOAL_DELTA[goal].value);
    const proteinG = Math.round(weight * GOAL_DELTA[goal].proteinPerLb);
    const fatG = Math.round((calories * GOAL_DELTA[goal].fatPct) / 9);
    const carbG = Math.max(
      0,
      Math.round((calories - proteinG * 4 - fatG * 9) / 4)
    );
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories, proteinG, fatG, carbG };
  }, [sex, age, weight, height, activity, goal]);

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-stretch">
      {/* Inputs */}
      <div className="rounded-3xl border-2 border-fw-border bg-white p-6 md:p-8 shadow-card-premium">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-fw-accent mb-3">
            <Flame className="h-3.5 w-3.5" />
            Interactive preview
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Personalized Macro Calculator
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter your stats to see the exact calories and macros FuelWell would
            start you with. Real Mifflin&ndash;St Jeor math, no guesswork.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Sex</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={cn(
                    "rounded-xl border-2 py-2.5 text-sm font-medium capitalize transition-all",
                    sex === s
                      ? "border-fw-accent bg-emerald-50 text-fw-accent"
                      : "border-fw-border bg-white text-muted-foreground hover:border-fw-accent/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <SliderRow
            label="Age"
            value={age}
            min={18}
            max={80}
            suffix=" yrs"
            onChange={setAge}
          />
          <SliderRow
            label="Weight"
            value={weight}
            min={90}
            max={350}
            suffix=" lb"
            onChange={setWeight}
          />
          <SliderRow
            label="Height"
            value={height}
            min={54}
            max={84}
            format={(v) => `${Math.floor(v / 12)}\u2032 ${v % 12}\u2033`}
            onChange={setHeight}
          />

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Activity Level</label>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as Activity[]).map((a) => {
                const info = ACTIVITY_MULTIPLIERS[a];
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setActivity(a)}
                    className={cn(
                      "rounded-xl border-2 px-3 py-2 text-left transition-all",
                      activity === a
                        ? "border-fw-accent bg-emerald-50"
                        : "border-fw-border bg-white hover:border-fw-accent/40"
                    )}
                  >
                    <div className={cn("text-sm font-semibold", activity === a ? "text-fw-accent" : "text-foreground")}>
                      {info.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{info.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wide">Goal</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(GOAL_DELTA) as Goal[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={cn(
                    "rounded-xl border-2 py-2.5 text-xs font-semibold transition-all",
                    goal === g
                      ? "border-fw-accent bg-emerald-50 text-fw-accent"
                      : "border-fw-border bg-white text-muted-foreground hover:border-fw-accent/40"
                  )}
                >
                  {GOAL_DELTA[g].label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-emerald-50/80 via-white to-violet-50/80 p-6 md:p-8 shadow-phone relative overflow-hidden flex flex-col">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-violet-200/25 blur-3xl" />

        <div className="relative flex-1 flex flex-col">
          <p className="text-xs font-semibold text-fw-accent uppercase tracking-wider">Your starting plan</p>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
            {GOAL_DELTA[goal].label}
          </h3>

          {/* Calorie ring */}
          <div className="flex items-center justify-center my-6">
            <CalorieRing calories={result.calories} tdee={result.tdee} />
          </div>

          {/* Macro pills */}
          <div className="grid grid-cols-3 gap-3">
            <MacroPill
              label="Protein"
              grams={result.proteinG}
              percent={Math.round(((result.proteinG * 4) / result.calories) * 100)}
              icon={Beef}
              color="from-orange-400 to-amber-400"
              bg="bg-orange-50"
              text="text-orange-600"
            />
            <MacroPill
              label="Carbs"
              grams={result.carbG}
              percent={Math.round(((result.carbG * 4) / result.calories) * 100)}
              icon={Wheat}
              color="from-emerald-400 to-teal-400"
              bg="bg-emerald-50"
              text="text-emerald-600"
            />
            <MacroPill
              label="Fat"
              grams={result.fatG}
              percent={Math.round(((result.fatG * 9) / result.calories) * 100)}
              icon={Droplet}
              color="from-violet-400 to-purple-400"
              bg="bg-violet-50"
              text="text-violet-600"
            />
          </div>

          <div className="mt-6 pt-5 border-t border-fw-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>BMR</span>
              <span className="font-mono text-foreground">{result.bmr.toLocaleString()} kcal</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
              <span>TDEE</span>
              <span className="font-mono text-foreground">{result.tdee.toLocaleString()} kcal</span>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-muted-foreground/80 leading-relaxed">
            Starting point only. FuelWell recalibrates your targets every week based on real
            weight trends, training load, and hunger.
          </p>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  suffix,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</label>
        <span className="text-base font-bold text-fw-accent tabular-nums">
          {format ? format(value) : `${value}${suffix ?? ""}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-fw-border appearance-none cursor-pointer accent-emerald-500 range-emerald"
        style={{
          background: `linear-gradient(to right, rgb(52 211 153) 0%, rgb(52 211 153) ${((value - min) / (max - min)) * 100}%, rgb(226 232 240) ${((value - min) / (max - min)) * 100}%, rgb(226 232 240) 100%)`,
        }}
      />
    </div>
  );
}

function CalorieRing({ calories, tdee }: { calories: number; tdee: number }) {
  const display = Math.max(1000, calories);
  const max = Math.max(3500, tdee + 600);
  const pct = Math.min(1, display / max);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <defs>
          <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="14"
          fill="none"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          stroke="url(#calGrad)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          key={calories}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-4xl font-extrabold text-foreground tabular-nums"
        >
          {calories.toLocaleString()}
        </motion.p>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
          kcal / day
        </p>
      </div>
    </div>
  );
}

function MacroPill({
  label,
  grams,
  percent,
  icon: Icon,
  color,
  bg,
  text,
}: {
  label: string;
  grams: number;
  percent: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-fw-border/60 p-3 text-center shadow-sm">
      <div className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
        <Icon className={cn("h-4 w-4", text)} />
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-2">
        {label}
      </p>
      <motion.p
        key={grams}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-foreground tabular-nums mt-0.5"
      >
        {grams}
        <span className="text-xs text-muted-foreground ml-0.5">g</span>
      </motion.p>
      <div className="mt-2 h-1.5 rounded-full bg-fw-border/50 overflow-hidden">
        <motion.div
          className={cn("h-full bg-gradient-to-r", color)}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">{percent}%</p>
    </div>
  );
}