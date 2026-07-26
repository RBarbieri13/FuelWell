import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  CornerDownRight,
  Mail,
  Paperclip,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Table2,
} from "lucide-react";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getLaunchPreflight } from "@/lib/launch-preflight";
import { isPreviewHost } from "@/lib/preview-session";

const attachmentTypes = [
  {
    title: "Food photo",
    detail: "Burger, bowl, label, snack, or pantry item.",
    icon: Camera,
    output: "Estimated calories, macro range, and what to confirm.",
  },
  {
    title: "Menu screenshot",
    detail: "Restaurant PDF, photo, webpage capture, or pasted list.",
    icon: ReceiptText,
    output: "Ranked choices based on today’s room and preferences.",
  },
  {
    title: "Email or document",
    detail: "Meal plan, grocery receipt, training plan, PDF, or note.",
    icon: Mail,
    output: "Structured summary with suggested app actions.",
  },
  {
    title: "Table or CSV",
    detail: "Macro exports, ingredient lists, or workout logs.",
    icon: Table2,
    output: "Cleaned rows, totals, and next-step recommendations.",
  },
];

const reviewSteps = [
  "Attach up to five files in Coach.",
  "FuelWell reads image, PDF, email, text, CSV, JSON, Markdown, or HTML content.",
  "The coach explains uncertainty before logging or recommending anything.",
  "You choose whether to log, edit, save, or ignore the result.",
];

export default async function CoachAttachmentsReviewPage() {
  // The preflight page 404s outside preview hosts, so only link to it there.
  const showPreflightLink = isPreviewHost((await headers()).get("host"));
  const preflight = getLaunchPreflight();
  const aiCheck = preflight.checks.find((check) => check.id === "anthropic");
  const storageCheck = preflight.checks.find((check) => check.id === "file-storage");
  const aiPassing = aiCheck?.state === "pass";
  const AiIcon = aiPassing ? CheckCircle2 : AlertTriangle;

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
              <Paperclip className="h-4 w-4" strokeWidth={2} />
              Coach attachment review
            </p>
            <h1 className="fw-heading mt-2 text-2xl md:text-4xl">Upload anything useful</h1>
            <p className="fw-muted mt-1 max-w-3xl text-base">
              Photos, menus, emails, labels, and training files can become a clearer nutrition or fitness decision.
            </p>
          </div>
          <Link href="/app/coach" className="shrink-0">
            <Button size="lg" className="whitespace-nowrap rounded-full px-6">
              Open Coach
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <Card variant="elevated" padding="lg">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <SectionHeader
                icon={Sparkles}
                title="The coach can interpret the file, but you stay in control."
                description="File analysis is treated as decision support. FuelWell should describe what it sees, show confidence, ask for missing details, and only log a meal or workout after the user confirms the final numbers."
              />
            </div>
            <div className="rounded-[1.25rem] bg-primary-50/80 p-3 ring-1 ring-inset ring-primary-100">
              <p className="px-1 text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
                Supported now
              </p>
              <div className="mt-3 grid gap-2">
                {["Images", "PDFs", "Emails", "CSV / JSON / text"].map((item) => (
                  <div
                    key={item}
                    className="flex min-h-11 items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-sm font-black text-ink shadow-e1 ring-1 ring-inset ring-primary-100/70"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary-600" strokeWidth={2} />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 gap-3">
              <span
                aria-hidden="true"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] ring-1 ring-inset ${
                  aiPassing
                    ? "bg-primary-50 text-primary-700 ring-primary-100"
                    : "bg-lemon-50 text-lemon-700 ring-lemon-100"
                }`}
              >
                <AiIcon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-ink md:text-xl">
                    AI interpretation status
                  </h2>
                  <Badge dot size="sm" variant={aiPassing ? "success" : "warning"}>
                    {aiPassing ? "Ready" : "Check needed"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                  {aiCheck?.detail ??
                    "Status check hasn't run yet — open preflight to verify."}
                </p>
              </div>
            </div>
            {/* Sunken well, hairline ring, no second shadow — the card already
                owns this layer's elevation. */}
            <div className="flex min-w-0 gap-3 rounded-[1.1rem] bg-surface-muted px-4 py-3 ring-1 ring-inset ring-hairline">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-surface text-primary-700 ring-1 ring-inset ring-hairline"
              >
                <ShieldCheck className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-black text-ink">Artifact storage</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-ink-muted">
                  {storageCheck?.detail ??
                    "Status check hasn't run yet — open preflight to verify."}
                </p>
              </div>
            </div>
            {showPreflightLink && (
              <Link
                href="/app/launch-preflight"
                className="fw-press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 hover:ring-primary-200 active:bg-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
              >
                Open preflight
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
              </Link>
            )}
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {attachmentTypes.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} padding="md" className="flex flex-col">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100"
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                </span>
                <h2 className="mt-4 text-lg font-black leading-tight text-ink">{item.title}</h2>
                {/* flex-1 on the description lets the four outcome wells line
                    up across the row even when the copy wraps unevenly. */}
                <p className="mt-2 flex-1 text-sm font-semibold leading-6 text-ink-muted">
                  {item.detail}
                </p>
                {/* The outcome row is what you get back, so it is marked as a
                    result rather than sitting as a second paragraph of equal
                    weight. */}
                <p className="mt-4 flex gap-2 rounded-[1rem] bg-surface-muted px-3 py-3 text-sm font-bold leading-6 text-ink-muted ring-1 ring-inset ring-hairline">
                  <CornerDownRight
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 text-primary-600"
                    strokeWidth={2}
                  />
                  <span className="min-w-0">{item.output}</span>
                </p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card padding="lg">
            <SectionHeader as="h2" title="Review flow" />
            {/* Numbered steps read as an ordered list to assistive tech, and a
                connector runs between the plates so the four rows read as one
                sequence rather than four unrelated tiles. */}
            <ol className="mt-4 grid gap-2">
              {reviewSteps.map((step, index) => (
                <li
                  key={step}
                  className="relative flex items-start gap-3 rounded-[1.1rem] bg-primary-50/60 p-3 ring-1 ring-inset ring-primary-100"
                >
                  {index < reviewSteps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[1.75rem] top-11 -bottom-2 w-px bg-primary-200"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-black tabular-nums text-primary-700 shadow-e1 ring-1 ring-inset ring-primary-100"
                  >
                    {index + 1}
                  </span>
                  <p className="min-w-0 pt-1 text-sm font-bold leading-6 text-ink-muted">{step}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card padding="lg">
            <SectionHeader
              as="h2"
              title="Try it in chat"
              description="Open Coach, use the paperclip, and send a photo, menu, or file with one of these prompts."
            />
            <div className="mt-4 grid gap-2">
              {[
                "What is in this meal, and what should I confirm?",
                "Rank this menu for my remaining calories and protein.",
                "Turn this workout plan into a loggable routine.",
              ].map((prompt) => (
                <Link
                  key={prompt}
                  href={`/app/coach?prompt=${encodeURIComponent(prompt)}`}
                  // A row you can tap needs a visible boundary at rest, not
                  // only on hover — the ring starts as a hairline.
                  className="fw-press group flex min-h-12 items-center justify-between gap-3 rounded-[1.1rem] bg-surface-muted px-4 py-3 text-sm font-bold text-ink-muted ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-800 hover:ring-primary-200 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                >
                  <span className="min-w-0">{prompt}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-primary-500 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </Link>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
