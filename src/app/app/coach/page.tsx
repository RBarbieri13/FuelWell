"use client";

/**
 * Coach — agentic chat. Every action runs through /api/coach/turn (live
 * Anthropic model + 36 tools) and renders an inline artifact card. No intent
 * routing, no "go to that page" — the old deterministic version is archived
 * in _legacy/ for one commit.
 */

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Heading2,
  ImageIcon,
  Link2,
  ListTree,
  MessageCircle,
  Paperclip,
  Send,
  Sparkles,
  Table2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isPreviewHost, SAMPLE_USER } from "@/lib/preview-session";
import { remaining } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";
import { useCoachChat, type CoachProfile } from "@/lib/coach/client-store";
import type { CoachAttachment } from "@/lib/coach/types";
import {
  ArtifactRenderer,
  ConfirmCard,
  StreamingTextBubble,
} from "@/components/coach/artifacts";
import type { ArtifactSpec } from "@/lib/coach/types";
import type { CoachCardAction } from "@/components/coach/artifacts";

const INITIAL_PROFILE: CoachProfile = {
  displayName: undefined,
  goal: "lose",
  dietaryPreference: "none",
};

const richPreviewMarkdown = `## Dinner options for 102g protein left

| Option | Protein | Why it fits |
| --- | ---: | --- |
| Salmon bowl | 42g | Balanced fats, easy carbs |
| Turkey quinoa bowl | 48g | Highest protein density |

1. Build the plate:
   - Start with protein
   - Add produce
   - Finish with the carb gap

Formula check: $102g - 42g = 60g$ left after dinner.

![FuelWell rich chat preview](/icon-512.png)

[Open nutrition detail](/app/nutrition)`;

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/html",
  "application/json",
  "message/rfc822",
]);

function attachmentKind(file: File): CoachAttachment["kind"] | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (SUPPORTED_TEXT_TYPES.has(file.type)) return "text";
  if (/\.(txt|md|csv|json|html|eml)$/i.test(file.name)) return "text";
  return null;
}

