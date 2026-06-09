"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Dumbbell,
  HeartPulse,
  Send,
  Sparkles,
  UtensilsCrossed,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_TARGETS, percentOf, remaining, SAMPLE_MEALS, SAMPLE_TARGETS, sumMeals, todayIsoDate } from "@/lib/fuelwell-data";

type CoachAction = {
  label: string;
  href: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: CoachAction[];
};

type DayContext = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  goal: string;
  diet: string;
  allergies: string[];
  loaded: boolean;
};

const INITIAL_CONTEXT: DayContext = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  calorieTarget: DEFAULT_TARGETS.calories,
  proteinTarget: DEFAULT_TARGETS.protein,
  carbsTarget: DEFAULT_TARGETS.carbs,
  fatTarget: DEFAULT_TARGETS.fat,
  goal: "lose",
  diet: "none",
  allergies: [],
  loaded: false,
};

const QUICK_PROMPTS = [
  "Am I on track today?",
  "Plan a workout",
  "What can I eat tonight?",
  "Show nutrition details",
];

export default function CoachPage() {
  const [context, setContext] = useState<DayContext>(INITIAL_CONTEXT);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I can help with the next useful decision. Ask me to log food, explain your nutrition, plan a workout, pick dinner, or check recovery.",
      actions: [
        { label: "Log a meal", href: "/app/log" },
        { label: "Open nutrition", href: "/app/nutrition" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadContext() {
      const isPreview =
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("127.0.0.1") ||
        window.location.hostname.includes("trycloudflare.com");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user && isPreview) {
        const totals = sumMeals(SAMPLE_MEALS);
        setContext({
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          calorieTarget: SAMPLE_TARGETS.calories,
          proteinTarget: SAMPLE_TARGETS.protein,
          carbsTarget: SAMPLE_TARGETS.carbs,
          fatTarget: SAMPLE_TARGETS.fat,
          goal: "lose",
          diet: "none",
          allergies: ["Shellfish"],
          loaded: true,
        });
        return;
      }

      if (!user) return;

      const today = todayIsoDate();
      const [profileResult, logResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("calorie_target, protein_target, carbs_target, fat_target, goal, dietary_preference, allergies")
          .eq("id", user.id)
          .single(),
        supabase
          .from("daily_logs")
          .select("calories_consumed, protein_consumed, carbs_consumed, fat_consumed")
          .eq("user_id", user.id)
          .eq("log_date", today)
          .maybeSingle(),
      ]);

      setContext({
        calories: Number(logResult.data?.calories_consumed ?? 0),
        protein: Number(logResult.data?.protein_consumed ?? 0),
        carbs: Number(logResult.data?.carbs_consumed ?? 0),
        fat: Number(logResult.data?.fat_consumed ?? 0),
        calorieTarget: profileResult.data?.calorie_target ?? DEFAULT_TARGETS.calories,
        proteinTarget: profileResult.data?.protein_target ?? DEFAULT_TARGETS.protein,
        carbsTarget: profileResult.data?.carbs_target ?? DEFAULT_TARGETS.carbs,
        fatTarget: profileResult.data?.fat_target ?? DEFAULT_TARGETS.fat,
        goal: profileResult.data?.goal ?? "lose",
        diet: profileResult.data?.dietary_preference ?? "none",
        allergies: profileResult.data?.allergies ?? [],
        loaded: true,
      });
    }

    loadContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const contextSummary = useMemo(() => {
    if (context.calories === 0) {
      return "No meals logged yet. I will avoid pretending you are on track until you add food.";
    }
    return `${context.calories}/${context.calorieTarget} calories and ${context.protein}/${context.proteinTarget}g protein logged.`;
  }, [context]);

  function addMessage(content: string) {
    if (!content.trim()) return;

    const clean = content.trim();
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: clean },
    ]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const response = getCoachResponse(clean, context);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.content,
          actions: response.actions,
        },
      ]);
      setIsTyping(false);
    }, 450);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    addMessage(input);
  }

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[22rem_1fr]">
      <aside className="hidden overflow-y-auto border-r border-white/70 bg-white/64 p-5 lg:block">
        <Card className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-neutral-900">FuelCoach</h1>
              <p className="text-sm font-medium text-neutral-500">
                Context-aware actions
              </p>
            </div>
          </div>
          <p className="text-sm font-medium leading-6 text-neutral-600">
            {context.loaded ? contextSummary : "Loading today's context..."}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ContextTile label="Calories" value={`${percentOf(context.calories, context.calorieTarget)}%`} />
            <ContextTile label="Protein left" value={`${remaining(context.protein, context.proteinTarget)}g`} />
            <ContextTile label="Goal" value={context.goal} />
            <ContextTile label="Diet" value={context.diet} />
          </div>
          {context.allergies.length > 0 && (
            <p className="rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">
              Allergies: {context.allergies.join(", ")}
            </p>
          )}
        </Card>

        <div className="mt-5 space-y-2">
          <SideAction href="/app/log" icon={<UtensilsCrossed className="h-5 w-5" />} label="Log food" />
          <SideAction href="/app/workouts" icon={<Dumbbell className="h-5 w-5" />} label="Plan workout" />
          <SideAction href="/app/recipes" icon={<BookOpen className="h-5 w-5" />} label="Find dinner" />
          <SideAction href="/app/recovery" icon={<HeartPulse className="h-5 w-5" />} label="Check recovery" />
        </div>
      </aside>

      <main className="flex min-h-0 flex-col">
        <div className="border-b border-white/70 bg-white/72 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-primary-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-neutral-900">Coach Chat</h1>
                <p className="text-xs font-bold text-neutral-400">
                  {isTyping ? "Thinking..." : "Ready for actions"}
                </p>
              </div>
            </div>
            <Link href="/app/dashboard" className="text-sm font-bold text-primary-700">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <Card className="block border-primary-100 bg-primary-50/60 lg:hidden">
              <p className="text-sm font-bold text-primary-900">{contextSummary}</p>
            </Card>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar variant="assistant" />
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm font-medium leading-6 shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-neutral-900 text-white"
                      : "rounded-bl-md bg-white text-neutral-800"
                  )}
                >
                  <p>{message.content}</p>
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700"
                        >
                          {action.label}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && <Avatar variant="user" />}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start gap-3">
                <Avatar variant="assistant" />
                <div className="rounded-3xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="pt-4">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-neutral-400">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => addMessage(prompt)}
                      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition hover:border-primary-300 hover:bg-primary-50/70 hover:text-primary-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/70 bg-white/86 px-4 py-3 backdrop-blur-xl md:px-8">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for food, workouts, nutrition, recovery, or progress..."
              className="flex-1 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function getCoachResponse(message: string, context: DayContext): { content: string; actions: CoachAction[] } {
  const lower = message.toLowerCase();

  if (lower.includes("workout") || lower.includes("exercise") || lower.includes("train")) {
    return {
      content:
        "Start with a 35 minute strength session: squat pattern, push, pull, hinge, then 8 minutes easy conditioning. If recovery feels low, switch to the mobility option.",
      actions: [
        { label: "Open workouts", href: "/app/workouts" },
        { label: "Check recovery", href: "/app/recovery" },
      ],
    };
  }

  if (lower.includes("log") || lower.includes("meal")) {
    return {
      content:
        "Open the meal logger, choose the meal slot, search the food, confirm servings, and I will use that source for the dashboard and nutrition score.",
      actions: [
        { label: "Log a meal", href: "/app/log" },
        { label: "Today's Plate", href: "/app/nutrition" },
      ],
    };
  }

  if (lower.includes("nutrition") || lower.includes("macro") || lower.includes("details")) {
    if (context.calories === 0) {
      return {
        content:
          "There are no nutrition inputs today, so the honest answer is: nothing is scored yet. Log a meal first, then open the plate breakdown.",
        actions: [{ label: "Log first meal", href: "/app/log" }],
      };
    }
    return {
      content: `You have ${remaining(context.calories, context.calorieTarget)} calories and ${remaining(context.protein, context.proteinTarget)}g protein left. The nutrition page shows exactly which meals make that up.`,
      actions: [{ label: "Open nutrition", href: "/app/nutrition" }],
    };
  }

  if (lower.includes("track") || lower.includes("progress")) {
    return {
      content:
        "Check Progress for the trend, but make the next decision from today's inputs: log food, complete movement, and add recovery. One clean input beats staring at charts.",
      actions: [
        { label: "Open progress", href: "/app/progress" },
        { label: "Open dashboard", href: "/app/dashboard" },
      ],
    };
  }

  if (lower.includes("eat") || lower.includes("dinner") || lower.includes("lunch") || lower.includes("snack")) {
    const proteinGap = remaining(context.protein, context.proteinTarget);
    return {
      content:
        context.calories === 0
          ? "Because no meals are logged yet, choose a balanced meal with lean protein, carbs, and vegetables, then log it so the rest of today can adapt."
          : `Choose food around the gap: ${proteinGap}g protein left and ${remaining(context.calories, context.calorieTarget)} calories available. Recipes can filter to meals that fit.`,
      actions: [
        { label: "Find recipes", href: "/app/recipes" },
        { label: "Build meal plan", href: "/app/meal-plan" },
      ],
    };
  }

  if (lower.includes("recovery") || lower.includes("sleep") || lower.includes("sore")) {
    return {
      content:
        "Recovery needs direct inputs before I score it. Add sleep, soreness, energy, and stress; then I can decide whether to train hard or back off.",
      actions: [{ label: "Open recovery", href: "/app/recovery" }],
    };
  }

  return {
    content:
      "I can act on that from one of four places: log food, explain today's nutrition, plan movement, or pick a meal that fits your remaining macros.",
    actions: [
      { label: "Log food", href: "/app/log" },
      { label: "Nutrition", href: "/app/nutrition" },
      { label: "Workouts", href: "/app/workouts" },
      { label: "Recipes", href: "/app/recipes" },
    ],
  };
}

function ContextTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-100 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-neutral-900">{value}</p>
    </div>
  );
}

function SideAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl bg-white/75 p-4 text-sm font-black text-neutral-700 shadow-sm shadow-neutral-200/60 transition hover:bg-white hover:text-primary-700"
    >
      <span className="flex items-center gap-3">
        <span className="text-primary-700">{icon}</span>
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-neutral-300" />
    </Link>
  );
}

function Avatar({ variant }: { variant: "assistant" | "user" }) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
        variant === "assistant"
          ? "bg-primary-50 text-primary-700"
          : "bg-neutral-200 text-neutral-600"
      )}
    >
      {variant === "assistant" ? (
        <Sparkles className="h-4 w-4" />
      ) : (
        <User className="h-4 w-4" />
      )}
    </div>
  );
}
