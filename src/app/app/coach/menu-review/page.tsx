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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressMeter } from "@/components/ui/progress-meter";
import { SectionHeader } from "@/components/ui/section-header";
import { MenuSaveAction } from "@/components/coach/menu-save-action";

const CALORIE_BUDGET = 1400;
const PROTEIN_BUDGET = 102;

const menuOptions = [
  {
    rank: "Best fit",
    rankIcon: CheckCircle2,
    rankIconClass: "text-primary-600",
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
          <Link href="/app/coach" className="shrink-0">
            <Button size="lg" className="whitespace-nowrap rounded-full px-6">
              Analyze a menu
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <Card variant="elevated" padding="lg" className="rounded-[1.5rem]">
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
              {[
                { label: "Calories left", value: "1,400 kcal", icon: Flame, iconClass: "text-primary-600" },
                { label: "Protein left", value: "102g", icon: Beef, iconClass: "text-sky-600" },
                { label: "Before saving", value: "Confirm sides", icon: HelpCircle, iconClass: "text-lemon-700" },
              ].map(({ label, value, icon: Icon, iconClass }) => (
                <div
                  key={label}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-[1rem] bg-surface px-4 py-2.5 shadow-e1"
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
          {menuOptions.map((option) => (
            <Card key={option.name} padding="md" className="flex flex-col rounded-[1.5rem]">
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
                  max={CALORIE_BUDGET}
                  color="var(--color-macro-calories)"
                />
                <Metric
                  label="Protein"
                  unit="g"
                  amount={option.protein}
                  max={PROTEIN_BUDGET}
                  color="var(--color-macro-protein)"
                />
              </div>
              <p className="mt-4 rounded-[1rem] bg-surface-muted px-3 py-3 text-sm font-bold leading-6 text-ink-muted">
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
          ))}
        </section>

        <Card padding="lg" className="rounded-[1.5rem]">
          <SectionHeader
            icon={ClipboardList}
            title="What the coach should return"
            description="Ranked choices, nutrition estimates, uncertainty, swaps, and a one-tap logging recommendation."
            action={
              <Link href="/app/coach?prompt=Rank%20this%20menu%20for%20my%20remaining%20calories%20and%20protein.">
                <Button variant="secondary" size="lg" className="whitespace-nowrap rounded-full px-6">
                  Start menu chat
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Button>
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
 * rather than as decoration, and an option that exceeds the day's room shows as
 * over (coral + hatched) instead of silently pinning at full width.
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
        <span className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
          {label}
        </span>
        <span className="text-sm font-black tabular-nums text-ink">
          {amount.toLocaleString()}
          <span className="ml-0.5 text-xs font-bold text-ink-subtle">{unit}</span>
        </span>
      </div>
      <ProgressMeter
        className="mt-1.5 bg-surface-sunken"
        size="sm"
        value={amount}
        target={max}
        color={color}
        label={`${label}: ${amount.toLocaleString()}${unit} of ${max.toLocaleString()}${unit} left today (${share}%)`}
      />
      <p className="mt-1 text-[0.6875rem] font-bold tabular-nums text-ink-subtle">
        {isOver ? "over" : `${share}%`} of {max.toLocaleString()}
        {unit} left today
      </p>
    </div>
  );
}
