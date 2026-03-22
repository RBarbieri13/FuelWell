"use client";

import { cn } from "@/lib/utils";

/** Photo-based food logging visual — shows a camera viewfinder scanning a plate */
export function FoodLoggingVisual() {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Camera viewfinder */}
      <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-emerald-300 flex items-center justify-center bg-emerald-50/50">
        <span className="text-3xl">📸</span>
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br" />
      </div>
      {/* Arrow */}
      <div className="text-emerald-300 text-lg">→</div>
      {/* Result card */}
      <div className="rounded-lg border border-fw-border bg-white p-2 shadow-sm text-[9px] space-y-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-foreground">Chicken Bowl</span>
        </div>
        <div className="text-muted-foreground">520 cal • 42g protein</div>
        <div className="flex gap-1">
          <div className="h-1 flex-1 rounded-full bg-emerald-300" />
          <div className="h-1 flex-1 rounded-full bg-orange-300" />
          <div className="h-1 flex-1 rounded-full bg-violet-300" />
        </div>
      </div>
    </div>
  );
}

/** Recipe builder visual — shows a recipe card with macro pills */
export function RecipeVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-xl border border-orange-200/50">
          🥘
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-foreground truncate">Thai Basil Chicken Stir-Fry</p>
          <p className="text-[9px] text-muted-foreground">25 min • 4 ingredients</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {[
          { label: "480 cal", bg: "bg-emerald-100 text-emerald-700" },
          { label: "38g protein", bg: "bg-orange-100 text-orange-700" },
          { label: "$3.50", bg: "bg-violet-100 text-violet-700" },
        ].map((p) => (
          <span key={p.label} className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded-full", p.bg)}>
            {p.label}
          </span>
        ))}
      </div>
      <div className="flex gap-1 pt-1">
        {["🍗", "🌿", "🍚", "🥜"].map((e) => (
          <div key={e} className="w-7 h-7 rounded-md bg-fw-surface border border-fw-border flex items-center justify-center text-xs">
            {e}
          </div>
        ))}
        <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[9px] font-semibold text-emerald-600">
          +3
        </div>
      </div>
    </div>
  );
}

/** Budget visual — shows a budget meter and grocery list */
export function BudgetVisual() {
  return (
    <div className="space-y-2">
      {/* Budget bar */}
      <div className="flex items-center justify-between text-[9px] mb-1">
        <span className="font-semibold text-foreground">Weekly Budget</span>
        <span className="text-emerald-600 font-semibold">$42 / $60</span>
      </div>
      <div className="h-2.5 rounded-full bg-fw-border overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: "70%" }} />
      </div>
      {/* Mini grocery list */}
      <div className="grid grid-cols-2 gap-1 pt-1">
        {[
          { item: "Chicken breast", price: "$8.50" },
          { item: "Brown rice", price: "$3.20" },
          { item: "Broccoli", price: "$2.80" },
          { item: "Greek yogurt", price: "$5.40" },
        ].map((g) => (
          <div key={g.item} className="flex items-center justify-between text-[8px] bg-white rounded-md px-1.5 py-1 border border-fw-border/50">
            <span className="text-foreground truncate">{g.item}</span>
            <span className="text-muted-foreground ml-1">{g.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Workout visual — shows an exercise card */
export function WorkoutVisual() {
  return (
    <div className="space-y-1.5">
      {[
        { name: "Bench Press", sets: "4×8", color: "bg-violet-100 border-violet-200", emoji: "🏋️" },
        { name: "Squats", sets: "4×6", color: "bg-orange-50 border-orange-200", emoji: "🦵" },
        { name: "Pull-ups", sets: "3×10", color: "bg-emerald-50 border-emerald-200", emoji: "💪" },
      ].map((ex) => (
        <div key={ex.name} className={cn("flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[9px]", ex.color)}>
          <span className="text-sm">{ex.emoji}</span>
          <span className="font-semibold text-foreground flex-1">{ex.name}</span>
          <span className="text-muted-foreground">{ex.sets}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 pt-1">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-[8px] text-emerald-600 font-medium">Adapted to your energy level today</span>
      </div>
    </div>
  );
}

/** Understand body visual — shows body metrics */
export function BodyVisual() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Weight", value: "183 lbs", trend: "↓ 1.2" },
          { label: "Energy", value: "High", trend: "↑" },
          { label: "Sleep", value: "7.5h", trend: "→" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-white border border-fw-border/50 p-1.5 text-center">
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
            <p className="text-[10px] font-bold text-foreground">{m.value}</p>
            <p className="text-[8px] text-emerald-600 font-medium">{m.trend}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-1.5">
        <p className="text-[8px] text-cyan-700 font-medium">
          💡 Weight fluctuation is normal — your 7-day trend is what matters
        </p>
      </div>
    </div>
  );
}

/** Progress tracking visual — shows a mini chart */
export function ProgressVisual() {
  return (
    <div className="space-y-2">
      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-14">
        {[60, 75, 82, 70, 90, 85, 92].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className={cn("w-full rounded-t-sm transition-all", i === 6 ? "bg-emerald-400" : "bg-emerald-200")}
              style={{ height: `${h}%` }}
            />
            <span className="text-[7px] text-muted-foreground">
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-muted-foreground">This week</span>
        <span className="text-emerald-600 font-semibold">92% consistency</span>
      </div>
    </div>
  );
}
