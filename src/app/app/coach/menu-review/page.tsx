import Link from "next/link";
import {
  ArrowRight,
  Beef,
  CheckCircle2,
  ClipboardList,
  Flame,
  HelpCircle,
  Info,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import { MenuSaveAction } from "@/components/coach/menu-save-action";
import { cn } from "@/lib/utils/cn";

// Illustrative figures for the decision shape on this page — this route is a
// static explainer and is not wired to the signed-in user's day log. Every
// surface that renders them says "example" so they are never mistaken for a
// live remaining allowance.
const EXAMPLE_CALORIE_BUDGET = 1400;
const EXAMPLE_PROTEIN_BUDGET = 102;

const menuOptions = [
  {
    rank: "Best fit",
    rankIcon: CheckCircle2,
    rankIconClass: "text-primary-600",
    confidenceDotClass: "bg-primary-600",
    badgeVariant: "success" as const,
    name: "Grilled chicken bowl",
    detail: "High protein, steady carbs, easy to customize.",
    calories: 610,
    protein: 48,
    carbs: 58,
    fat: 18,
    confidence: "High confidence estimate",
    sourceNote: "Menu-style estimate; confirm sauces and portion size.",
    reason: "Fits the 700 kcal dinner room and closes the protein gap fastest.",
  },
  {
    rank: "Good backup",
    rankIcon: Info,
    rankIconClass: "text-sky-600",
    confidenceDotClass: "bg-sky-600",
    badgeVariant: "info" as const,
    name: "Salmon salad with rice",
    detail: "Better fats, moderate carbs, lighter finish.",
    calories: 540,
    protein: 39,
    carbs: 42,
    fat: 22,
    confidence: "Medium confidence estimate",
    sourceNote: "Rice amount and dressing can move calories quickly.",
    reason: "Useful when appetite is lower but protein still matters.",
  },
  {
    rank: "Ask first",
    rankIcon: HelpCircle,
    rankIconClass: "text-lemon-700",
    confidenceDotClass: "bg-lemon-600",
    badgeVariant: "warning" as const,
    name: "Burger with fries",
    detail: "Likely higher fat and sodium; portion details matter.",
    calories: 920,
    protein: 36,
    carbs: 82,
    fat: 46,
    confidence: "Low confidence estimate",
    sourceNote: "Toppings, fries size, and sauce need confirmation before saving.",
    reason: "Could fit if lunch was light, but the coach should confirm toppings and sides.",
  },
];

export default function MenuChoiceReviewPage() {
  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
              <UtensilsCrossed className="h-4 w-4" strokeWidth={2} />
              Menu choice review
            </p>
            <h1 className="fw-heading mt-2 text-2xl md:text-4xl">Pick the meal that fits today</h1>
            <p className="fw-muted mt-1 max-w-3xl text-base">
              Upload a menu or screenshot in Coach, then use this decision shape to rank choices before logging.
            </p>
          </div>
          <Link
            href="/app/coach"
            className="fw-press inline-flex min-h-11 shrink-0 select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-gradient-to-b from-primary-500 to-teal-600 px-6 py-3 text-base font-bold text-white shadow-glow hover:from-primary-400 hover:to-teal-500 hover:shadow-e3 active:from-primary-700 active:to-primary-800 active:shadow-e1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            Analyze a menu
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </header>

      <main className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <Card variant="elevated" padding="lg">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="min-w-0">
              <SectionHeader
                eyebrow="Decision rules"
                icon={Sparkles}
                title="The coach should rank options, not just identify food."
                description="Menu support works best when the answer explains how each option fits the user's calories, protein, preferences, restrictions, and the next few hours of the day."
              />
            </div>
            <div className="grid gap-2 rounded-[1.25rem] bg-primary-50/80 p-3 ring-1 ring-inset ring-primary-100">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-0.5">
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
                  Sample day used below
                </p>
                <Badge variant="neutral" size="sm">
                  Example
                </Badge>
              </div>
              {[
                { label: "Calories left", value: "1,400 kcal", icon: Flame, iconClass: "text-primary-600" },
                { label: "Protein left", value: "102g", icon: Beef, iconClass: "text-sky-600" },
                { label: "Before saving", value: "Confirm sides", icon: HelpCircle, iconClass: "text-lemon-700" },
              ].map(({ label, value, icon: Icon, iconClass }) => (
                <div
                  key={label}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-[1rem] bg-surface px-4 py-2.5 ring-1 ring-inset ring-primary-100/70"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink-muted">
                    <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} strokeWidth={2} />
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="shrink-0 text-sm font-black tabular-nums text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-3">
          {menuOptions.map((option, index) => {
            // The list is already ranked, so the leading option carries one
            // step more elevation and a primary ring instead of three cards
            // competing at identical weight.
            const isTopPick = index === 0;
            return (
              <Card
                key={option.name}
                padding="md"
                variant={isTopPick ? "elevated" : "default"}
                className={cn("flex flex-col", isTopPick && "ring-1 ring-inset ring-primary-200")}
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge dot variant={option.badgeVariant}>
                    {option.rank}
                  </Badge>
                  <option.rankIcon
                    className={`h-5 w-5 shrink-0 ${option.rankIconClass}`}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-4 text-xl font-black leading-tight text-ink md:text-2xl">{option.name}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">{option.detail}</p>
                <div className="mt-5 grid gap-2.5 rounded-[1.15rem] bg-surface-subtle p-3 ring-1 ring-inset ring-hairline">
                  <Metric
                    label="Calories"
                    unit="kcal"
                    amount={option.calories}
                    max={EXAMPLE_CALORIE_BUDGET}
                    color="var(--color-macro-calories)"
                  />
                  <Metric
                    label="Protein"
                    unit="g"
                    amount={option.protein}
                    max={EXAMPLE_PROTEIN_BUDGET}
                    color="var(--color-macro-protein)"
                  />
                  {/* Carbs and fat have no budget on this screen to measure
                      against, so they are stated as figures rather than faked
                      into bars — swatched with the same macro roles used in
                      every other FuelWell chart. */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-2.5">
                    <MacroFact label="Carbs" amount={option.carbs} swatch="var(--color-macro-carbs)" />
                    <MacroFact label="Fat" amount={option.fat} swatch="var(--color-macro-fat)" />
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-[0.1em] text-ink-muted">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${option.confidenceDotClass}`}
                  />
                  <span className="min-w-0">{option.confidence}</span>
                </p>
                {/* Spacer so the reason well and the save action line up across
                    the three cards even when the copy above wraps unevenly. */}
                <div aria-hidden="true" className="flex-1" />
                <p className="mt-4 rounded-[1rem] bg-surface-muted px-3 py-3 text-sm font-bold leading-6 text-ink-muted ring-1 ring-inset ring-hairline">
                  {option.reason}
                </p>
                <MenuSaveAction
                  option={{
                    name: option.name,
                    calories: option.calories,
                    protein: option.protein,
                    carbs: option.carbs,
                    fat: option.fat,
                    confidence: option.confidence,
                    sourceNote: option.sourceNote,
                  }}
                />
              </Card>
            );
          })}
        </section>

        <Card padding="lg">
          <SectionHeader
            icon={ClipboardList}
            title="What the coach should return"
            description="Ranked choices, nutrition estimates, uncertainty, swaps, and a one-tap logging recommendation."
            action={
              <Link
                href="/app/coach?prompt=Rank%20this%20menu%20for%20my%20remaining%20calories%20and%20protein."
                className="fw-press inline-flex min-h-11 select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-primary-100 bg-surface/92 px-6 py-3 text-base font-bold text-primary-800 shadow-e1 hover:border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                Start menu chat
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            }
          />
        </Card>
      </main>
    </div>
  );
}

/**
 * One labelled meter per macro. The bar carries a scale — the value on the left,
 * the budget it is measured against on the right — so it reads as a measurement
 * rather than as decoration, and an option that exceeds the example room shows
 * as over (coral + hatched) instead of silently pinning at full width.
 *
 * `max` is the page's illustrative budget, not the signed-in user's remaining
 * allowance, so every label — visible and accessible — says "example budget".
 */
function Metric({
  label,
  unit,
  amount,
  max,
  color,
}: {
  label: string;
  unit: string;
  amount: number;
  max: number;
  color: string;
}) {
  const share = Math.round((amount / max) * 100);
  const isOver = amount > max;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-muted">
          {/* The swatch ties the label to the fill colour of its own bar, so
              two stacked meters are never read against the wrong scale. */}
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-sm font-black tabular-nums text-ink">
          {amount.toLocaleString()}
          <span className="ml-0.5 text-xs font-bold text-ink-muted">{unit}</span>
        </span>
      </div>
      <ProgressMeter
        className="mt-1.5 bg-surface-sunken"
        size="sm"
        value={amount}
        target={max}
        color={color}
        label={`${label}: ${amount.toLocaleString()}${unit} against a ${max.toLocaleString()}${unit} example budget (${share}%)`}
      />
      <p
        className={cn(
          "mt-1 text-[0.6875rem] font-bold tabular-nums",
          // Over-budget is a different reading, not a bigger one — it gets the
          // coral role the meter itself switches to.
          isOver ? "text-accent-700" : "text-ink-muted"
        )}
      >
        {isOver ? "over" : `${share}%`} of a {max.toLocaleString()}
        {unit} example budget
      </p>
    </div>
  );
}

/**
 * A macro with no budget on this screen. Stated as a plain figure with its
 * chart swatch — inventing a target just to draw a bar would be a lie.
 */
function MacroFact({
  label,
  amount,
  swatch,
}: {
  label: string;
  amount: number;
  swatch: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: swatch }}
      />
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </span>
      <span className="text-xs font-black tabular-nums text-ink">{amount}g</span>
    </span>
  );
}
