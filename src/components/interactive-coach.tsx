"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type Prompt = {
  question: string;
  answer: string;
  tag: string;
};

const PROMPTS: Prompt[] = [
  {
    tag: "Dining out",
    question: "I\u2019m at a Mexican restaurant. What should I order?",
    answer:
      "Grilled chicken fajitas with extra veggies. Skip the sour cream, keep the guac \u2014 it\u2019s healthy fat. Ask for corn tortillas instead of flour, and double the protein if you can.",
  },
  {
    tag: "Overate",
    question: "I went over my calories yesterday. Should I eat less today?",
    answer:
      "No need to punish yourself. One day doesn\u2019t define your progress. Stick to your normal plan today and focus on hydration, sleep, and your next training session.",
  },
  {
    tag: "Short workout",
    question: "I only have 20 minutes to work out. Is it even worth it?",
    answer:
      "Absolutely. Here\u2019s a quick full-body circuit with no equipment: 5 rounds of 10 goblet squats, 8 push-ups, 10 walking lunges, and 30s plank. 20 focused minutes beats skipping entirely.",
  },
  {
    tag: "Weight weirdness",
    question: "Why did my weight go up even though I\u2019ve been eating well?",
    answer:
      "Daily weight fluctuates from water retention, sodium, sleep, stress, and monthly cycles. Your 7-day moving average is still trending down \u2014 that\u2019s the number that actually matters.",
  },
  {
    tag: "Recipe rut",
    question: "I\u2019m bored with my meals. Can you mix it up?",
    answer:
      "Let\u2019s refresh your rotation. Here are 3 new recipes that fit your macros and budget with prep time under 30 minutes: Thai Basil Chicken, Sheet-Pan Salmon + Sweet Potato, and Greek Turkey Bowls.",
  },
];

type Message =
  | { role: "user"; content: string; id: number }
  | { role: "ai"; content: string; id: number; typed: string };

export function InteractiveCoach() {
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  function handleAsk(idx: number) {
    if (isTyping) return;
    const prompt = PROMPTS[idx];
    setActivePromptIdx(idx);
    const now = Date.now();
    setMessages((prev) => [
      ...prev.slice(-3),
      { role: "user", content: prompt.question, id: now },
      { role: "ai", content: prompt.answer, id: now + 1, typed: "" },
    ]);
    setIsTyping(true);
  }

  // Auto-ask the first prompt on mount so the UI is populated immediately
  useEffect(() => {
    handleAsk(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Type out the latest AI message character by character
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "ai") return;
    if (last.typed === last.content) {
      setIsTyping(false);
      return;
    }
    const nextLen = Math.min(last.content.length, last.typed.length + 2);
    const timeout = setTimeout(() => {
      setMessages((prev) => {
        const copy = [...prev];
        const idx = copy.length - 1;
        const target = copy[idx];
        if (target.role === "ai") {
          copy[idx] = { ...target, typed: target.content.slice(0, nextLen) };
        }
        return copy;
      });
    }, 14);
    return () => clearTimeout(timeout);
  }, [messages]);

  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-10 items-stretch">
      {/* Left column: prompt buttons */}
      <div className="flex flex-col">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-semibold text-violet-600 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Try the coach
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Ask FuelWell anything.
        </h3>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
          Tap any question below and watch the coach respond the same way it
          would inside the app. No judgment, no textbook answers.
        </p>

        <div className="space-y-3 flex-1">
          {PROMPTS.map((p, i) => (
            <button
              key={p.question}
              type="button"
              onClick={() => handleAsk(i)}
              disabled={isTyping}
              className={cn(
                "group w-full text-left rounded-2xl border-2 p-5 transition-all duration-200",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                activePromptIdx === i
                  ? "border-fw-accent bg-emerald-50/60 shadow-card"
                  : "border-fw-border bg-white hover:border-fw-accent/40 hover:-translate-y-0.5 hover:shadow-card"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                    activePromptIdx === i
                      ? "bg-fw-accent text-white"
                      : "bg-fw-surface text-muted-foreground"
                  )}
                >
                  {p.tag}
                </span>
                {activePromptIdx === i && !isTyping && (
                  <span className="text-[10px] text-fw-accent font-semibold">Asked</span>
                )}
              </div>
              <p
                className={cn(
                  "text-base font-semibold leading-snug",
                  activePromptIdx === i ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {p.question}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Right column: chat window */}
      <div className="rounded-3xl border-2 border-fw-border bg-white shadow-card-premium overflow-hidden flex flex-col min-h-[580px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-fw-border bg-gradient-to-r from-emerald-50 via-teal-50/70 to-white relative">
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_8px_20px_rgba(52,211,153,0.35)] ring-2 ring-white">
            <Bot className="h-5 w-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-foreground">FuelCoach AI</p>
              <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Premium</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-emerald-700 font-semibold">Online • average reply 0.4s</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-fw-accent bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shadow-sm">
            Live demo
          </span>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gradient-to-b from-white via-fw-surface/20 to-emerald-50/20">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "ai" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm ring-2 ring-white mt-0.5">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 text-foreground"
                      : "rounded-tl-sm bg-white border border-emerald-100 text-foreground shadow-card"
                  )}
                >
                  <p className="text-[15px] leading-[1.65]">
                    {msg.role === "user" ? msg.content : msg.typed}
                    {msg.role === "ai" && msg.typed !== msg.content && (
                      <span className="inline-block w-1.5 h-5 bg-fw-accent/80 ml-0.5 align-middle animate-pulse" />
                    )}
                  </p>
                  {msg.role === "ai" && msg.typed === msg.content && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-emerald-50">
                      <span className="text-[10px] text-emerald-600 font-semibold">✓ FuelCoach AI</span>
                      <span className="text-[10px] text-muted-foreground/70">• just now</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 ring-2 ring-white mt-0.5">
                    <User className="h-4 w-4 text-fw-orange" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Fake input footer */}
        <div className="px-5 py-3 border-t border-fw-border bg-white">
          <div className="flex items-center gap-2 rounded-2xl border border-fw-border bg-fw-surface/80 pl-4 pr-2 py-2">
            <span className="flex-1 text-sm text-muted-foreground/70">Tap a question on the left to ask...</span>
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm disabled:opacity-70"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
