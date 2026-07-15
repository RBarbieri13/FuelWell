import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Mail,
  Paperclip,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLaunchPreflight } from "@/lib/launch-preflight";

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

export default function CoachAttachmentsReviewPage() {
  const preflight = getLaunchPreflight();
  const aiCheck = preflight.checks.find((check) => check.id === "anthropic");
  const storageCheck = preflight.checks.find((check) => check.id === "file-storage");
  const AiIcon = aiCheck?.state === "pass" ? CheckCircle2 : AlertTriangle;

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
              <Paperclip className="h-4 w-4" />
              Coach attachment review
            </p>
            <h1 className="fw-heading mt-2 text-3xl md:text-4xl">Upload anything useful</h1>
            <p className="fw-muted mt-1 max-w-3xl text-base">
              Photos, menus, emails, labels, and training files can become a clearer nutrition or fitness decision.
            </p>
          </div>
          <Link href="/app/coach">
            <Button size="lg" className="rounded-full px-6">
              Open Coach
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="fw-page-inner space-y-6 pb-28 md:pb-8">
        <Card variant="elevated" className="rounded-[1.5rem] bg-white px-7 py-7 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div>
              <div className="flex h-13 w-13 items-center justify-center rounded-[1.1rem] bg-primary-100 text-primary-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-3xl font-black text-[#16302a]">
                The coach can interpret the file, but you stay in control.
              </h2>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#54635d]">
                File analysis is treated as decision support. FuelWell should describe what it sees, show confidence,
                ask for missing details, and only log a meal or workout after the user confirms the final numbers.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-primary-100 bg-primary-50/80 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-700">Supported now</p>
              <div className="mt-4 grid gap-2">
                {["Images", "PDFs", "Emails", "CSV / JSON / text"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-[#16302a]">
                    <ShieldCheck className="h-4 w-4 text-primary-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-primary-100 bg-white px-6 py-5 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                <AiIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-[#16302a]">
                  AI interpretation status
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">
                  {aiCheck?.detail ??
                    "FuelWell could not read the current AI readiness status."}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-[1.1rem] bg-[#f4f8f6] px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-white text-primary-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-[#16302a]">Artifact storage</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">
                  {storageCheck?.detail ??
                    "FuelWell could not read the current artifact storage status."}
                </p>
              </div>
            </div>
            <Link
              href="/app/launch-preflight"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 transition hover:bg-primary-100"
            >
              Open preflight
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {attachmentTypes.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="rounded-[1.4rem] px-5 py-5 shadow-[0_10px_26px_rgba(20,90,75,0.05)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-xl font-black text-[#16302a]">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#6e8981]">{item.detail}</p>
                <p className="mt-4 rounded-[1rem] bg-[#f4f8f6] px-3 py-3 text-sm font-black leading-6 text-muted-foreground">
                  {item.output}
                </p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <h2 className="text-2xl font-black text-[#16302a]">Review flow</h2>
            <div className="mt-4 grid gap-3">
              {reviewSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-[1.1rem] border border-primary-100 bg-primary-50/60 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-primary-700">
                    {index + 1}
                  </span>
                  <p className="text-sm font-black leading-6 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <h2 className="text-2xl font-black text-[#16302a]">Try it in chat</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6e8981]">
              Open Coach, use the paperclip, and send a photo, menu, or file with one of these prompts.
            </p>
            <div className="mt-4 grid gap-2">
              {[
                "What is in this meal, and what should I confirm?",
                "Rank this menu for my remaining calories and protein.",
                "Turn this workout plan into a loggable routine.",
              ].map((prompt) => (
                <Link
                  key={prompt}
                  href={`/app/coach?prompt=${encodeURIComponent(prompt)}`}
                  className="flex items-center justify-between gap-3 rounded-[1.1rem] bg-[#f4f8f6] px-4 py-3 text-sm font-black text-muted-foreground transition hover:bg-primary-50 hover:text-primary-700"
                >
                  {prompt}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
