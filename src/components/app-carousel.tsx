"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Shared: iOS Status Bar ─── */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-semibold text-foreground/80">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" className="opacity-80">
          <rect x="0" y="7" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
          <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor" className="opacity-80">
          <path d="M7 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          <path d="M3.5 7.5a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M1 5a8 8 0 0112 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="22" height="11" viewBox="0 0 22 11" className="opacity-80">
          <rect x="0" y="0.5" width="19" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="1.5" y="2" width="14" height="7" rx="1" fill="#34D399" />
          <rect x="20" y="3" width="2" height="5" rx="0.5" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Shared: Bottom Tab Bar ─── */
function TabBar({ active = 0 }: { active?: number }) {
  const tabs = [
    { label: "Home", icon: "🏠" },
    { label: "Meals", icon: "🍽️" },
    { label: "Workout", icon: "💪" },
    { label: "Profile", icon: "👤" },
  ];
  return (
    <div className="flex items-end justify-around px-4 pt-2 pb-1 border-t border-fw-border/40 bg-white/80 backdrop-blur-sm">
      {tabs.map((tab, i) => (
        <div key={tab.label} className="flex flex-col items-center gap-0.5 py-1">
          <span className={cn("text-sm", i === active ? "" : "opacity-50")}>{tab.icon}</span>
          <span className={cn("text-[8px] font-medium", i === active ? "text-emerald-600" : "text-muted-foreground/60")}>
            {tab.label}
          </span>
          {i === active && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
        </div>
      ))}
    </div>
  );
}

/* ─── Screen 1: Coach / Dashboard ─── */
function CoachScreen() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-white to-emerald-50/30">
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-1 pb-3">
        <p className="text-[11px] text-muted-foreground font-medium">Good morning, Robert</p>
        <h3 className="text-lg font-bold text-foreground mt-0.5">Today&apos;s Dashboard</h3>
      </div>

      {/* Calorie ring with glow */}
      <div className="flex justify-center mb-3">
        <div className="relative w-36 h-36">
          {/* Glow behind ring */}
          <div className="absolute inset-2 rounded-full bg-emerald-400/10 blur-xl animate-glow-pulse" />
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 gradient-ring-glow relative z-10">
            <defs>
              <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="carbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F4945E" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient id="fatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" stroke="#E2E8F0" strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r="52" stroke="url(#calGrad)" strokeWidth="8" fill="none"
              strokeDasharray={`${0.72 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              strokeLinecap="round" />
            <circle cx="60" cy="60" r="42" stroke="#E2E8F0" strokeWidth="6" fill="none" />
            <circle cx="60" cy="60" r="42" stroke="url(#carbGrad)" strokeWidth="6" fill="none"
              strokeDasharray={`${0.65 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
              strokeLinecap="round" />
            <circle cx="60" cy="60" r="33" stroke="#E2E8F0" strokeWidth="5" fill="none" />
            <circle cx="60" cy="60" r="33" stroke="url(#fatGrad)" strokeWidth="5" fill="none"
              strokeDasharray={`${0.45 * 2 * Math.PI * 33} ${2 * Math.PI * 33}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-2xl font-bold text-foreground">1,847</span>
            <span className="text-[10px] text-muted-foreground">of 2,550 cal</span>
          </div>
        </div>
      </div>

      {/* Macro bars with gradients */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-3">
        {[
          { label: "Protein", value: "128g", target: "165g", pct: 78, gradient: "from-emerald-400 to-cyan-400" },
          { label: "Carbs", value: "195g", target: "280g", pct: 70, gradient: "from-orange-400 to-amber-400" },
          { label: "Fat", value: "52g", target: "85g", pct: 61, gradient: "from-violet-400 to-purple-400" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-xs font-semibold text-foreground">{m.value}</p>
            <div className="h-2 rounded-full bg-fw-border/60 mt-1 overflow-hidden shadow-inner">
              <div className={cn("h-full rounded-full bg-gradient-to-r", m.gradient)} style={{ width: `${m.pct}%` }} />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{m.target} goal</p>
          </div>
        ))}
      </div>

      {/* Glassmorphic AI Coach Tip */}
      <div className="px-5 mt-auto pb-2">
        <div className="glass-card rounded-xl p-3 border border-emerald-200/40">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">✨</span>
            <p className="text-[10px] font-bold text-emerald-700">AI Coach Tip</p>
          </div>
          <p className="text-[11px] text-emerald-600/90 leading-relaxed">
            You&apos;re 37g short on protein. Try adding Greek yogurt or a protein shake to hit your goal tonight.
          </p>
        </div>
      </div>

      <TabBar active={0} />
    </div>
  );
}

/* ─── Screen 2: Recipe Builder ─── */
function RecipeScreen() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-white to-orange-50/20">
      <StatusBar />

      <div className="px-5 pt-1 pb-2">
        <h3 className="text-lg font-bold text-foreground">AI Recipe Builder</h3>
        <p className="text-[11px] text-muted-foreground">Personalized to your macros</p>
      </div>

      {/* Recipe card */}
      <div className="px-5 flex-1">
        <div className="rounded-2xl overflow-hidden border border-fw-border/60 shadow-card-premium">
          {/* Food image area */}
          <div className="h-36 bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-200 flex items-center justify-center relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.6) 0%, transparent 40%)" }} />
            <div className="text-5xl relative z-10 drop-shadow-sm">🥗</div>
            {/* Save icon */}
            <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <span className="text-xs">♡</span>
            </div>
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-emerald-600 shadow-sm">
              ⏱ Under 25 min
            </div>
          </div>
          <div className="p-3.5">
            <h4 className="font-semibold text-sm text-foreground">Mediterranean Chicken Bowl</h4>
            {/* Star rating */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] text-amber-400">★★★★★</span>
              <span className="text-[8px] text-muted-foreground">(4.8)</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Grilled chicken, quinoa, roasted veggies, feta, lemon tahini dressing
            </p>
            {/* Macro pills with shadows */}
            <div className="flex gap-1.5 mt-2.5">
              {[
                { label: "520 cal", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { label: "42g protein", color: "bg-orange-50 text-orange-700 border-orange-100" },
                { label: "$4.80", color: "bg-violet-50 text-violet-700 border-violet-100" },
              ].map((p) => (
                <span key={p.label} className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border shadow-sm", p.color)}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl border border-fw-border/60 p-2.5 text-center bg-white shadow-sm hover:shadow-card transition-shadow">
            <span className="text-lg">🛒</span>
            <p className="text-[9px] font-medium text-foreground mt-1">Add to Grocery List</p>
          </div>
          <div className="rounded-xl border border-fw-border/60 p-2.5 text-center bg-white shadow-sm hover:shadow-card transition-shadow">
            <span className="text-lg">🔄</span>
            <p className="text-[9px] font-medium text-foreground mt-1">Swap Ingredients</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-2 pt-2">
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 p-2.5 text-center shadow-sm">
          <p className="text-[10px] font-semibold text-orange-700">Generate Another Recipe →</p>
        </div>
      </div>

      <TabBar active={1} />
    </div>
  );
}

/* ─── Screen 3: Workout ─── */
function WorkoutScreen() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-white to-violet-50/20">
      <StatusBar />

      <div className="px-5 pt-1 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Today&apos;s Workout</h3>
            <p className="text-[11px] text-muted-foreground">Upper Body • Push Focus</p>
          </div>
          {/* Mini progress ring */}
          <div className="relative w-11 h-11">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" stroke="#E2E8F0" strokeWidth="3" fill="none" />
              <circle cx="18" cy="18" r="15" stroke="#8B5CF6" strokeWidth="3" fill="none"
                strokeDasharray={`${0 * 2 * Math.PI * 15} ${2 * Math.PI * 15}`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-violet-600">0/5</span>
          </div>
        </div>
      </div>

      {/* Energy badge */}
      <div className="px-5 mb-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 px-3 py-1 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-700">Energy: High — Full intensity</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-5 flex-1 space-y-1.5">
        {[
          { name: "Bench Press", sets: "4×8", weight: "155 lbs", emoji: "🏋️", active: true },
          { name: "Incline DB Press", sets: "3×10", weight: "50 lbs", emoji: "💪", active: false },
          { name: "Cable Flyes", sets: "3×12", weight: "25 lbs", emoji: "🔄", active: false },
          { name: "Overhead Press", sets: "3×8", weight: "95 lbs", emoji: "⬆️", active: false },
          { name: "Lateral Raises", sets: "3×15", weight: "20 lbs", emoji: "🦅", active: false },
        ].map((ex, i) => (
          <div key={ex.name} className={cn(
            "flex items-center gap-2.5 rounded-xl border p-2.5 transition-all",
            ex.active
              ? "border-violet-200 bg-violet-50/80 shadow-sm border-l-[3px] border-l-violet-400"
              : "border-fw-border/50 bg-white"
          )}>
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              ex.active ? "bg-violet-100 text-violet-600" : "bg-fw-surface text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{ex.name}</p>
              <p className="text-[9px] text-muted-foreground">{ex.sets} • {ex.weight}</p>
            </div>
            {/* Set completion dots */}
            <div className="flex gap-0.5">
              {Array.from({ length: parseInt(ex.sets[0]) }).map((_, j) => (
                <div key={j} className={cn("w-1.5 h-1.5 rounded-full", "border border-fw-border/60 bg-white")} />
              ))}
            </div>
            {ex.active && (
              <span className="text-[8px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">Next</span>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pb-2 pt-2">
        <div className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 p-2.5 text-center shadow-md">
          <p className="text-[11px] font-bold text-white">▶ Start Workout</p>
        </div>
      </div>

      <TabBar active={2} />
    </div>
  );
}

/* ─── Screen 4: Progress ─── */
function ProgressScreen() {
  const chartData = [2480, 2350, 2520, 2280, 2400, 2320, 2380];
  const min = Math.min(...chartData) - 100;
  const max = Math.max(...chartData) + 100;
  const normalize = (v: number) => 80 - ((v - min) / (max - min)) * 60;

  const points = chartData.map((v, i) => `${i * (200 / 6)},${normalize(v)}`).join(" ");
  const areaPath = `M0,${normalize(chartData[0])} ${chartData.map((v, i) => `L${i * (200 / 6)},${normalize(v)}`).join(" ")} L${200},${normalize(chartData[6])} L200,85 L0,85 Z`;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-white to-cyan-50/20">
      <StatusBar />

      <div className="px-5 pt-1 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Weekly Progress</h3>
          <p className="text-[11px] text-muted-foreground">Mar 16 – Mar 22, 2026</p>
        </div>
        {/* Achievement badge */}
        <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-2 py-1 shadow-sm">
          <span className="text-xs">🔥</span>
          <span className="text-[8px] font-bold text-amber-700">4 Week</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Avg Calories", value: "2,380", change: "-170", color: "from-emerald-50/80 to-teal-50/50" },
          { label: "Protein Avg", value: "152g", change: "+12g", color: "from-orange-50/80 to-amber-50/50" },
          { label: "Workouts", value: "4/5", change: "On track", color: "from-violet-50/80 to-purple-50/50" },
          { label: "Weight", value: "183.2", change: "-1.4 lbs", color: "from-cyan-50/80 to-blue-50/50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border border-fw-border/40 p-2.5 bg-gradient-to-br shadow-sm", s.color)}>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{s.value}</p>
            <p className="text-[9px] font-semibold text-emerald-600 mt-0.5">
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* SVG Area Chart */}
      <div className="px-5 mb-2">
        <div className="rounded-xl border border-fw-border/40 p-3 bg-white shadow-sm">
          <p className="text-[10px] font-semibold text-foreground mb-2">Calorie Trend (7 days)</p>
          <svg viewBox="0 0 200 90" className="w-full h-16">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[20, 40, 60, 80].map((y) => (
              <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#E2E8F0" strokeWidth="0.5" />
            ))}
            {/* Area fill */}
            <path d={areaPath} fill="url(#areaFill)" />
            {/* Line */}
            <polyline points={points} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {chartData.map((v, i) => (
              <circle key={i} cx={i * (200 / 6)} cy={normalize(v)} r={i === 6 ? 3.5 : 2.5}
                fill={i === 6 ? "#34D399" : "white"} stroke="#34D399" strokeWidth="1.5" />
            ))}
            {/* Day labels */}
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <text key={i} x={i * (200 / 6)} y="89" textAnchor="middle" fill="#94A3B8" fontSize="7">{d}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* AI insight */}
      <div className="px-5 pb-2 mt-auto">
        <div className="glass-card rounded-xl p-3 border border-cyan-200/40">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">💡</span>
            <p className="text-[10px] font-bold text-cyan-700">Weekly Insight</p>
          </div>
          <p className="text-[11px] text-cyan-600/90 leading-relaxed">
            Great week! Protein consistency improved 18% and you&apos;re trending toward your goal weight by May.
          </p>
        </div>
      </div>

      <TabBar active={0} />
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
      <div className="absolute -inset-8 bg-gradient-to-br from-emerald-200/60 via-transparent to-orange-200/50 rounded-[3.5rem] blur-3xl animate-pulse-glow" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-[3px] border-gray-200/80 bg-white shadow-phone overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-[22px] bg-foreground/95 rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-foreground/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
        </div>

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
              className="absolute inset-0 pt-7"
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
        className="absolute left-[-24px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-fw-border shadow-card-premium hover:shadow-lg hover:border-fw-accent/40 transition-all duration-200 z-10"
        aria-label="Previous screen"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={() => navigate(1)}
        className="absolute right-[-24px] top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-fw-border shadow-card-premium hover:shadow-lg hover:border-fw-accent/40 transition-all duration-200 z-10"
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