async function readAttachment(file: File): Promise<CoachAttachment> {
  const kind = attachmentKind(file);
  if (!kind) {
    throw new Error(`${file.name} is not supported yet. Use an image, PDF, email, CSV, Markdown, JSON, or text file.`);
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error(`${file.name} is too large. Keep uploads under 10 MB for this coach turn.`);
  }

  const id = `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const base = {
    id,
    name: file.name,
    mediaType: file.type || (kind === "text" ? "text/plain" : "application/octet-stream"),
    size: file.size,
    kind,
  };

  if (kind === "text") {
    return { ...base, text: (await file.text()).slice(0, 80_000) };
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });

  return {
    ...base,
    data: dataUrl.split(",")[1] ?? "",
  };
}

function formatAttachmentSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

type CoachActionDrawerState = {
  id: string;
  artifact?: ArtifactSpec;
  confirm?: {
    toolName: string;
    input: unknown;
    prompt: string;
  };
} | null;

function latestActionDrawer(
  items: Array<{
    id: string;
    role: "user" | "assistant";
    artifacts: ArtifactSpec[];
    confirm?: {
      toolName: string;
      input: unknown;
      prompt: string;
    } | null;
  }>,
): CoachActionDrawerState {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item.role !== "assistant") continue;
    const artifact = item.artifacts.at(-1);
    if (artifact || item.confirm) {
      return {
        id: artifact?.id ?? `${item.id}-confirm`,
        artifact,
        confirm: item.confirm ?? undefined,
      };
    }
  }
  return null;
}

export default function CoachPage() {
  const { totals, targets } = useDayLog();
  const [profile, setProfile] = useState<CoachProfile>(INITIAL_PROFILE);
  const { items, busy, sendMessage, handleCardAction, newConversation } = useCoachChat(profile);
  const [input, setInput] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("prompt") ?? "";
  });
  const [attachments, setAttachments] = useState<CoachAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dismissedDrawerId, setDismissedDrawerId] = useState<string | null>(null);
  const [collapsedDrawerId, setCollapsedDrawerId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      if (isPreviewHost(window.location.host) || !hasSupabaseConfig()) {
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

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    if (items.length > 0 || busy) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items, busy]);

  const quickPrompts = useMemo(() => {
    if (totals.calories === 0) {
      return [
        "What should I do right now?",
        "Analyze a menu or food photo",
        "Log my breakfast",
        "Plan a 30 min workout",
      ];
    }
    const proteinLeft = remaining(totals.protein, targets.protein);
    return [
      "What should I do right now?",
      proteinLeft >= 40 ? `Suggest a meal with ${proteinLeft}g protein left` : "What can I eat tonight?",
      "Give me my daily recap",
      "Analyze a menu or food photo",
      "Plan a workout for today",
    ];
  }, [totals, targets]);

  const actionDrawer = latestActionDrawer(items);
  const showActionDrawer = !!actionDrawer && dismissedDrawerId !== actionDrawer.id;
  const isActionDrawerCollapsed = !!actionDrawer && collapsedDrawerId === actionDrawer.id;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if ((!text && attachments.length === 0) || busy) return;
    setInput("");
    setAttachments([]);
    setUploadError(null);
    void sendMessage(
      text || "Please interpret the attached file(s) for my nutrition, workout, recovery, or health decision.",
      attachments
    );
  }

  async function handleAttachmentChange(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    try {
      const available = Math.max(0, MAX_ATTACHMENTS - attachments.length);
      const selected = Array.from(files).slice(0, available);
      const next = await Promise.all(selected.map(readAttachment));
      setAttachments((current) => [...current, ...next]);
      if (files.length > available) {
        setUploadError(`Attached the first ${available} file${available === 1 ? "" : "s"}. Limit is ${MAX_ATTACHMENTS} per coach turn.`);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not attach that file.");
    }
  }

  return (
    <div className="fw-coach-page flex h-full flex-col">
      <div className="fw-page-header px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-primary-600 text-white shadow-[0_16px_34px_rgba(21,145,108,0.22)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="fw-heading text-xl">Coach</h1>
              <p className="text-xs font-bold text-[#78928a]">
                {busy ? "Working..." : "Logs meals, plans workouts, answers — right here"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app/coach/attachments" className="hidden text-sm font-black text-primary-700 sm:inline">
              Attachments
            </Link>
            <Link href="/app/coach/menu-review" className="hidden text-sm font-black text-primary-700 sm:inline">
              Menu review
            </Link>
            <button
              type="button"
              onClick={newConversation}
              className="whitespace-nowrap rounded-full bg-white/70 px-3 py-2 text-xs font-black text-[#78928a] shadow-sm transition hover:text-primary-700"
            >
              New chat
            </button>
            <Link href="/app/dashboard" className="hidden text-sm font-black text-primary-700 sm:inline">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="min-w-0 space-y-5">
            {items.length === 0 && (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
              <section className="fw-dark-panel rounded-[2rem] border p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary-100">
                  <MessageCircle className="h-4 w-4" />
                  Agentic coach
                </div>
                <h2 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-white md:text-5xl">
                  Ask for the next useful move.
                </h2>
                <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/70">
                  I can log meals, generate tables, plan workouts, compare
                  choices, render recipes, update groceries, and explain your
                  numbers directly in chat.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    ["102g", "protein left"],
                    ["4", "rich formats"],
                    ["live", "tools"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-[1.2rem] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur"
                    >
                      <p className="text-2xl font-black tabular-nums text-white">{value}</p>
                      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/58">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-[2rem] border border-primary-100/80 bg-white/90 p-5 shadow-[0_22px_60px_rgba(22,48,42,0.10)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">
                      Try asking
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[#16302a]">Start with a useful question</h2>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-4 grid gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="group flex min-h-12 items-center justify-between gap-3 rounded-[1.2rem] border border-primary-100 bg-[#f7faf8] px-4 py-3 text-left text-sm font-black text-[#516b63] transition hover:border-primary-200 hover:bg-primary-50"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary-500 transition group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
            )}

            {items.map((item) => {
              const hiddenArtifactId = showActionDrawer ? actionDrawer?.artifact?.id : undefined;
              const visibleArtifacts = hiddenArtifactId
                ? item.artifacts.filter((artifact) => artifact.id !== hiddenArtifactId)
                : item.artifacts;
              const hideConfirm =
                showActionDrawer && item.confirm && actionDrawer?.id === `${item.id}-confirm`;

              return (
            <div key={item.id} className="space-y-3">
              <div
                className={cn(
                  "flex gap-3",
                  item.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {item.role === "assistant" && <CoachAvatar />}
                {item.role === "user" ? (
                  <div className="max-w-[85%] rounded-3xl rounded-br-md bg-primary-700 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm shadow-primary-900/15">
                    {item.attachments && item.attachments.length > 0 && (
                      <AttachmentSummary attachments={item.attachments} sent />
                    )}
                    {item.text}
                  </div>
                ) : (
                  <div className="max-w-[85%] min-w-0 flex-1 space-y-3">
                    {(item.text || item.streaming) && (
                      <StreamingTextBubble text={item.text} streaming={!!item.streaming} />
                    )}
                    {visibleArtifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="fw-artifact-scope"
                        data-testid={`artifact-${artifact.type}`}
                      >
                        <ArtifactRenderer artifact={artifact} onAction={handleCardAction} />
                      </div>
                    ))}
                    {item.confirm && !hideConfirm && (
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
              );
            })}

            {items.length === 0 && (
            <RichTextPreview />
            )}

            <div ref={endRef} />
          </div>

          {showActionDrawer && actionDrawer && (
            <CoachActionDrawer
              drawer={actionDrawer}
              collapsed={isActionDrawerCollapsed}
              onAction={handleCardAction}
              onCollapse={() => setCollapsedDrawerId(actionDrawer.id)}
              onExpand={() => setCollapsedDrawerId(null)}
              onClose={() => {
                setDismissedDrawerId(actionDrawer.id);
                setCollapsedDrawerId(null);
              }}
            />
          )}
        </div>
      </main>

      <div className="border-t border-primary-100/80 bg-white/88 px-4 py-3 backdrop-blur-xl md:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-2">
          {attachments.length > 0 && (
            <AttachmentTray
              attachments={attachments}
              onRemove={(id) => setAttachments((current) => current.filter((item) => item.id !== id))}
            />
          )}
          {uploadError && (
            <p className="rounded-full bg-accent-100 px-4 py-2 text-xs font-black text-accent-700">
              {uploadError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <label
              className="flex min-h-12 w-12 cursor-pointer items-center justify-center rounded-[1.35rem] border border-primary-100 bg-primary-50/70 text-primary-700 transition hover:bg-primary-100"
              title="Attach screenshot, menu, photo, PDF, email, or text file"
            >
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,text/html,application/json,message/rfc822,.png,.jpg,.jpeg,.webp,.gif,.pdf,.eml,.md,.csv,.json,.txt,.html"
                className="sr-only"
                disabled={busy || attachments.length >= MAX_ATTACHMENTS}
                onChange={(event) => {
                  void handleAttachmentChange(event.target.files);
                  event.currentTarget.value = "";
                }}
                aria-label="Attach screenshot, menu, photo, or file"
              />
            </label>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Upload a food photo, email, label, workout image, or ask anything..."
              className="min-h-12 flex-1 rounded-[1.35rem] border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm font-semibold text-[#16302a] placeholder:text-[#91a7a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={busy}
              aria-label="Message Coach"
            />
            <Button type="submit" disabled={(!input.trim() && attachments.length === 0) || busy} aria-label="Send" className="min-h-12 px-4">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CoachActionDrawer({
  drawer,
  collapsed,
  onAction,
  onCollapse,
  onExpand,
  onClose,
}: {
  drawer: {
    id: string;
    artifact?: ArtifactSpec;
    confirm?: {
      toolName: string;
      input: unknown;
      prompt: string;
    };
  };
  collapsed: boolean;
  onAction: (action: CoachCardAction) => void;
  onCollapse: () => void;
  onExpand: () => void;
  onClose: () => void;
}) {
  const meta = drawer.artifact
    ? actionDrawerMeta(drawer.artifact)
      : {
        title: "Confirm this action",
        detail: "Review before FuelWell changes your data.",
        route: "/app/coach",
        routeLabel: "Stay in Coach",
        followup: "Explain what will change if I confirm this action.",
      };

  if (collapsed) {
    return (
      <aside className="fixed right-0 top-1/2 z-40 -translate-y-1/2">
        <button
          type="button"
          onClick={onExpand}
          className="flex min-h-28 w-11 flex-col items-center justify-center gap-2 rounded-l-[1.2rem] border border-r-0 border-primary-100 bg-white/95 text-primary-700 shadow-[0_18px_42px_rgba(22,48,42,0.16)] backdrop-blur transition hover:bg-primary-50"
          aria-label="Expand coach action panel"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="rotate-180 text-[10px] font-black uppercase tracking-[0.14em] [writing-mode:vertical-rl]">
            Action
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="pointer-events-none fixed inset-x-3 bottom-[5.75rem] z-40 max-h-[72vh] xl:inset-x-auto xl:bottom-[6.25rem] xl:right-4 xl:top-[6.5rem] xl:w-[min(28rem,calc(100vw-2rem))]">
      <div className="pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300 xl:h-full xl:slide-in-from-right-8">
        <div className="flex max-h-[72vh] flex-col rounded-[2rem] border border-primary-100/90 bg-white/95 p-4 shadow-[0_28px_80px_rgba(22,48,42,0.20)] backdrop-blur xl:h-full xl:max-h-none xl:rounded-l-[2rem] xl:rounded-r-[1.25rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] bg-primary-100 text-primary-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">
                  Coach action
                </p>
                <h2 className="mt-1 text-lg font-black leading-tight text-[#16302a]">
                  {meta.title}
                </h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#78928a]">
                  {meta.detail}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onCollapse}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f8f6] text-[#78928a] transition hover:bg-primary-100 hover:text-primary-700"
                aria-label="Collapse coach action panel"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f8f6] text-[#78928a] transition hover:bg-accent-100 hover:text-accent-700"
                aria-label="Close coach action panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1 rounded-[1.45rem] border border-primary-100 bg-primary-50/55 p-3">
            {drawer.artifact ? (
              <div className="fw-artifact-scope h-full overflow-y-auto pr-1">
                <ArtifactRenderer artifact={drawer.artifact} onAction={onAction} />
              </div>
            ) : drawer.confirm ? (
              <ConfirmCard
                toolName={drawer.confirm.toolName}
                input={drawer.confirm.input}
                prompt={drawer.confirm.prompt}
                onAction={onAction}
              />
            ) : null}
          </div>

          <div className="mt-4 grid gap-2">
            <Link
              href={meta.route}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-black text-white shadow-[0_16px_34px_rgba(21,145,108,0.22)] transition hover:bg-primary-700"
            >
              {meta.routeLabel}
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => onAction({ kind: "send_message", text: meta.followup })}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-black text-primary-800 shadow-sm transition hover:bg-primary-50"
            >
              Ask Coach to review this
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function actionDrawerMeta(artifact: ArtifactSpec) {
  switch (artifact.type) {
    case "grocery_list":
      return {
        title: "Grocery list updated",
        detail: "Snapshot reflects the same list used on the Groceries page.",
        route: "/app/grocery-list",
        routeLabel: "Open Groceries",
        followup: "Review my grocery list and tell me the next best shopping move.",
      };
    case "meal_logged":
    case "meal_deleted":
    case "todays_plate":
    case "meal_suggestions":
    case "food_search_results":
      return {
        title: "Nutrition data updated",
        detail: "Meal changes update today's macro math across FuelWell.",
        route: "/app/log",
        routeLabel: "Open Log Meal",
        followup: "Review today's meals and macros after this change.",
      };
    case "workout_logged":
    case "workout_plan":
    case "workout_session":
    case "workout_suggestions":
      return {
        title: "Workout context ready",
        detail: "Workout actions update the same activity context used in Fitness.",
        route: "/app/workouts",
        routeLabel: "Open Workouts",
        followup: "Review this workout against my recent training and recovery.",
      };
    case "recipe_list":
    case "recipe_detail":
    case "meal_plan":
      return {
        title: "Recipe or meal plan ready",
        detail: "Use this to save food ideas into meals or groceries.",
        route: "/app/recipes",
        routeLabel: "Open Recipes",
        followup: "Turn this into a practical meal plan and grocery list.",
      };
    case "preferences_updated":
    case "target_change_proposal":
    case "goal_progress":
    case "weekly_goal_review":
      return {
        title: "Profile and targets reviewed",
        detail: "These settings shape calorie targets, macros, and coach guidance.",
        route: "/app/settings#health-profile",
        routeLabel: "Open Settings",
        followup: "Explain how this affects my calorie target and macros.",
      };
    case "macro_history":
    case "inflows_outflows":
    case "weight_trend":
    case "daily_recap":
    case "health_score":
    case "metric_explainer":
      return {
        title: "Stats review ready",
        detail: "Coach can turn your history into charts, summaries, and next moves.",
        route: "/app/daily-review",
        routeLabel: "Open Daily Review",
        followup: "Summarize the pattern and tell me what to change next.",
      };
    default:
      return {
        title: "Coach result ready",
        detail: "This panel keeps the latest action visible while you keep chatting.",
        route: "/app/coach",
        routeLabel: "Stay in Coach",
        followup: "Explain what I should do with this result.",
      };
  }
}

function CoachAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white">
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

function AttachmentTray({
  attachments,
  onRemove,
}: {
  attachments: CoachAttachment[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[1.25rem] border border-primary-100 bg-primary-50/70 p-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex min-w-[13rem] items-center gap-3 rounded-[1rem] bg-white px-3 py-2 shadow-sm"
        >
          <AttachmentIcon attachment={attachment} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-[#16302a]">{attachment.name}</p>
            <p className="text-[11px] font-bold text-[#7c968f]">
              {attachment.kind} · {formatAttachmentSize(attachment.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(attachment.id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4f8f6] text-[#78928a] transition hover:bg-accent-100 hover:text-accent-700"
            aria-label={`Remove ${attachment.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AttachmentSummary({
  attachments,
  sent = false,
}: {
  attachments: Array<Pick<CoachAttachment, "id" | "name" | "mediaType" | "size" | "kind">>;
  sent?: boolean;
}) {
  return (
    <div className={cn("mb-2 grid gap-1.5", sent ? "text-white" : "text-[#16302a]")}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black",
            sent ? "bg-white/14 text-white" : "bg-primary-50 text-primary-800"
          )}
        >
          {attachment.kind === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          <span className="truncate">{attachment.name}</span>
          <span className="opacity-70">{formatAttachmentSize(attachment.size)}</span>
        </div>
      ))}
    </div>
  );
}

