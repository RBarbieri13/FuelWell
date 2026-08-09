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
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calculator,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Dumbbell,
  ExternalLink,
  FileText,
  Heading2,
  ImageIcon,
  Link2,
  ListTree,
  MessageCircle,
  Paperclip,
  RotateCcw,
  Send,
  ShoppingBasket,
  Sparkles,
  SquarePen,
  Table2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isPreviewHost, SAMPLE_USER } from "@/lib/preview-session";
import { readPreviewOnboardingOverride } from "@/lib/preview-onboarding";
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
  const {
    items,
    busy,
    sendMessage,
    handleCardAction,
    newConversation,
    retryLastTurn,
    hasEarlier,
    loadEarlier,
    loadingEarlier,
  } = useCoachChat(profile);
  const [input, setInput] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("prompt") ?? "";
  });
  const [attachments, setAttachments] = useState<CoachAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dismissedDrawerId, setDismissedDrawerId] = useState<string | null>(null);
  const [collapsedDrawerId, setCollapsedDrawerId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfile() {
      if (isPreviewHost(window.location.host) || !hasSupabaseConfig()) {
        const override = readPreviewOnboardingOverride()?.data;
        setProfile({
          displayName: override?.displayName?.trim() || SAMPLE_USER.displayName,
          goal: override?.goal || SAMPLE_USER.goal,
          activityLevel: override?.activityLevel || SAMPLE_USER.activityLevel,
          dietaryPreference: override?.dietaryPreference || SAMPLE_USER.dietaryPreference,
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

  // Follow the newest message only. Keying on the LAST item's signature (not
  // the whole array) keeps "show earlier" prepends from yanking the viewport
  // to the bottom, and instant scrolling during streaming avoids restarting a
  // smooth scroll on every token batch.
  const lastItem = items.at(-1);
  const lastItemSignature = lastItem
    ? `${lastItem.id}:${lastItem.text.length}:${lastItem.artifacts.length}:${lastItem.streaming ? 1 : 0}`
    : "";
  useEffect(() => {
    if (items.length > 0 || busy) {
      endRef.current?.scrollIntoView({ behavior: busy ? "auto" : "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastItemSignature, busy]);

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
  const attachDisabled = busy || attachments.length >= MAX_ATTACHMENTS;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if ((!text && attachments.length === 0) || busy) return;
    if (actionDrawer) setCollapsedDrawerId(actionDrawer.id);
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
      <div className="fw-page-header px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-b from-primary-500 to-teal-600 text-white shadow-glow">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="fw-heading text-xl">Coach</h1>
              {/* The subtitle doubles as the live status line, so the busy
                  state gets a pulsing dot rather than only a word change. */}
              <p
                className="flex items-center gap-1.5 text-xs font-bold text-ink-muted"
                aria-live="polite"
              >
                {busy && (
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary-500 motion-reduce:animate-none"
                  />
                )}
                <span className="min-[640px]:hidden">
                  {busy ? "Working..." : "Plan, log, and review"}
                </span>
                <span className="hidden min-[640px]:inline">
                  {busy ? "Working..." : "Logs meals, plans workouts, answers — right here"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <HeaderLink href="/app/coach/attachments">Attachments</HeaderLink>
            <HeaderLink href="/app/coach/menu-review">Menu review</HeaderLink>
            <HeaderLink href="/app/dashboard">Dashboard</HeaderLink>
            <button
              type="button"
              onClick={newConversation}
              className="fw-press inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface/80 px-3.5 py-2 text-xs font-black text-ink-muted shadow-e1 ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
            >
              <SquarePen className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              New chat
            </button>
          </div>
        </div>
      </div>

      {/* The bottom fade is always on, and the bottom padding is always at
          least the 2.5rem the mask consumes — so the fade lands on empty
          padding and can never slice the last row of text mid-glyph. */}
      <main
        className={cn(
          "fw-chat-bottom-fade min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 pt-5 sm:px-4 sm:pt-6 md:px-8",
          items.length === 0 ? "pb-14" : "pb-11 sm:pb-12"
        )}
      >
        <div className="mx-auto w-full max-w-5xl min-w-0">
          <div className="min-w-0 space-y-5">
            {items.length === 0 && (
            <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
              <section className="fw-dark-panel rounded-[2rem] border p-4 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-primary-100">
                  <MessageCircle className="h-4 w-4" />
                  Agentic coach
                </div>
                <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-white md:mt-4 md:text-5xl">
                  Ask for the next useful move.
                </h2>
                <p className="mt-3 hidden max-w-2xl text-sm font-semibold leading-6 text-white/70 sm:block md:text-base md:leading-7">
                  One chat that reads your day and acts on it — meals logged,
                  workouts planned, groceries updated, numbers explained.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
                  <span className="inline-flex items-baseline rounded-full bg-white/10 px-3 py-1.5 text-xs font-black tabular-nums text-white ring-1 ring-inset ring-white/15">
                    {remaining(totals.calories, targets.calories).toLocaleString()}
                    <span className="ml-1 font-bold text-white/70">kcal left</span>
                  </span>
                  <span className="inline-flex items-baseline rounded-full bg-white/10 px-3 py-1.5 text-xs font-black tabular-nums text-white ring-1 ring-inset ring-white/15">
                    {remaining(totals.protein, targets.protein)}g
                    <span className="ml-1 font-bold text-white/70">protein left</span>
                  </span>
                </div>
                <Button
                  size="lg"
                  className="mt-6 rounded-full px-6 py-3 text-sm"
                  onClick={() => void sendMessage("What should I do right now?")}
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Ask for today&apos;s plan
                </Button>
              </section>
              <section className="rounded-[2rem] bg-surface/92 p-5 shadow-e3 ring-1 ring-inset ring-hairline">
                <SectionHeader
                  eyebrow="Try asking"
                  title="Start with a useful question"
                  action={
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
                    >
                      <Sparkles className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                    </span>
                  }
                />
                <div className="mt-4 grid gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="fw-press group flex min-h-12 items-center justify-between gap-3 rounded-[1.2rem] bg-surface-subtle px-4 py-3 text-left text-sm font-bold text-ink-muted ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                    >
                      <span className="min-w-0">{prompt}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-primary-500 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <button
              type="button"
              onClick={() => setShowTour((value) => !value)}
              aria-expanded={showTour}
              className="fw-press flex min-h-12 w-full items-center justify-between gap-3 rounded-[1.35rem] bg-surface/85 px-4 py-3 text-left text-sm font-black text-primary-700 shadow-e1 ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
            >
              <span className="min-w-0">How Coach works and what it can do</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 ease-out-soft",
                  showTour && "rotate-180"
                )}
                strokeWidth={2}
              />
            </button>
            {showTour && (
            <div className="grid gap-4 duration-300 ease-out-soft animate-in fade-in slide-in-from-top-2 xl:grid-cols-2">
              <section className="rounded-[2rem] bg-surface/92 p-5 shadow-e3 ring-1 ring-inset ring-hairline md:p-6">
                <SectionHeader
                  eyebrow="How a chat plays out"
                  title="From question to logged in three moves"
                />
                <ol className="mt-4 space-y-2">
                  {[
                    {
                      title: "You ask",
                      body: "“What fits my macros tonight?” — plain words, or a menu photo.",
                    },
                    {
                      title: "The coach checks your actual day",
                      body: "It reads today's totals, targets, and history, then proposes options that fit the gap.",
                    },
                    {
                      title: "One tap makes it real",
                      body: "Confirm and the meal is logged, groceries update, and the dashboard reflects it instantly.",
                    },
                  ].map((step, index) => (
                    <li
                      key={step.title}
                      className="flex gap-3 rounded-[1.2rem] bg-surface-subtle p-3.5 ring-1 ring-inset ring-hairline"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-black tabular-nums text-white shadow-e1"
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-ink">{step.title}</p>
                        <p className="mt-0.5 text-sm font-semibold leading-6 text-ink-muted">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="rounded-[2rem] bg-surface/92 p-5 shadow-e3 ring-1 ring-inset ring-hairline md:p-6">
                <SectionHeader
                  eyebrow="What it can do"
                  title="A coach with hands, not just answers"
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      icon: Camera,
                      title: "Log meals",
                      body: "Text, menus, or food photos become logged macros.",
                    },
                    {
                      icon: Dumbbell,
                      title: "Plan workouts",
                      body: "Sessions sized to your recovery and schedule.",
                    },
                    {
                      icon: ShoppingBasket,
                      title: "Recipes to groceries",
                      body: "Pick a meal and the grocery list updates itself.",
                    },
                    {
                      icon: BarChart3,
                      title: "Explain your numbers",
                      body: "Honest readouts of targets, trends, and trade-offs.",
                    },
                  ].map((capability) => (
                    <div
                      key={capability.title}
                      className="rounded-[1.2rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
                      >
                        <capability.icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                      </span>
                      <p className="mt-3 text-sm font-black text-ink">{capability.title}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                        {capability.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            )}
            </div>
            )}

            {hasEarlier && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadEarlier()}
                  disabled={loadingEarlier}
                  aria-busy={loadingEarlier || undefined}
                  className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/85 px-4 py-2 text-xs font-black text-primary-700 shadow-e1 ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 disabled:pointer-events-none disabled:opacity-60"
                >
                  {loadingEarlier && (
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 motion-reduce:animate-none"
                    />
                  )}
                  {loadingEarlier ? "Loading earlier messages…" : "Show earlier messages"}
                </button>
              </div>
            )}

            {items.length > 0 && (
            <div className="min-w-0">
            {items.map((item, index) => {
              const hiddenArtifactId = showActionDrawer ? actionDrawer?.artifact?.id : undefined;
              const visibleArtifacts = hiddenArtifactId
                ? item.artifacts.filter((artifact) => artifact.id !== hiddenArtifactId)
                : item.artifacts;
              const hideConfirm =
                showActionDrawer && item.confirm && actionDrawer?.id === `${item.id}-confirm`;
              // Consecutive turns from the same speaker read as one utterance:
              // the avatar prints once per run and the follow-on rows sit
              // closer together, so the column has rhythm instead of an even
              // ladder of identical gaps.
              const startsRun = items[index - 1]?.role !== item.role;

              return (
            <div
              key={item.id}
              className={cn(
                "max-w-full min-w-0 space-y-3",
                index === 0 ? "" : startsRun ? "mt-5" : "mt-1.5"
              )}
            >
              <div
                className={cn(
                  "flex max-w-full min-w-0 gap-2 sm:gap-3",
                  item.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {item.role === "assistant" &&
                  (startsRun ? <CoachAvatar /> : <AvatarGutter />)}
                {item.role === "user" ? (
                  // Mirror of the assistant bubble: same radius, same tail
                  // geometry on the opposite corner, one elevation step — so
                  // the two sides read as the same object in two voices.
                  <div className="relative max-w-full min-w-0 sm:max-w-[85%]">
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3 -right-1 h-3 w-3 rotate-45 rounded-[3px] bg-primary-700"
                    />
                    <div className="relative max-w-full min-w-0 break-words rounded-[1.5rem] rounded-br-md bg-gradient-to-b from-primary-600 to-primary-700 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-e2 ring-1 ring-inset ring-white/10 duration-300 ease-out-soft animate-in fade-in slide-in-from-bottom-1 [overflow-wrap:anywhere] sm:px-4">
                      {item.attachments && item.attachments.length > 0 && (
                        <AttachmentSummary attachments={item.attachments} sent />
                      )}
                      {item.text}
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full max-w-full min-w-0 flex-1 space-y-3 sm:max-w-[85%]"
                    data-testid="coach-assistant-message"
                  >
                    {(item.text || item.streaming) && (
                      <StreamingTextBubble text={item.text} streaming={!!item.streaming} />
                    )}
                    {visibleArtifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="fw-artifact-scope w-full max-w-full min-w-0"
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
                    {item.error && index === items.length - 1 && !busy && (
                      <button
                        type="button"
                        onClick={retryLastTurn}
                        className="fw-press inline-flex min-h-11 items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-xs font-black text-accent-700 ring-1 ring-inset ring-accent-200 hover:bg-accent-100 active:bg-accent-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600"
                      >
                        <RotateCcw className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        Try again
                      </button>
                    )}
                  </div>
                )}
                {item.role === "user" &&
                  (startsRun ? <UserAvatar /> : <AvatarGutter />)}
              </div>
            </div>
              );
            })}
            </div>
            )}

            {items.length === 0 && (
            <RichTextPreview />
            )}

            <div ref={endRef} />
          </div>
        </div>
      </main>

      {/* Rendered as a sibling of <main>, never inside it: the transcript
          carries a mask-image, and a mask on an ancestor clips and fades its
          position:fixed descendants — which would slice the drawer's footer
          actions clean off. */}
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

      {/* fw-lift-edge puts a hairline highlight along the top of the bar, so the
          composer reads as sitting above the transcript rather than being cut
          out of it — the counterpart to the scroll fade directly above. */}
      <div className="fw-lift-edge border-t border-hairline bg-surface/88 px-4 py-3 backdrop-blur-xl md:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-2">
          {attachments.length > 0 && (
            <AttachmentTray
              attachments={attachments}
              onRemove={(id) => setAttachments((current) => current.filter((item) => item.id !== id))}
            />
          )}
          {uploadError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-[1.1rem] bg-accent-50 px-3.5 py-2 text-xs font-black leading-5 text-accent-700 ring-1 ring-inset ring-accent-200"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="min-w-0">{uploadError}</span>
            </p>
          )}
          {/* The whole rail lifts on focus-within, so typing feels like the
              composer comes forward rather than one input glowing in place. */}
          <div className="flex min-w-0 items-center gap-2 rounded-[1.6rem] bg-surface/70 p-1 shadow-e1 ring-1 ring-inset ring-hairline transition-shadow duration-200 ease-out-soft focus-within:bg-surface focus-within:shadow-e3 focus-within:ring-primary-300">
            <label
              className={cn(
                "fw-press flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100",
                attachDisabled
                  ? "cursor-not-allowed opacity-45"
                  : "cursor-pointer hover:bg-primary-100 active:bg-primary-200",
                "focus-within:outline-none focus-within:ring-[3px] focus-within:ring-primary-600"
              )}
              title="Attach screenshot, menu, photo, PDF, email, or text file"
            >
              <Paperclip className="h-4 w-4" strokeWidth={2} />
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,text/html,application/json,message/rfc822,.png,.jpg,.jpeg,.webp,.gif,.pdf,.eml,.md,.csv,.json,.txt,.html"
                className="sr-only"
                disabled={attachDisabled}
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
              onFocus={() => {
                if (actionDrawer) setCollapsedDrawerId(actionDrawer.id);
              }}
              placeholder="Ask, or attach a photo…"
              className="min-h-12 min-w-0 flex-1 rounded-[1.2rem] bg-transparent px-3 py-3 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
              disabled={busy}
              autoComplete="off"
              // Mobile keyboards otherwise offer a newline key on a form that
              // has no newline to give.
              enterKeyHint="send"
              aria-label="Message Coach"
            />
            <Button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || busy}
              loading={busy}
              aria-label="Send"
              className="h-12 w-12 shrink-0 rounded-[1.2rem] px-0"
            >
              {!busy && <Send className="h-4 w-4" strokeWidth={2} />}
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
          className="fw-press flex min-h-28 w-11 flex-col items-center justify-center gap-2 rounded-l-[1.2rem] bg-surface/95 text-primary-700 shadow-e3 ring-1 ring-inset ring-hairline backdrop-blur hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
          aria-label="Expand coach action panel"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          <span className="rotate-180 text-[10px] font-black uppercase tracking-[0.14em] [writing-mode:vertical-rl]">
            Action
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="pointer-events-none fixed inset-x-3 bottom-[5.75rem] z-40 max-h-[72vh] xl:inset-x-auto xl:bottom-[6.25rem] xl:right-4 xl:top-[6.5rem] xl:w-[min(28rem,calc(100vw-2rem))]">
      <div className="pointer-events-auto duration-300 ease-out-soft animate-in fade-in slide-in-from-bottom-5 xl:h-full xl:slide-in-from-right-8">
        <div className="flex max-h-[72vh] flex-col rounded-[2rem] bg-surface/95 p-4 shadow-e4 ring-1 ring-inset ring-hairline-strong backdrop-blur xl:h-full xl:max-h-none xl:rounded-l-[2rem] xl:rounded-r-[1.25rem]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.05rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
              >
                <CheckCircle2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.16em] text-primary-700">
                  Coach action
                </p>
                <h2 className="mt-0.5 text-lg font-black leading-tight text-ink">
                  {meta.title}
                </h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">
                  {meta.detail}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onCollapse}
                className="fw-press flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted hover:bg-primary-100 hover:text-primary-800 active:bg-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                aria-label="Collapse coach action panel"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="fw-press flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted hover:bg-accent-100 hover:text-accent-700 active:bg-accent-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600"
                aria-label="Close coach action panel"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1 rounded-[1.45rem] bg-primary-50/55 p-3 ring-1 ring-inset ring-primary-100">
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
              className="fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-teal-600 px-4 py-2 text-sm font-black text-white shadow-glow hover:from-primary-400 hover:to-teal-500 active:from-primary-700 active:to-primary-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              {meta.routeLabel}
              <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={() => onAction({ kind: "send_message", text: meta.followup })}
              className="fw-press inline-flex min-h-11 items-center justify-center rounded-full bg-surface px-4 py-2 text-xs font-black text-primary-800 shadow-e1 ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
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

/** Header nav item. Hidden on small screens, where the surface is chat-only. */
function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="fw-press hidden min-h-11 items-center rounded-full px-3 text-sm font-black text-primary-700 hover:bg-primary-50 hover:text-primary-800 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 sm:inline-flex"
    >
      {children}
    </Link>
  );
}

function CoachAvatar() {
  return (
    <div
      aria-hidden="true"
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] bg-gradient-to-b from-primary-500 to-teal-600 text-white shadow-e1"
    >
      <Sparkles className="h-4 w-4" strokeWidth={2} />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      aria-hidden="true"
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.85rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
    >
      <User className="h-4 w-4" strokeWidth={2} />
    </div>
  );
}

/** Holds the avatar column open for follow-on rows in the same run. */
function AvatarGutter() {
  return <div aria-hidden="true" className="h-1 w-8 shrink-0" />;
}

function AttachmentTray({
  attachments,
  onRemove,
}: {
  attachments: CoachAttachment[];
  onRemove: (id: string) => void;
}) {
  return (
    // min-w on the chips is 11rem so two fit inside a 320px viewport before the
    // rail starts scrolling, and the row never forces the composer wider.
    <div className="fw-rich-scroll flex gap-2 rounded-[1.25rem] bg-primary-50/70 p-2 ring-1 ring-inset ring-primary-100">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex min-w-[11rem] max-w-[15rem] items-center gap-2.5 rounded-[1rem] bg-surface px-2.5 py-2 shadow-e1"
        >
          <AttachmentIcon attachment={attachment} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-ink">{attachment.name}</p>
            <p className="truncate text-[0.6875rem] font-bold uppercase tracking-[0.06em] tabular-nums text-ink-muted">
              {attachment.kind} · {formatAttachmentSize(attachment.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(attachment.id)}
            className="fw-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-accent-50 hover:text-accent-700 active:bg-accent-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-600"
            aria-label={`Remove ${attachment.name}`}
          >
            <X className="h-4 w-4" strokeWidth={2} />
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
    <div className={cn("mb-2 grid gap-1.5", sent ? "text-white" : "text-ink")}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={cn(
            "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset",
            sent
              ? "bg-white/14 text-white ring-white/20"
              : "bg-primary-50 text-primary-800 ring-primary-100"
          )}
        >
          {attachment.kind === "image" ? (
            <ImageIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          ) : (
            <FileText className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          )}
          <span className="truncate">{attachment.name}</span>
          <span className="shrink-0 tabular-nums opacity-70">
            {formatAttachmentSize(attachment.size)}
          </span>
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
        className="h-11 w-11 shrink-0 rounded-[0.85rem] bg-surface-muted object-cover ring-1 ring-inset ring-hairline"
      />
    );
  }

  const Icon = attachment.kind === "image" ? ImageIcon : FileText;
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.85rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
    >
      <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
    </span>
  );
}

function RichTextPreview() {
  const capabilities = [
    { label: "Tables", detail: "Meal comparisons and macro rows", icon: Table2, tone: "bg-primary-50 text-primary-700 ring-primary-100" },
    { label: "Nested lists", detail: "Steps, substeps, and checklists", icon: ListTree, tone: "bg-sky-50 text-sky-700 ring-sky-100" },
    { label: "Formulas", detail: "Math rendered inline with KaTeX", icon: Calculator, tone: "bg-lemon-50 text-lemon-700 ring-lemon-100" },
    { label: "Media", detail: "Images and links inside replies", icon: ImageIcon, tone: "bg-accent-50 text-accent-700 ring-accent-100" },
  ];

  return (
    <section className="max-w-full min-w-0 overflow-hidden rounded-[2rem] bg-surface/90 p-4 shadow-e2 ring-1 ring-inset ring-hairline sm:p-5">
      <div className="flex max-w-full min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-full min-w-0 xl:max-w-xl">
          <SectionHeader
            eyebrow="Rich response support"
            title="Coach answers can be structured, visual, and math-aware."
            description="The same chat bubble supports headers, nested lists, tables, formulas, links, and inline media when the coach replies."
          />
        </div>
        <div className="hidden max-w-full min-w-0 gap-2 sm:grid sm:grid-cols-2 xl:w-[30rem]">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="fw-soft-row flex max-w-full min-w-0 gap-3 p-3">
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] ring-1 ring-inset ${item.tone}`}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-ink">{item.label}</p>
                  <p className="text-xs font-semibold leading-5 text-ink-muted">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid max-w-full min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex max-w-full min-w-0 gap-2 sm:gap-3">
          <CoachAvatar />
          {/* The demo app icon renders as a compact media chip here, not at the
              full-width size real coach photos get. */}
          <div className="min-w-0 flex-1 [&_img]:h-16 [&_img]:w-16 [&_img]:rounded-[1.05rem] [&_img]:object-contain">
            <StreamingTextBubble text={richPreviewMarkdown} streaming={false} />
          </div>
        </div>
        <div className="hidden max-w-full min-w-0 rounded-[1.5rem] bg-primary-50/80 p-4 ring-1 ring-inset ring-primary-100 xl:block">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-surface text-primary-700 shadow-e1"
          >
            <Heading2 className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </div>
          <h3 className="mt-4 text-lg font-black text-ink">Inline artifacts stay in the conversation.</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
            The coach can answer in prose, then attach action cards for logging meals, opening pages, or saving preferences.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-xs font-black text-primary-800 shadow-e1">
            <Link2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            Chat-native actions
          </div>
        </div>
      </div>
    </section>
  );
}
