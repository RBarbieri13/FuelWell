"use client";

/**
 * Coach — agentic chat. Every action runs through /api/coach/turn (live
 * Anthropic model + 36 tools) and renders an inline artifact card. No intent
 * routing, no "go to that page" — the old deterministic version is archived
 * in _legacy/ for one commit.
 */

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { isPreviewHost, SAMPLE_USER } from "@/lib/preview-session";
import { remaining } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";
import { useCoachChat, type CoachProfile } from "@/lib/coach/client-store";
import {
  ArtifactRenderer,
  ConfirmCard,
  StreamingTextBubble,
} from "@/components/coach/artifacts";

const INITIAL_PROFILE: CoachProfile = {
  displayName: undefined,
  goal: "lose",
  dietaryPreference: "none",
};

export default function CoachPage() {
  const { totals, targets } = useDayLog();
  const [profile, setProfile] = useState<CoachProfile>(INITIAL_PROFILE);
  const { items, busy, sendMessage, handleCardAction, newConversation } = useCoachChat(profile);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user && isPreviewHost(window.location.host)) {
        setProfile({
          displayName: SAMPLE_USER.displayName,
          goal: SAMPLE_USER.goal,
          activityLevel: SAMPLE_USER.activityLevel,
          dietaryPreference: SAMPLE_USER.dietaryPreference,
          weightKg: SAMPLE_USER.weightKg,
          heightCm: SAMPLE_USER.heightCm,
        });
        return;
      }
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, goal, activity_level, dietary_preference, weight_kg, height_cm")
        .eq("id", user.id)
        .single();
      setProfile({
        displayName: data?.display_name ?? undefined,
        goal: data?.goal ?? "lose",
        activityLevel: data?.activity_level ?? undefined,
        dietaryPreference: data?.dietary_preference ?? "none",
        weightKg: data?.weight_kg ?? undefined,
        heightCm: data?.height_cm ?? undefined,
      });
    }
    void loadProfile();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items, busy]);

  const quickPrompts = useMemo(() => {
    if (totals.calories === 0) {
      return [
        "What should I do right now?",
        "Log my breakfast",
        "Plan a 30 min workout",
        "Show me my macros this week",
      ];
    }
    const proteinLeft = remaining(totals.protein, targets.protein);
    return [
      "What should I do right now?",
      proteinLeft >= 40 ? `Suggest a meal with ${proteinLeft}g protein left` : "What can I eat tonight?",
      "Give me my daily recap",
      "Plan a workout for today",
    ];
  }, [totals, targets]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage(text);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-50">
      <div className="border-b border-white/70 bg-white/72 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-primary-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-neutral-900">Coach</h1>
              <p className="text-xs font-bold text-neutral-400">
                {busy ? "Working..." : "Logs meals, plans workouts, answers — right here"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={newConversation}
              className="text-xs font-bold text-neutral-400 transition hover:text-neutral-700"
            >
              New chat
            </button>
            <Link href="/app/dashboard" className="text-sm font-bold text-primary-700">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {items.length === 0 && (
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-neutral-800">
                Ask for anything — I log meals, plan workouts, pick restaurants, and pull up your
                numbers right here in the chat.
              </p>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="space-y-3">
              <div
                className={cn(
                  "flex gap-3",
                  item.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {item.role === "assistant" && <CoachAvatar />}
                {item.role === "user" ? (
                  <div className="max-w-[85%] rounded-3xl rounded-br-md bg-neutral-900 px-4 py-3 text-sm font-medium leading-6 text-white shadow-sm">
                    {item.text}
                  </div>
                ) : (
                  <div className="max-w-[85%] min-w-0 flex-1 space-y-3">
                    {(item.text || item.streaming) && (
                      <StreamingTextBubble text={item.text} streaming={!!item.streaming} />
                    )}
                    {item.artifacts.map((artifact) => (
                      <div key={artifact.id} data-testid={`artifact-${artifact.type}`}>
                        <ArtifactRenderer artifact={artifact} onAction={handleCardAction} />
                      </div>
                    ))}
                    {item.confirm && (
                      <ConfirmCard
                        toolName={item.confirm.toolName}
                        input={item.confirm.input}
                        prompt={item.confirm.prompt}
                        onAction={handleCardAction}
                      />
                    )}
                  </div>
                )}
                {item.role === "user" && <UserAvatar />}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="pt-2">
              <p className="mb-3 text-xs font-black uppercase tracking-wider text-neutral-400">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition hover:border-primary-300 hover:bg-primary-50/70 hover:text-primary-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      <div className="border-t border-white/70 bg-white/86 px-4 py-3 backdrop-blur-xl md:px-8">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Log food, plan a workout, ask anything..."
            className="flex-1 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={busy}
            aria-label="Message Coach"
          />
          <Button type="submit" disabled={!input.trim() || busy} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function CoachAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-primary-300">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
      <User className="h-4 w-4" />
    </div>
  );
}
