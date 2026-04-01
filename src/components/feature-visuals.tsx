"use client";

import { cn } from "@/lib/utils";

/** Photo-based food logging visual — shows a camera viewfinder scanning a plate */
export function FoodLoggingVisual() {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Camera viewfinder */}
      <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center bg-emerald-50/50">
        <span className="text-5xl">📸</span>
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />
        {/* Scanning line */}
        <div className="absolute left-2 right-2 top-1/2 h-px bg-emerald-400/60" />
      </div>
      {/* Arrow */}
      <div className="text-emerald-300 text-2xl font-bold">→</div>
      {/* Result card */}
      <div className="rounded-xl border border-fw-border bg-white p-3 shadow-md text-[10px] space-y-1.5 min-w-[130px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="font-bold text-foreground text-xs">Chicken Bowl</span>
        </div>
        <div className="text-muted-foreground font-medium">520 cal &bull; 42g protein</div>
        <div className="flex gap-1.5 pt-0.5">
          <div className="h-1.5 flex-1 rounded-full bg-emerald-300" />
          <div className="h-1.5 flex-1 rounded-full bg-orange-300" />
          <div className="h-1.5 flex-1 rounded-full bg-violet-300" />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>Protein</span><span>Carbs</span><span>Fat</span>
        </div>
      </div>
    </div>
  );
}

/** Recipe builder visual — shows a recipe card with macro pills */
export function RecipeVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-3xl border border-orange-200/50 shadow-sm">
          🥘
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">Thai Basil Chicken Stir-Fry</p>
          <p className="text-[10px] text-muted-foreground">25 min &bull; 4 ingredients &bull; $3.50/serving</p>
        </div>
      </div>
      <div className="flex gap-2">
        {[
          { label: "480 cal", bg: "bg-emerald-100 text-emerald-700" },
          { label: "38g protein", bg: "bg-orange-100 text-orange-700" },
          { label: "42g carbs", bg: "bg-cyan-100 text-cyan-700" },
          { label: "12g fat", bg: "bg-violet-100 text-violet-700" },
        ].map((p) => (
          <span key={p.label} className={cn("text-[9px] font-semibold px-2 py-1 rounded-full", p.bg)}>
            {p.label}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5 pt-1">
        {["🍗", "🌿", "🍚", "🥜", "🧄"].map((e) => (
          <div key={e} className="w-9 h-9 rounded-lg bg-fw-surface border border-fw-border flex items-center justify-center text-sm shadow-sm">
            {e}
          </div>
        ))}
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-600">
          +2
        </div>
      </div>
    </div>
  );
}

/** Budget visual — shows a budget meter and grocery list */
export function BudgetVisual() {
  return (
    <div className="space-y-3">
      {/* Budget bar */}
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="font-bold text-foreground">Weekly Grocery Budget</span>
        <span className="text-emerald-600 font-bold text-xs">$42 / $60</span>
      </div>
      <div className="h-3 rounded-full bg-fw-border overflow-hidden shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500" style={{ width: "70%" }} />
      </div>
      <p className="text-[9px] text-muted-foreground">$18 remaining &bull; 3 days left this week</p>
      {/* Mini grocery list */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {[
          { item: "Chicken breast", price: "$8.50", emoji: "🍗" },
          { item: "Brown rice", price: "$3.20", emoji: "🍚" },
          { item: "Broccoli", price: "$2.80", emoji: "🥦" },
          { item: "Greek yogurt", price: "$5.40", emoji: "🥛" },
          { item: "Eggs (dozen)", price: "$4.50", emoji: "🥚" },
          { item: "Sweet potato", price: "$3.10", emoji: "🍠" },
        ].map((g) => (
          <div key={g.item} className="flex items-center gap-1.5 text-[9px] bg-white rounded-lg px-2 py-1.5 border border-fw-border/50 shadow-sm">
            <span className="text-sm">{g.emoji}</span>
            <span className="text-foreground truncate flex-1">{g.item}</span>
            <span className="text-muted-foreground font-medium">{g.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Workout visual — shows an exercise card */
export function WorkoutVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-foreground">Upper Body &bull; Push</span>
        <span className="text-[9px] text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">45 min</span>
      </div>
      {[
        { name: "Bench Press", sets: "4×8", weight: "155 lbs", color: "bg-violet-100 border-violet-200", emoji: "🏋️" },
        { name: "Incline DB Press", sets: "3×10", weight: "50 lbs", color: "bg-orange-50 border-orange-200", emoji: "💪" },
        { name: "Cable Flyes", sets: "3×12", weight: "25 lbs", color: "bg-emerald-50 border-emerald-200", emoji: "🔄" },
        { name: "OHP", sets: "3×8", weight: "95 lbs", color: "bg-cyan-50 border-cyan-200", emoji: "⬆️" },
      ].map((ex) => (
        <div key={ex.name} className={cn("flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[10px]", ex.color)}>
          <span className="text-base">{ex.emoji}</span>
          <span className="font-bold text-foreground flex-1">{ex.name}</span>
          <span className="text-muted-foreground">{ex.sets}</span>
          <span className="text-muted-foreground text-[9px]">{ex.weight}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] text-emerald-700 font-semibold">Adapted to your energy level today</span>
      </div>
    </div>
  );
}

/** Understand body visual — shows body metrics */
export function BodyVisual() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Weight", value: "183 lbs", trend: "↓ 1.2", color: "text-emerald-600" },
          { label: "Energy", value: "High", trend: "↑ Good", color: "text-emerald-600" },
          { label: "Sleep", value: "7.5h", trend: "→ Steady", color: "text-cyan-600" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-white border border-fw-border/50 p-2.5 text-center shadow-sm">
            <p className="text-[9px] text-muted-foreground font-medium">{m.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
            <p className={cn("text-[9px] font-semibold mt-0.5", m.color)}>{m.trend}</p>
          </div>
        ))}
      </div>
      {/* Mini trend chart */}
      <div className="flex items-end gap-1 h-10 px-1">
        {[185, 184.5, 184.8, 183.9, 183.5, 183.2, 183].map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className={cn("w-full rounded-t-sm", i === 6 ? "bg-emerald-400" : "bg-emerald-200")}
              style={{ height: `${((w - 182) / 4) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-2.5">
        <p className="text-[9px] text-cyan-700 font-semibold leading-relaxed">
          💡 Your 7-day trend is down 2 lbs — daily fluctuations are normal.
        </p>
      </div>
    </div>
  );
}

/** Progress tracking visual — shows a mini chart */
export function ProgressVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold text-foreground">Weekly Consistency</span>
        <span className="text-emerald-600 font-bold text-xs">92%</span>
      </div>
      {/* Mini bar chart */}
      <div className="flex items-end gap-1.5 h-20">
        {[60, 75, 82, 70, 90, 85, 92].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[7px] text-muted-foreground font-medium">{h}%</span>
            <div
              className={cn("w-full rounded-t transition-all shadow-sm", i === 6 ? "bg-emerald-400" : "bg-emerald-200")}
              style={{ height: `${h}%` }}
            />
            <span className="text-[8px] text-muted-foreground font-medium">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1.5">
        <span className="text-sm">🔥</span>
        <span className="text-[9px] text-emerald-700 font-semibold">12-day streak — your best yet!</span>
      </div>
    </div>
  );
}
