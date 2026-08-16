"use client";

import { cn } from "@/lib/utils";

/** Photo-based food logging visual — shows a camera viewfinder scanning a plate */
export function FoodLoggingVisual() {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Camera viewfinder */}
      <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-emerald-300/80 flex items-center justify-center bg-gradient-to-br from-emerald-50/80 to-teal-50/40">
        <span className="text-5xl drop-shadow-sm">📸</span>
        {/* Corner brackets — thicker with glow */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-[2.5px] border-l-[2.5px] border-emerald-400 rounded-tl" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-[2.5px] border-r-[2.5px] border-emerald-400 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[2.5px] border-l-[2.5px] border-emerald-400 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[2.5px] border-r-[2.5px] border-emerald-400 rounded-br" />
        {/* Animated scanning line */}
        <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line" />
        {/* Pulsing scanning indicator */}
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      {/* Arrow */}
      <div className="text-emerald-300 text-2xl font-bold">→</div>
      {/* Result card */}
      <div className="rounded-xl border border-fw-border/60 bg-white shadow-card-premium text-[10px] min-w-[130px] overflow-hidden">
        {/* Gradient header */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        <div className="p-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400" />
            <span className="font-bold text-foreground text-xs">Chicken Bowl</span>
          </div>
          <div className="text-muted-foreground font-medium">520 cal &bull; 42g protein</div>
          {/* Confidence score */}
          <div className="flex items-center gap-1 text-[8px]">
            <span className="text-emerald-600 font-bold">✓ 98% match</span>
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-400 shadow-sm" />
            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-orange-300 to-orange-400 shadow-sm" />
            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-violet-300 to-violet-400 shadow-sm" />
          </div>
          <div className="flex justify-between text-[8px] text-muted-foreground">
            <span>Protein</span><span>Carbs</span><span>Fat</span>
          </div>
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
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-200 flex items-center justify-center text-3xl border border-orange-200/50 shadow-card-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-200/30 to-transparent" />
          <span className="relative z-10">🥘</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">Thai Basil Chicken Stir-Fry</p>
          <p className="text-[10px] text-muted-foreground">25 min &bull; 4 ingredients &bull; $3.50/serving</p>
          {/* Goal match badge */}
          <div className="inline-flex items-center gap-1 mt-1 text-[8px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
            <span>✓</span> Matches your goals
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {[
          { label: "480 cal", bg: "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200" },
          { label: "38g protein", bg: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200" },
          { label: "42g carbs", bg: "bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200" },
          { label: "12g fat", bg: "bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 border-violet-200" },
        ].map((p) => (
          <span key={p.label} className={cn("text-[9px] font-semibold px-2 py-1 rounded-full border shadow-sm", p.bg)}>
            {p.label}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5 pt-1">
        {["🍗", "🌿", "🍚", "🥜", "🧄"].map((e) => (
          <div key={e} className="w-9 h-9 rounded-lg bg-fw-surface border border-fw-border/50 flex items-center justify-center text-sm shadow-sm hover:shadow-card transition-shadow">
            {e}
          </div>
        ))}
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-600 shadow-sm">
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
      {/* Budget header */}
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="font-bold text-foreground">Weekly Grocery Budget</span>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-bold text-xs">$42 / $60</span>
          <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">On track</span>
        </div>
      </div>
      {/* Progress bar with marker */}
      <div className="relative">
        <div className="h-3.5 rounded-full bg-fw-border/40 overflow-hidden shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 transition-all duration-500 relative" style={{ width: "70%" }}>
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/60" />
          </div>
        </div>
        <span className="absolute right-[30%] -top-4 text-[8px] font-bold text-emerald-600">70%</span>
      </div>
      <p className="text-[9px] text-muted-foreground">$18 remaining &bull; 3 days left this week</p>
      {/* Mini grocery list */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {[
          { item: "Chicken breast", price: "$8.50", emoji: "🍗", cat: "bg-emerald-400" },
          { item: "Brown rice", price: "$3.20", emoji: "🍚", cat: "bg-orange-400" },
          { item: "Broccoli", price: "$2.80", emoji: "🥦", cat: "bg-emerald-400" },
          { item: "Greek yogurt", price: "$5.40", emoji: "🥛", cat: "bg-emerald-400" },
          { item: "Eggs (dozen)", price: "$4.50", emoji: "🥚", cat: "bg-orange-400" },
          { item: "Sweet potato", price: "$3.10", emoji: "🍠", cat: "bg-orange-400" },
        ].map((g, i) => (
          <div key={g.item} className={cn(
            "flex items-center gap-1.5 text-[9px] rounded-lg px-2 py-1.5 border border-fw-border/40 shadow-sm",
            i % 2 === 0 ? "bg-white" : "bg-fw-surface/50"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", g.cat)} />
            <span className="text-sm">{g.emoji}</span>
            <span className="text-foreground truncate flex-1">{g.item}</span>
            <span className="text-muted-foreground font-semibold">{g.price}</span>
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
        <span className="text-[9px] text-violet-600 font-semibold bg-gradient-to-r from-violet-50 to-purple-50 px-2.5 py-0.5 rounded-full border border-violet-200 shadow-sm">45 min</span>
      </div>
      {[
        { name: "Bench Press", sets: "4×8", weight: "155 lbs", color: "border-l-violet-400 bg-violet-50/60", num: 1, active: true },
        { name: "Incline DB Press", sets: "3×10", weight: "50 lbs", color: "border-l-orange-300 bg-white", num: 2, active: false },
        { name: "Cable Flyes", sets: "3×12", weight: "25 lbs", color: "border-l-emerald-300 bg-white", num: 3, active: false },
        { name: "OHP", sets: "3×8", weight: "95 lbs", color: "border-l-cyan-300 bg-white", num: 4, active: false },
      ].map((ex) => (
        <div key={ex.name} className={cn(
          "flex items-center gap-2.5 rounded-xl border border-fw-border/40 border-l-[3px] px-3 py-2 text-[10px] transition-all",
          ex.color,
          ex.active && "shadow-sm"
        )}>
          <div className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
            ex.active ? "bg-violet-100 text-violet-600" : "bg-fw-surface text-muted-foreground"
          )}>
            {ex.num}
          </div>
          <span className={cn("font-bold text-foreground flex-1", ex.active && "text-violet-700")}>{ex.name}</span>
          <span className="text-muted-foreground">{ex.sets}</span>
          {/* Completion dots */}
          <div className="flex gap-0.5">
            {Array.from({ length: parseInt(ex.sets[0]) }).map((_, j) => (
              <div key={j} className="w-1.5 h-1.5 rounded-full border border-fw-border/60 bg-white" />
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 px-2.5 py-2 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] text-emerald-700 font-semibold">Adapted to your energy level today</span>
      </div>
    </div>
  );
}

/** Understand body visual — shows body metrics */
export function BodyVisual() {
  // SVG sparkline data
  const weights = [185, 184.5, 184.8, 183.9, 183.5, 183.2, 183];
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const points = weights.map((w, i) => `${i * (140 / 6)},${40 - ((w - min) / (max - min)) * 35}`).join(" ");
  const areaPath = `M0,${40 - ((weights[0] - min) / (max - min)) * 35} ${weights.map((w, i) => `L${i * (140 / 6)},${40 - ((w - min) / (max - min)) * 35}`).join(" ")} L${140},${40 - ((weights[6] - min) / (max - min)) * 35} L140,42 L0,42 Z`;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Weight", value: "183 lbs", trend: "▼ 1.2", color: "text-emerald-600", bg: "from-emerald-50/60 to-teal-50/30" },
          { label: "Energy", value: "High", trend: "▲ Good", color: "text-emerald-600", bg: "from-orange-50/60 to-amber-50/30" },
          { label: "Sleep", value: "7.5h", trend: "→ Steady", color: "text-cyan-600", bg: "from-cyan-50/60 to-blue-50/30" },
        ].map((m) => (
          <div key={m.label} className={cn("rounded-xl bg-gradient-to-br border border-fw-border/40 p-2.5 text-center shadow-sm", m.bg)}>
            <p className="text-[9px] text-muted-foreground font-medium">{m.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
            <p className={cn("text-[9px] font-bold mt-0.5", m.color)}>{m.trend}</p>
          </div>
        ))}
      </div>
      {/* SVG Sparkline */}
      <div className="px-1">
        <svg viewBox="0 0 140 44" className="w-full h-10">
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#sparkFill)" />
          <polyline points={points} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {weights.map((w, i) => (
            <circle key={i} cx={i * (140 / 6)} cy={40 - ((w - min) / (max - min)) * 35} r={i === 6 ? 3 : 2}
              fill={i === 6 ? "#34D399" : "white"} stroke="#34D399" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
      <div className="rounded-xl bg-cyan-50 border-l-[3px] border-l-cyan-400 border border-cyan-100 p-2.5">
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
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">vs last week: +8%</span>
          <span className="text-emerald-600 font-bold text-xs">92%</span>
        </div>
      </div>
      {/* Mini bar chart with gradient fills */}
      <div className="flex items-end gap-1.5 h-20">
        {[60, 75, 82, 70, 90, 85, 92].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[7px] text-muted-foreground font-medium">{h}%</span>
            <div className="w-full relative" style={{ height: `${h}%` }}>
              <div
                className={cn(
                  "w-full h-full rounded-t-md transition-all animate-bar-grow",
                  i === 6
                    ? "bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-md"
                    : "bg-gradient-to-t from-emerald-300 to-emerald-200 shadow-sm"
                )}
              />
              {i === 6 && (
                <div className="absolute -inset-1 rounded-md bg-emerald-400/20 blur-sm -z-10" />
              )}
            </div>
            <span className={cn("text-[8px] font-medium", i === 6 ? "text-emerald-600 font-bold" : "text-muted-foreground")}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 px-2.5 py-2 shadow-sm">
        <span className="text-sm">🔥</span>
        <span className="text-[9px] text-orange-700 font-bold">12-day streak — your best yet!</span>
      </div>
    </div>
  );
}
