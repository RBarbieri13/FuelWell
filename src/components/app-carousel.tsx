"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Screen Data ─── */

function CoachScreen() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 rounded-sm bg-foreground/30" />
          <div className="w-1.5 h-2 rounded-sm bg-foreground/20" />
          <div className="w-3 h-2 rounded-full bg-foreground/30" />
        </div>
      </div>

      {/* Header */}
      <div className="px-5 pt-2 pb-4">
        <p className="text-xs text-muted-foreground font-medium">Good morning, Robert</p>
        <h3 className="text-lg font-bold text-foreground mt-0.5">Today&apos;s Dashboard</h3>
      </div>

      {/* Calorie ring */}
      <div className="flex justify-center mb-4">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" stroke="#E2E8F0" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="52" stroke="#34D399" strokeWidth="8" fill="none"
              strokeDasharray={`${0.72 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              strokeLinecap="round" className="transition-all duration-1000" />
            <circle cx="60" cy="60" r="42" stroke="#E2E8F0" strokeWidth="6" fill="none" />
            <circle cx="60" cy="60" r="42" stroke="#F4945E" strokeWidth="6" fill="none"
              strokeDasharray={`${0.65 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
              strokeLinecap="round" />
            <circle cx="60" cy="60" r="33" stroke="#E2E8F0" strokeWidth="5" fill="none" />
            <circle cx="60" cy="60" r="33" stroke="#818CF8" strokeWidth="5" fill="none"
              strokeDasharray={`${0.45 * 2 * Math.PI * 33} ${2 * Math.PI * 33}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">1,847</span>
            <span className="text-[10px] text-muted-foreground">of 2,550 cal</span>
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Protein", value: "128g", target: "165g", pct: 78, color: "bg-emerald-400" },
          { label: "Carbs", value: "195g", target: "280g", pct: 70, color: "bg-orange-400" },
          { label: "Fat", value: "52g", target: "85g", pct: 61, color: "bg-violet-400" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-xs font-semibold text-foreground">{m.value}</p>
            <div className="h-1.5 rounded-full bg-fw-border mt-1 overflow-hidden">
              <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.pct}%` }} />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{m.target} goal</p>
          </div>
        ))}
      </div>

      {/* AI suggestion */}
      <div className="px-5 mt-auto pb-5">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
          <p className="text-[10px] font-semibold text-emerald-700 mb-1">AI Coach Tip</p>
          <p className="text-xs text-emerald-600 leading-relaxed">
            You&apos;re 37g short on protein. Try adding Greek yogurt or a protein shake to hit your goal tonight.
          </p>
        </div>
      </div>
    </div>
  );
}