function AttachmentIcon({ attachment }: { attachment: CoachAttachment }) {
  if (attachment.kind === "image" && attachment.data) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`data:${attachment.mediaType};base64,${attachment.data}`}
        alt=""
        className="h-11 w-11 shrink-0 rounded-[0.85rem] object-cover"
      />
    );
  }

  const Icon = attachment.kind === "image" ? ImageIcon : FileText;
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.85rem] bg-primary-100 text-primary-700">
      <Icon className="h-5 w-5" />
    </span>
  );
}

function RichTextPreview() {
  const capabilities = [
    { label: "Tables", detail: "Meal comparisons and macro rows", icon: Table2, tone: "bg-primary-100 text-primary-700" },
    { label: "Nested lists", detail: "Steps, substeps, and checklists", icon: ListTree, tone: "bg-sky-100 text-sky-700" },
    { label: "Formulas", detail: "Math rendered inline with KaTeX", icon: Calculator, tone: "bg-lemon-100 text-lemon-700" },
    { label: "Media", detail: "Images and links inside replies", icon: ImageIcon, tone: "bg-accent-100 text-accent-700" },
  ];

  return (
    <section className="rounded-[2rem] border border-primary-100/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(22,48,42,0.07)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">
            Rich response support
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#16302a]">Coach answers can be structured, visual, and math-aware.</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#78928a]">
            The same chat bubble supports headers, nested lists, tables, formulas, links, and inline media when the coach replies.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:w-[30rem]">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="fw-soft-row flex gap-3 p-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] ${item.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#16302a]">{item.label}</p>
                  <p className="text-xs font-semibold leading-5 text-[#78928a]">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex gap-3">
          <CoachAvatar />
          <div className="min-w-0 flex-1">
            <StreamingTextBubble text={richPreviewMarkdown} streaming={false} />
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-primary-100 bg-primary-50/80 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-primary-700 shadow-sm">
            <Heading2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-black text-[#16302a]">Inline artifacts stay in the conversation.</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#516b63]">
            The coach can answer in prose, then attach action cards for logging meals, opening pages, or saving preferences.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-primary-800">
            <Link2 className="h-3.5 w-3.5" />
            Chat-native actions
          </div>
        </div>
      </div>
    </section>
  );
}
