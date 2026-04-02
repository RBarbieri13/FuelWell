"use client";

import {
  MessageCircle,
  Utensils,
  Camera,
  ChefHat,
  ShoppingCart,
  Dumbbell,
  TrendingUp,
  ImageIcon,
  BarChart3,
  Check,
  Sparkles,
  Zap,
  Shield,
  Search,
  MapPin,
  Clock,
  Flame,
  Battery,
  Wifi,
  ArrowRight,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Rich mockup sub-components — one per feature
// ---------------------------------------------------------------------------

function AiCoachingMockup() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-fw-border/40 bg-fw-surface/50">
        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">🤖</div>
        <span className="text-xs font-semibold text-foreground">FuelCoach AI</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-600 font-medium">Online</span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 px-3 py-3 space-y-2.5 overflow-hidden">
        {/* User bubble */}
        <div className="flex justify-end">
          <div className="max-w-[78%] bg-emerald-500 text-white text-[11px] leading-snug rounded-2xl rounded-br-sm px-3 py-2 shadow-sm">
            What should I eat before my 7am workout? I only have 20 minutes.
          </div>
        </div>

        {/* AI bubble */}
        <div className="flex justify-start gap-1.5">
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] shrink-0 mt-0.5">🤖</div>
          <div className="max-w-[78%] bg-white border border-fw-border/60 text-[11px] leading-snug rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm text-foreground">
            Quick pre-workout pick: a banana + 1 tbsp almond butter. Fast carbs + a little protein. ⚡ Eat it 15 min before you start.
          </div>
        </div>

        {/* User bubble */}
        <div className="flex justify-end">
          <div className="max-w-[78%] bg-emerald-500 text-white text-[11px] leading-snug rounded-2xl rounded-br-sm px-3 py-2 shadow-sm">
            What if I&apos;m trying to lose fat — does that still work?
          </div>
        </div>

        {/* AI bubble */}
        <div className="flex justify-start gap-1.5">
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] shrink-0 mt-0.5">🤖</div>
          <div className="max-w-[78%] bg-white border border-fw-border/60 text-[11px] leading-snug rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm text-foreground">
            Yes! Only ~200 cal, and it helps you push harder so you burn more. Your deficit stays intact 🔥
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex justify-start gap-1.5 items-end">
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] shrink-0">🤖</div>
          <div className="bg-white border border-fw-border/60 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-fw-border/60 bg-fw-surface px-3 py-2">
          <span className="text-[11px] text-muted-foreground/50 flex-1">Ask anything...</span>
          <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RealWorldFoodMockup() {
  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 rounded-xl border border-fw-border/60 bg-fw-surface px-3 py-2">
          <Search className="h-3 w-3 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground/50">Chipotle Mexican Grill</span>
          <MapPin className="h-3 w-3 text-orange-400 ml-auto" />
        </div>
      </div>

      {/* Restaurant card */}
      <div className="mx-3 rounded-xl border border-fw-border/50 bg-white overflow-hidden shadow-sm">
        <div className="h-10 bg-gradient-to-r from-orange-400 to-amber-400 flex items-center px-3 gap-2">
          <span className="text-base">🌯</span>
          <span className="text-white text-xs font-semibold">Chipotle Mexican Grill</span>
          <span className="ml-auto text-[10px] text-white/80">0.3 mi</span>
        </div>
        <div className="p-2.5 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">AI-Suggested Combos</p>
          {[
            { name: "Chicken Bowl (half rice)", cal: 520, p: 48, c: 45, f: 14, badge: "Best Macro Split" },
            { name: "Steak Salad + vinaigrette", cal: 440, p: 42, c: 22, f: 20, badge: "High Protein" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{item.cal} cal</span>
                  <span className="text-[10px] text-emerald-600 font-medium">{item.p}g P</span>
                  <span className="text-[10px] text-orange-500 font-medium">{item.c}g C</span>
                  <span className="text-[10px] text-violet-500 font-medium">{item.f}g F</span>
                </div>
              </div>
              <span className="text-[9px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip banner */}
      <div className="mx-3 mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 flex gap-2 items-start">
        <span className="text-sm">💡</span>
        <p className="text-[10px] text-amber-800 leading-snug">
          <span className="font-semibold">Pro tip:</span> Ask for dressing on the side and dip your fork — saves ~150 cal without losing flavor.
        </p>
      </div>
    </div>
  );
}

function PhotoLoggingMockup() {
  return (
    <div className="flex flex-col h-full">
      {/* Camera viewfinder */}
      <div className="mx-3 mt-3 rounded-xl overflow-hidden border border-violet-200 relative bg-zinc-900 flex-1">
        {/* Simulated plate image bg */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-zinc-700/60 flex items-center justify-center text-4xl opacity-70">🍽️</div>
        </div>

        {/* Corner brackets */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} h-4 w-4 border-violet-400`}
            style={{
              borderTopWidth: i < 2 ? 2 : 0,
              borderBottomWidth: i >= 2 ? 2 : 0,
              borderLeftWidth: i % 2 === 0 ? 2 : 0,
              borderRightWidth: i % 2 !== 0 ? 2 : 0,
            }}
          />
        ))}

        {/* Scanning line */}
        <div className="absolute left-3 right-3 h-px bg-violet-400/70 top-1/3" />

        {/* Detecting badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <span className="text-[10px] bg-violet-500/80 text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-sm flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Detecting foods...
          </span>
        </div>
      </div>

      {/* Detected items */}
      <div className="px-3 py-2.5 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Detected</p>
        {[
          { name: "Grilled Chicken Breast", portion: "6 oz", p: 42, c: 0, f: 6, cal: 220, confidence: 97 },
          { name: "Brown Rice", portion: "1 cup", p: 5, c: 45, f: 2, cal: 216, confidence: 92 },
          { name: "Steamed Broccoli", portion: "1.5 cups", p: 4, c: 11, f: 0, cal: 55, confidence: 89 },
        ].map((food) => (
          <div key={food.name} className="flex items-center gap-2 rounded-lg border border-fw-border/50 bg-white px-2.5 py-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-medium text-foreground truncate">{food.name}</p>
                <span className="text-[9px] text-violet-500 font-semibold">{food.confidence}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{food.portion} · {food.cal} cal</p>
            </div>
            <div className="flex gap-1.5 text-[10px] font-medium shrink-0">
              <span className="text-emerald-600">{food.p}P</span>
              <span className="text-orange-500">{food.c}C</span>
              <span className="text-violet-500">{food.f}F</span>
            </div>
          </div>
        ))}
        {/* Total bar */}
        <div className="flex justify-between items-center pt-1 border-t border-fw-border/40">
          <span className="text-[10px] font-semibold text-foreground">Total</span>
          <div className="flex gap-2 text-[10px] font-semibold">
            <span className="text-muted-foreground">491 cal</span>
            <span className="text-emerald-600">51g P</span>
            <span className="text-orange-500">56g C</span>
            <span className="text-violet-500">8g F</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeCreationMockup() {
  return (
    <div className="flex flex-col h-full px-3 py-3 gap-2.5">
      {/* Recipe header */}
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-200 flex items-center justify-center text-2xl shrink-0">🥗</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">High-Protein Greek Chicken Bowl</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" /> 22 min</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">2 servings</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] font-semibold text-emerald-600">$4.20/serving</span>
          </div>
          {/* Macro pills */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {[
              { label: "498 cal", color: "bg-zinc-100 text-zinc-600" },
              { label: "46g protein", color: "bg-emerald-50 text-emerald-700" },
              { label: "38g carbs", color: "bg-orange-50 text-orange-600" },
              { label: "14g fat", color: "bg-violet-50 text-violet-600" },
            ].map((pill) => (
              <span key={pill.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pill.color}`}>{pill.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="rounded-xl border border-fw-border/50 bg-white overflow-hidden shadow-sm">
        <div className="px-2.5 py-1.5 border-b border-fw-border/40 bg-fw-surface/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Ingredients</p>
        </div>
        <div className="divide-y divide-fw-border/30">
          {[
            { name: "Chicken breast", qty: "8 oz", cal: 248 },
            { name: "Quinoa (dry)", qty: "½ cup", cal: 156 },
            { name: "Cucumber", qty: "1 medium", cal: 16 },
            { name: "Cherry tomatoes", qty: "½ cup", cal: 27 },
            { name: "Feta cheese", qty: "1 oz", cal: 74 },
            { name: "Greek dressing", qty: "1 tbsp", cal: 35 },
          ].map((ing) => (
            <div key={ing.name} className="flex items-center justify-between px-2.5 py-1.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[11px] text-foreground">{ing.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{ing.qty}</span>
                <span className="w-10 text-right">{ing.cal} cal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI badge */}
      <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-2.5 py-1.5">
        <span className="text-sm">✨</span>
        <p className="text-[10px] text-pink-700 leading-snug">Generated for your <span className="font-semibold">46g protein goal</span> · Under your $5 budget</p>
      </div>
    </div>
  );
}

function MealPlanningMockup() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const meals = [
    ["Oats + eggs", "Chicken rice", "Salmon bowl"],
    ["Greek yogurt", "Turkey wrap", "Beef stir-fry"],
    ["Smoothie", "Tuna salad", "Chicken pasta"],
    ["Eggs + toast", "Lentil soup", "Shrimp tacos"],
    ["Protein shake", "Grilled chicken", "Pork tenderloin"],
    ["Pancakes", "Burrito bowl", "Grilled salmon"],
    ["Veggie omelet", "Chicken salad", "Pasta primavera"],
  ];

  return (
    <div className="flex flex-col h-full px-3 py-3 gap-2.5">
      {/* Budget meter */}
      <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[11px] font-semibold text-green-800">Weekly Grocery Budget</p>
          <p className="text-[11px] font-bold text-green-700">$68 / $75</p>
        </div>
        <div className="h-2 rounded-full bg-green-200 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" style={{ width: "90.7%" }} />
        </div>
        <p className="text-[10px] text-green-600 mt-1">$7 remaining · 91% allocated</p>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-fw-border/50 bg-white overflow-hidden shadow-sm flex-1">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-fw-border/40 bg-fw-surface/50">
          {days.map((d, i) => (
            <div key={i} className="py-1 text-center text-[9px] font-bold text-muted-foreground uppercase">{d}</div>
          ))}
        </div>
        {/* Meal rows — breakfast / lunch / dinner */}
        {[0, 1, 2].map((mealIdx) => {
          const mealLabel = ["🌅", "☀️", "🌙"][mealIdx];
          return (
            <div key={mealIdx} className={`grid grid-cols-7 ${mealIdx < 2 ? "border-b border-fw-border/30" : ""}`}>
              {days.map((_, dayIdx) => {
                const name = meals[dayIdx][mealIdx];
                const isToday = dayIdx === 2;
                return (
                  <div
                    key={dayIdx}
                    className={`px-0.5 py-1.5 flex flex-col items-center gap-0.5 ${isToday ? "bg-emerald-50" : ""} ${dayIdx < 6 ? "border-r border-fw-border/20" : ""}`}
                  >
                    {dayIdx === 0 && <span className="text-[9px]">{mealLabel}</span>}
                    <div className={`rounded text-center px-0.5 py-0.5 w-full ${isToday ? "bg-emerald-100" : "bg-fw-surface"}`}>
                      <p className="text-[8px] leading-tight text-foreground/80 break-words hyphens-auto">{name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Per-day cost row */}
      <div className="flex items-center gap-1 justify-between">
        {["$9", "$8", "$10", "$9", "$11", "$12", "$9"].map((cost, i) => (
          <div key={i} className={`flex-1 text-center text-[9px] font-semibold ${i === 2 ? "text-emerald-600" : "text-muted-foreground"}`}>{cost}</div>
        ))}
      </div>
    </div>
  );
}

function TrainingProgramMockup() {
  const exercises = [
    { name: "Barbell Squat", sets: "4×6", weight: "185 lb", done: true },
    { name: "Romanian Deadlift", sets: "3×8", weight: "145 lb", done: true },
    { name: "Leg Press", sets: "3×10", weight: "270 lb", done: false },
    { name: "Leg Curl", sets: "3×12", weight: "95 lb", done: false },
  ];

  return (
    <div className="flex flex-col h-full px-3 py-3 gap-2.5">
      {/* Workout header */}
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 flex items-center justify-center text-xl shrink-0">🏋️</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">Lower Body — Week 6 / Day 3</p>
          <p className="text-[10px] text-muted-foreground">Progressive Overload Block · Adaptive Intensity</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold text-violet-600">+5%</span>
          <span className="text-[9px] text-muted-foreground">vs last wk</span>
        </div>
      </div>

      {/* Energy + wearable */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-fw-border/50 bg-white px-2.5 py-2 flex items-center gap-2 shadow-sm">
          <Battery className="h-3.5 w-3.5 text-emerald-500" />
          <div>
            <p className="text-[10px] font-semibold text-foreground">Energy: High</p>
            <p className="text-[9px] text-muted-foreground">HRV 68ms · Oura</p>
          </div>
        </div>
        <div className="rounded-xl border border-fw-border/50 bg-white px-2.5 py-2 flex items-center gap-2 shadow-sm">
          <Wifi className="h-3.5 w-3.5 text-violet-500" />
          <div>
            <p className="text-[10px] font-semibold text-foreground">Synced</p>
            <p className="text-[9px] text-muted-foreground">Apple Watch ✓</p>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="rounded-xl border border-fw-border/50 bg-white overflow-hidden shadow-sm flex-1">
        <div className="px-2.5 py-1.5 border-b border-fw-border/40 bg-fw-surface/50">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Today&apos;s Exercises</p>
        </div>
        <div className="divide-y divide-fw-border/30">
          {exercises.map((ex) => (
            <div key={ex.name} className={`flex items-center gap-2.5 px-2.5 py-2 ${ex.done ? "opacity-60" : ""}`}>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${ex.done ? "border-emerald-400 bg-emerald-400" : "border-violet-300"}`}>
                {ex.done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-medium ${ex.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{ex.name}</p>
                <p className="text-[10px] text-muted-foreground">{ex.sets} · {ex.weight}</p>
              </div>
              <div className="h-1.5 w-12 rounded-full bg-fw-border/50 overflow-hidden">
                <div
                  className={`h-full rounded-full ${ex.done ? "bg-emerald-400" : "bg-violet-300"}`}
                  style={{ width: ex.done ? "100%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptive note */}
      <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5">
        <Flame className="h-3.5 w-3.5 text-violet-500 shrink-0" />
        <p className="text-[10px] text-violet-700">Your HRV is up — intensity increased 5% vs last session.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mockup registry — maps feature title to its component
// ---------------------------------------------------------------------------

const MOCKUP_MAP: Record<string, React.ReactNode> = {
  "24/7 AI Coaching": <AiCoachingMockup />,
  "Smart Real-World Food Suggestions": <RealWorldFoodMockup />,
  "Photo-Based Food Logging": <PhotoLoggingMockup />,
  "AI Recipe Creation": <RecipeCreationMockup />,
  "Budget-Friendly Meal Planning": <MealPlanningMockup />,
  "Adaptive Training Programs": <TrainingProgramMockup />,
};

// ---------------------------------------------------------------------------
// Page data
// ---------------------------------------------------------------------------

const coreFeatures = [
  {
    icon: MessageCircle,
    title: "24/7 AI Coaching",
    description:
      "Get conversational coaching that understands your goals, schedule, and preferences. Ask anything from meal ideas to motivation — day or night.",
    bullets: [
      "\"What should I eat before a morning workout?\"",
      "\"I'm at a party and there's only pizza — what do I do?\"",
      "\"I missed my protein goal yesterday, how do I make up for it?\"",
      "\"Can I have a cheat meal and still stay on track?\"",
    ],
    gradient: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    icon: Utensils,
    title: "Smart Real-World Food Suggestions",
    description:
      "FuelWell knows that life happens outside the kitchen. Get macro-friendly suggestions for restaurants, fast food, and social situations.",
    bullets: [
      "Ask for dressing on the side and dip your salad",
      "Half rice, half beans at Chipotle for better macros",
      "Protein-first ordering at any restaurant menu",
      "Smart swaps that save 200+ calories without sacrificing flavor",
    ],
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    icon: Camera,
    title: "Photo-Based Food Logging",
    description:
      "Snap a photo of your plate or scan a barcode — FuelWell auto-identifies foods, estimates portions, and logs your macros instantly.",
    bullets: [
      "Take a photo and let AI identify everything on your plate",
      "Scan packaged items for instant nutrition data",
      "Auto-estimate portions with visual recognition",
      "Edit and refine entries with a single tap",
    ],
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    icon: ChefHat,
    title: "AI Recipe Creation",
    description:
      "Generate meals tailored to your exact macro goals, available ingredients, time constraints, and budget. Every recipe comes with full nutrition details.",
    bullets: [
      "Calories, protein, carbs, and fat per serving",
      "Adjustable portion sizes for meal prep",
      "Estimated cost per meal and prep time",
      "Filter by cuisine, dietary restrictions, or pantry items",
    ],
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: ShoppingCart,
    title: "Budget-Friendly Meal Planning",
    description:
      "Set a weekly grocery budget and let FuelWell build meal plans with a matching grocery list — hitting your macros without breaking the bank.",
    bullets: [
      "Weekly meal plans that respect your budget",
      "Auto-generated grocery lists organized by store section",
      "Macro-optimized meals at $3–5 per serving",
      "Swap suggestions when ingredients are on sale",
    ],
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Dumbbell,
    title: "Adaptive Training Programs",
    description:
      "Personalized workout plans that evolve with you. FuelWell factors in soreness, energy levels, injury history, and wearable data to keep you progressing safely.",
    bullets: [
      "Injury-aware exercise selection and modifications",
      "Energy-based intensity adjustments from wearable data",
      "Progressive overload tracking and deload recommendations",
      "Integrates with Apple Watch, WHOOP, Oura, and Garmin",
    ],
    premium: true,
    gradient: "from-purple-500/20 to-indigo-500/20",
  },
] as const;

const progressItems = [
  {
    icon: BarChart3,
    title: "Weekly Performance Reports",
    description:
      "Calorie trends, protein consistency, workout completion rate, and weekly deficit or surplus estimates — delivered every Sunday.",
    stat: "Weekly",
    statLabel: "Delivery",
  },
  {
    icon: ImageIcon,
    title: "Visual Progress Tracking",
    description:
      "Log weekly photos with guided poses. FuelWell generates side-by-side comparisons and transformation collages so you can see the change over time.",
    stat: "Side-by-side",
    statLabel: "Comparisons",
  },
  {
    icon: TrendingUp,
    title: "Body Recomposition Timeline",
    description:
      "Track weight, measurements, and body composition estimates over weeks and months. See projected milestones based on your current trajectory.",
    stat: "Projected",
    statLabel: "Milestones",
  },
];

// ---------------------------------------------------------------------------
// Progress Reporting Chart Mockup
// ---------------------------------------------------------------------------

function ProgressReportingMockup() {
  // Caloric deficit data (daily target 2100, actual varies)
  const calorieData = [
    { day: "Mon", target: 2100, actual: 1950 },
    { day: "Tue", target: 2100, actual: 2020 },
    { day: "Wed", target: 2100, actual: 1880 },
    { day: "Thu", target: 2100, actual: 2150 },
    { day: "Fri", target: 2100, actual: 1920 },
    { day: "Sat", target: 2100, actual: 2300 },
    { day: "Sun", target: 2100, actual: 1980 },
  ];
  const maxCal = 2400;
  const chartH = 80;

  // Protein intake (grams)
  const proteinData = [135, 142, 128, 150, 138, 120, 145];
  const proteinGoal = 140;
  const maxProtein = 160;

  // Weight trend (lbs over 8 weeks)
  const weightData = [186, 184.5, 183, 182.5, 181, 180, 179.5, 178];

  return (
    <div className="space-y-6">
      {/* Caloric Deficit Chart */}
      <div className="rounded-xl border border-fw-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-foreground">Weekly Caloric Intake</h4>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Actual</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-300" />Target</span>
          </div>
        </div>
        <div className="relative" style={{ height: chartH }}>
          {/* Target line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-zinc-200"
            style={{ top: `${((maxCal - 2100) / maxCal) * chartH}px` }}
          />
          <div className="flex items-end justify-between h-full gap-1">
            {calorieData.map((d) => {
              const barH = (d.actual / maxCal) * chartH;
              const isOver = d.actual > d.target;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full max-w-[28px] rounded-t-md ${isOver ? "bg-orange-300" : "bg-emerald-400"}`}
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>Avg: <span className="font-semibold text-foreground">2,029 cal/day</span></span>
          <span>Deficit: <span className="font-semibold text-emerald-600">−497 cal/week</span></span>
        </div>
      </div>

      {/* Protein Intake Chart */}
      <div className="rounded-xl border border-fw-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-foreground">Daily Protein (g)</h4>
          <span className="text-[10px] text-muted-foreground">Goal: {proteinGoal}g</span>
        </div>
        <div className="relative" style={{ height: 60 }}>
          {/* Goal line */}
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-blue-200"
            style={{ top: `${((maxProtein - proteinGoal) / maxProtein) * 60}px` }}
          />
          <div className="flex items-end justify-between h-full gap-1">
            {proteinData.map((g, i) => {
              const barH = (g / maxProtein) * 60;
              const hit = g >= proteinGoal;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full max-w-[28px] rounded-t-md ${hit ? "bg-blue-400" : "bg-blue-200"}`}
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">{calorieData[i].day}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Hit goal <span className="font-semibold text-blue-600">4 of 7 days</span> this week
        </p>
      </div>

      {/* Weight Trend */}
      <div className="rounded-xl border border-fw-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-foreground">Weight Trend (lbs)</h4>
          <span className="text-[10px] font-semibold text-emerald-600">−8 lbs</span>
        </div>
        <div className="relative h-12">
          <svg viewBox="0 0 280 48" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const minW = 176;
              const maxW = 188;
              const points = weightData.map((w, i) => {
                const x = (i / (weightData.length - 1)) * 280;
                const y = 48 - ((w - minW) / (maxW - minW)) * 48;
                return `${x},${y}`;
              });
              const areaPoints = `0,48 ${points.join(" ")} 280,48`;
              return (
                <>
                  <polygon points={areaPoints} fill="url(#weightGrad)" />
                  <polyline points={points.join(" ")} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {weightData.map((w, i) => {
                    const x = (i / (weightData.length - 1)) * 280;
                    const y = 48 - ((w - minW) / (maxW - minW)) * 48;
                    return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#22c55e" strokeWidth="2" />;
                  })}
                </>
              );
            })()}
          </svg>
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>Week 1</span>
          <span>Week 8</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Body Recomposition Timeline Mockup
// ---------------------------------------------------------------------------

function BodyRecompMockup() {
  const milestones = [
    { week: "Week 1", label: "Baseline", weight: "186 lbs", bf: "24%", muscle: "141 lbs", status: "done" },
    { week: "Week 4", label: "Fat loss phase", weight: "182 lbs", bf: "22%", muscle: "142 lbs", status: "done" },
    { week: "Week 8", label: "Recomp begins", weight: "178 lbs", bf: "20%", muscle: "142.5 lbs", status: "current" },
    { week: "Week 12", label: "Lean gain phase", weight: "176 lbs", bf: "18%", muscle: "144 lbs", status: "projected" },
    { week: "Week 16", label: "Target", weight: "175 lbs", bf: "16%", muscle: "147 lbs", status: "projected" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-fw-border bg-white p-4 shadow-sm">
        <h4 className="text-xs font-bold text-foreground mb-4">Body Recomposition Timeline</h4>

        {/* Dual line chart */}
        <div className="relative h-16 mb-2">
          <svg viewBox="0 0 280 64" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="muscleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Body fat line (decreasing) */}
            {(() => {
              const bfValues = [24, 22, 20, 18, 16];
              const minBf = 14;
              const maxBf = 26;
              const points = bfValues.map((v, i) => {
                const x = (i / (bfValues.length - 1)) * 280;
                const y = 64 - ((v - minBf) / (maxBf - minBf)) * 64;
                return `${x},${y}`;
              });
              return (
                <>
                  <polyline points={points.join(" ")} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Projected dashed portion */}
                  <line x1="140" y1={64 - ((20 - minBf) / (maxBf - minBf)) * 64} x2="280" y2={64 - ((16 - minBf) / (maxBf - minBf)) * 64} stroke="#f97316" strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />
                  {bfValues.map((v, i) => {
                    const x = (i / (bfValues.length - 1)) * 280;
                    const y = 64 - ((v - minBf) / (maxBf - minBf)) * 64;
                    return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#f97316" strokeWidth="2" />;
                  })}
                </>
              );
            })()}
            {/* Lean mass line (increasing) */}
            {(() => {
              const muscleValues = [141, 142, 142.5, 144, 147];
              const minM = 139;
              const maxM = 149;
              const points = muscleValues.map((v, i) => {
                const x = (i / (muscleValues.length - 1)) * 280;
                const y = 64 - ((v - minM) / (maxM - minM)) * 64;
                return `${x},${y}`;
              });
              return (
                <>
                  <polyline points={points.join(" ")} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="140" y1={64 - ((142.5 - minM) / (maxM - minM)) * 64} x2="280" y2={64 - ((147 - minM) / (maxM - minM)) * 64} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />
                  {muscleValues.map((v, i) => {
                    const x = (i / (muscleValues.length - 1)) * 280;
                    const y = 64 - ((v - minM) / (maxM - minM)) * 64;
                    return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#3b82f6" strokeWidth="2" />;
                  })}
                </>
              );
            })()}
          </svg>
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] mb-4">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" />Body Fat %</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" />Lean Mass (lbs)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 border border-zinc-300 rounded-full" style={{ borderStyle: "dashed" }} />Projected</span>
        </div>

        {/* Milestone timeline */}
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.week} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] ${m.status === "current" ? "bg-emerald-50 border border-emerald-200" : m.status === "projected" ? "bg-zinc-50 border border-zinc-200 opacity-70" : "bg-white border border-fw-border/50"}`}>
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${m.status === "done" ? "bg-emerald-400" : m.status === "current" ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-zinc-300"}`} />
              <span className="font-semibold text-foreground w-14">{m.week}</span>
              <span className="text-muted-foreground flex-1">{m.label}</span>
              <span className="text-foreground font-medium">{m.weight}</span>
              <span className="text-orange-500 font-medium w-8 text-right">{m.bf}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const integrations = [
  { name: "Apple Health", icon: Zap },
  { name: "WHOOP", icon: Sparkles },
  { name: "Oura Ring", icon: Shield },
  { name: "Garmin", icon: TrendingUp },
  { name: "Smart Scales", icon: BarChart3 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-fw-accent/6 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12 md:pb-16">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-fw-accent/10 text-fw-accent border-fw-accent/20 px-4 py-1.5">
              Full Feature Breakdown
            </Badge>
            <h1 className="gradient-text">
              Everything you need to stay on track
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
              From real-time AI coaching and photo-based food logging to
              budget-friendly meal plans and adaptive workouts — FuelWell is
              your all-in-one wellness platform.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Features — alternating layout */}
      <Section id="core-features" className="py-12 md:py-16">
        <div className="space-y-24 md:space-y-32">
          {coreFeatures.map((feature, index) => {
            const isReversed = index % 2 !== 0;
            const Icon = feature.icon;

            return (
              <AnimatedSection key={feature.title} delay={0.1}>
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Text side */}
                  <div className={isReversed ? "md:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <Icon className="h-5 w-5 text-fw-accent" />
                      </div>
                      {"premium" in feature && feature.premium && (
                        <Badge className="bg-violet-100 text-violet-600 border-violet-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <h3 className="mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-5">
                      {feature.description}
                    </p>
                    <ul className="space-y-2.5">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-fw-accent" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* App-style mockup */}
                  <div className={isReversed ? "md:order-1" : ""}>
                    <div
                      className={`relative aspect-[4/3] rounded-2xl bg-gradient-to-br ${feature.gradient} border border-fw-border overflow-hidden group`}
                    >
                      {/* Mockup chrome */}
                      <div className="absolute inset-3 rounded-xl bg-white border border-fw-border/50 flex flex-col overflow-hidden shadow-sm">
                        {/* Title bar */}
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-fw-border/50 shrink-0">
                          <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-fw-error/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-fw-warning/60" />
                            <div className="h-2.5 w-2.5 rounded-full bg-fw-accent/60" />
                          </div>
                          <span className="text-[10px] text-muted-foreground/60 ml-2 font-mono">
                            FuelWell
                          </span>
                        </div>

                        {/* Rich mockup content */}
                        <div className="flex-1 overflow-hidden">
                          {MOCKUP_MAP[feature.title]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Section>

      {/* Progress & Reporting */}
      <Section id="progress" className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
          <h2>Progress &amp; Reporting</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            See where you&apos;ve been, where you are, and where you&apos;re headed
            &mdash; with data-driven insights delivered weekly.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {progressItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-fw-border bg-white p-6 hover:-translate-y-1 hover:border-fw-accent/30 transition-all duration-300 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                      <Icon className="h-5 w-5 text-fw-accent" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-fw-accent">{item.stat}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.statLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Progress Reporting Visual */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <AnimatedSection delay={0.1}>
            <h3 className="text-xl font-bold text-foreground mb-4">Weekly Performance Report</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Caloric deficit tracking, protein intake consistency, and weight trend — all in one view. Delivered every Sunday.
            </p>
            <ProgressReportingMockup />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h3 className="text-xl font-bold text-foreground mb-4">Body Recomposition Timeline</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Track body fat percentage and lean mass over time. See projected milestones based on your current trajectory.
            </p>
            <BodyRecompMockup />
          </AnimatedSection>
        </div>
      </Section>

      {/* Integrations */}
      <Section id="integrations">
        <AnimatedSection className="text-center">
          <h2 className="mb-4">Connects With Your Favorite Devices</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            FuelWell syncs with the wearables and health platforms you already
            use for a complete picture of your wellness.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {integrations.map((item) => {
              const IntIcon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-fw-border bg-white hover:border-fw-accent/30 hover:bg-fw-surface transition-all duration-200 shadow-card"
                >
                  <IntIcon className="h-4 w-4 text-fw-accent" />
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </Section>

      {/* CTA */}
      <Section className="bg-fw-surface">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <h2 className="mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Be one of the first 100 members to experience AI-powered
            nutrition and fitness coaching.
          </p>
          <GradientButton href="/founders-100" size="default">
            Secure Your Spot
            <ArrowRight className="ml-2 h-4 w-4" />
          </GradientButton>
        </AnimatedSection>
      </Section>
    </>
  );
}