function RecipeScreen() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 rounded-sm bg-foreground/30" />
          <div className="w-1.5 h-2 rounded-sm bg-foreground/20" />
          <div className="w-3 h-2 rounded-full bg-foreground/30" />
        </div>
      </div>

      <div className="px-5 pt-2 pb-3">
        <h3 className="text-lg font-bold text-foreground">AI Recipe Builder</h3>
        <p className="text-xs text-muted-foreground">Personalized to your macros</p>
      </div>

      {/* Recipe card */}
      <div className="px-5 flex-1">
        <div className="rounded-2xl overflow-hidden border border-fw-border shadow-card">
          {/* Image placeholder */}
          <div className="h-32 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex items-center justify-center relative">
            <div className="text-4xl">🥗</div>
            <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 text-[9px] font-semibold text-emerald-600 shadow-sm">
              Under 25 min
            </div>
          </div>
          <div className="p-3.5">
            <h4 className="font-semibold text-sm text-foreground">Mediterranean Chicken Bowl</h4>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Grilled chicken, quinoa, roasted veggies, feta, lemon tahini dressing
            </p>
            {/* Macro pills */}
            <div className="flex gap-2 mt-2.5">
              {[
                { label: "520 cal", color: "bg-emerald-50 text-emerald-700" },
                { label: "42g protein", color: "bg-orange-50 text-orange-700" },
                { label: "$4.80", color: "bg-violet-50 text-violet-700" },
              ].map((p) => (
                <span key={p.label} className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full", p.color)}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl border border-fw-border p-2.5 text-center bg-fw-surface">
            <span className="text-lg">🛒</span>
            <p className="text-[9px] font-medium text-foreground mt-1">Add to Grocery List</p>
          </div>
          <div className="rounded-xl border border-fw-border p-2.5 text-center bg-fw-surface">
            <span className="text-lg">🔄</span>
            <p className="text-[9px] font-medium text-foreground mt-1">Swap Ingredients</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <div className="rounded-xl bg-orange-50 border border-orange-100 p-2.5 text-center">
          <p className="text-[10px] font-semibold text-orange-700">Generate Another Recipe →</p>
        </div>
      </div>
    </div>
  );
}

function WorkoutScreen() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 rounded-sm bg-foreground/30" />
          <div className="w-1.5 h-2 rounded-sm bg-foreground/20" />
          <div className="w-3 h-2 rounded-full bg-foreground/30" />
        </div>
      </div>

      <div className="px-5 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Today&apos;s Workout</h3>
            <p className="text-xs text-muted-foreground">Upper Body • Push Focus</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <span className="text-lg">💪</span>
          </div>
        </div>
      </div>

      {/* Energy badge */}
      <div className="px-5 mb-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-700">Energy: High — Full intensity recommended</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-5 flex-1 space-y-2">
        {[
          { name: "Bench Press", sets: "4×8", weight: "155 lbs", emoji: "🏋️" },
          { name: "Incline Dumbbell Press", sets: "3×10", weight: "50 lbs", emoji: "💪" },
          { name: "Cable Flyes", sets: "3×12", weight: "25 lbs", emoji: "🔄" },
          { name: "Overhead Press", sets: "3×8", weight: "95 lbs", emoji: "⬆️" },
          { name: "Lateral Raises", sets: "3×15", weight: "20 lbs", emoji: "🦅" },
        ].map((ex, i) => (
          <div key={ex.name} className={cn(
            "flex items-center gap-3 rounded-xl border p-2.5",
            i === 0 ? "border-violet-200 bg-violet-50" : "border-fw-border bg-white"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-fw-border text-sm shadow-sm">
              {ex.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{ex.name}</p>
              <p className="text-[9px] text-muted-foreground">{ex.sets} • {ex.weight}</p>
            </div>
            {i === 0 && (
              <span className="text-[9px] font-semibold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">Active</span>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 pt-2">
        <div className="rounded-xl bg-violet-50 border border-violet-100 p-2.5 text-center">
          <p className="text-[10px] font-semibold text-violet-700">Start Workout Timer →</p>
        </div>
      </div>
    </div>
  );
}

function ProgressScreen() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-2 text-[10px] text-muted-foreground">
        <span className="font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 rounded-sm bg-foreground/30" />
          <div className="w-1.5 h-2 rounded-sm bg-foreground/20" />
          <div className="w-3 h-2 rounded-full bg-foreground/30" />
        </div>
      </div>

      <div className="px-5 pt-2 pb-3">
        <h3 className="text-lg font-bold text-foreground">Weekly Progress</h3>
        <p className="text-xs text-muted-foreground">Mar 16 – Mar 22, 2026</p>
      </div>

      {/* Stats grid */}
      <div className="px-5 grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Avg Calories", value: "2,380", change: "-170", good: true },
          { label: "Protein Avg", value: "152g", change: "+12g", good: true },
          { label: "Workouts", value: "4/5", change: "On track", good: true },
          { label: "Weight", value: "183.2", change: "-1.4 lbs", good: true },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-fw-border p-2.5 bg-fw-surface">
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{s.value}</p>
            <p className={cn("text-[9px] font-medium mt-0.5", s.good ? "text-emerald-600" : "text-red-500")}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Mini chart */}
      <div className="px-5 mb-3">
        <div className="rounded-xl border border-fw-border p-3 bg-white">
          <p className="text-[10px] font-semibold text-foreground mb-2">Calorie Trend (7 days)</p>
          <div className="flex items-end gap-1.5 h-16">
            {[75, 85, 68, 90, 82, 78, 72].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn("w-full rounded-t-sm", i === 6 ? "bg-emerald-400" : "bg-emerald-200")}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[7px] text-muted-foreground">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI insight */}
      <div className="px-5 pb-5 mt-auto">
        <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3">
          <p className="text-[10px] font-semibold text-cyan-700 mb-1">Weekly Insight</p>
          <p className="text-xs text-cyan-600 leading-relaxed">
            Great week! Your protein consistency improved 18% and you&apos;re trending toward your goal weight by May.
          </p>
        </div>
      </div>
    </div>
  );
}

const screens = [
  { label: "Coach", component: CoachScreen },
  { label: "Recipes", component: RecipeScreen },
  { label: "Workout", component: WorkoutScreen },
  { label: "Progress", component: ProgressScreen },
];

/* ─── Carousel Component ─── */

export function AppCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigate = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + screens.length) % screens.length);
  }, []);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => navigate(1), 5000);
    return () => clearInterval(timer);
  }, [navigate]);

  const Screen = screens[current].component;

  return (
    <div className="relative max-w-md mx-auto">
      {/* Glow */}
      <div className="absolute -inset-6 bg-gradient-to-br from-emerald-200/50 via-transparent to-orange-200/40 rounded-[3rem] blur-2xl animate-pulse-glow" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[3px] border-fw-border/80 bg-white shadow-xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/90 rounded-b-2xl z-20" />

        {/* Screen content */}
        <div className="relative h-[580px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ x: direction >= 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -300 : 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 pt-6"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home indicator */}
        <div className="h-6 flex items-center justify-center bg-white">
          <div className="w-28 h-1 rounded-full bg-foreground/15" />
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-[-20px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-fw-border shadow-md hover:shadow-lg hover:border-fw-accent/40 transition-all duration-200 z-10"
        aria-label="Previous screen"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={() => navigate(1)}
        className="absolute right-[-20px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-fw-border shadow-md hover:shadow-lg hover:border-fw-accent/40 transition-all duration-200 z-10"
        aria-label="Next screen"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Dot indicators + labels */}
      <div className="flex items-center justify-center gap-3 mt-6">
        {screens.map((screen, i) => (
          <button
            key={screen.label}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              i === current
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-fw-surface"
            )}
          >
            {screen.label}
          </button>
        ))}
      </div>
    </div>
  );
}
