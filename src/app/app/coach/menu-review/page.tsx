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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuSaveAction } from "@/components/coach/menu-save-action";

const CALORIE_BUDGET = 1400;
const PROTEIN_BUDGET = 102;

const menuOptions = [
  {
    rank: "Best fit",
    rankIcon: CheckCircle2,
    rankIconClass: "text-primary-600",
    badgeClass: "bg-primary-100 text-primary-700",
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
    badgeClass: "bg-sky-100 text-sky-700",
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
    badgeClass: "bg-lemon-100 text-lemon-700",
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
              <UtensilsCrossed className="h-4 w-4" />
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
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <Card variant="elevated" className="rounded-[1.5rem] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(20,90,75,0.07)] md:px-7 md:py-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
                <Sparkles className="h-4 w-4" />
                Decision rules
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#16302a] md:text-3xl">
                The coach should rank options, not just identify food.
              </h2>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#54635d]">
                Menu support works best when the answer explains how each option fits the user&apos;s calories,
                protein, preferences, restrictions, and the next few hours of the day.
              </p>
            </div>
            <div className="grid gap-3 rounded-[1.25rem] border border-primary-100 bg-primary-50/80 p-4">
              {[
                { label: "Calories left", value: "1,400 kcal", icon: Flame, iconClass: "text-primary-600" },
                { label: "Protein left", value: "102g", icon: Beef, iconClass: "text-sky-600" },
                { label: "Before saving", value: "Confirm sides", icon: HelpCircle, iconClass: "text-lemon-700" },
              ].map(({ label, value, icon: Icon, iconClass }) => (
                <div key={label} className="flex items-center justify-between rounded-[1rem] bg-white px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-black text-muted-foreground">
                    <Icon className={`h-4 w-4 ${iconClass}`} />
                    {label}
                  </span>
                  <span className="text-sm font-black text-[#16302a]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-3">
          {menuOptions.map((option) => (
            <Card key={option.name} className="rounded-[1.5rem] px-5 py-5 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black ${option.badgeClass}`}>
                  {option.rank}
                </span>
                <option.rankIcon className={`h-5 w-5 ${option.rankIconClass}`} />
              </div>
              <h2 className="mt-4 text-2xl font-black text-[#16302a]">{option.name}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#6e8981]">{option.detail}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Metric label="Calories" value={`${option.calories}`} tone="primary" amount={option.calories} max={CALORIE_BUDGET} />
                <Metric label="Protein" value={`${option.protein}g`} tone="sky" amount={option.protein} max={PROTEIN_BUDGET} />
              </div>
              <p className="mt-4 rounded-[1rem] bg-[#f4f8f6] px-3 py-3 text-sm font-black leading-6 text-muted-foreground">
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

        <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-[#16302a]">What the coach should return</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6e8981]">
                  Ranked choices, nutrition estimates, uncertainty, swaps, and a one-tap logging recommendation.
                </p>
              </div>
            </div>
            <Link href="/app/coach?prompt=Rank%20this%20menu%20for%20my%20remaining%20calories%20and%20protein." className="shrink-0">
              <Button variant="secondary" size="lg" className="whitespace-nowrap rounded-full px-6">
                Start menu chat
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  amount,
  max,
}: {
  label: string;
  value: string;
  tone: "primary" | "sky";
  amount: number;
  max: number;
}) {
  const toneClass = tone === "primary" ? "bg-primary-100 text-primary-700" : "bg-sky-100 text-sky-700";
  const fillPercent = Math.min(100, Math.round((amount / max) * 100));

  return (
    <div className={`rounded-[1rem] px-3 py-3 text-center ${toneClass}`}>
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <div className="mt-2 h-1 rounded-full bg-white/60">
        <div className="h-1 rounded-full bg-current" style={{ width: `${fillPercent}%` }} />
      </div>
    </div>
  );
}
