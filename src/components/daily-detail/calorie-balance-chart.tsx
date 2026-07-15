"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  ChevronDown,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Flame,
  Layers3,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { sumMeals, type MacroTargets, type MealRecord } from "@/lib/fuelwell-data";

type SegmentTone = "protein" | "carbs" | "fat" | "bmr" | "steps" | "training" | "mobility";
type BarKind = "intake" | "output";
type RangeOption = 1 | 3 | 7 | 14 | 30;

type Segment = {
  label: string;
  calories: number;
  tone: SegmentTone;
  detail: string;
};

export type ActivityOutputSignal = {
  label: string;
  calories: number;
  tone: Extract<SegmentTone, "steps" | "training" | "mobility">;
  detail: string;
};

type BalanceDay = {
  id: string;
  label: string;
  dateLabel: string;
  intake: Segment[];
  output: Segment[];
  note: string;
};

type SelectedBar = {
  day: BalanceDay;
  kind: BarKind;
};

const TONE_CLASSES: Record<SegmentTone, string> = {
  protein: "bg-sky-500",
  carbs: "bg-lemon-500",
  fat: "bg-accent-400",
  bmr: "bg-primary-700",
  steps: "bg-primary-400",
  training: "bg-[#159aa2]",
  mobility: "bg-[#7dd3c7]",
};

const TONE_DOTS: Record<SegmentTone, string> = {
  protein: "bg-sky-500",
  carbs: "bg-lemon-500",
  fat: "bg-accent-400",
  bmr: "bg-primary-700",
  steps: "bg-primary-400",
  training: "bg-[#159aa2]",
  mobility: "bg-[#7dd3c7]",
};

const RANGE_OPTIONS: { label: string; value: RangeOption }[] = [
  { label: "Today", value: 1 },
  { label: "3 days", value: 3 },
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

function totalCalories(segments: Segment[]) {
  return segments.reduce((total, segment) => total + segment.calories, 0);
}

function macroSegmentsForTotals({
  protein,
  carbs,
  fat,
}: {
  protein: number;
  carbs: number;
  fat: number;
}): Segment[] {
  return [
    {
      label: "Protein",
      calories: Math.round(protein * 4),
      tone: "protein",
      detail: `${protein}g protein`,
    },
    {
      label: "Carbs",
      calories: Math.round(carbs * 4),
      tone: "carbs",
      detail: `${carbs}g carbs`,
    },
    {
      label: "Fat",
      calories: Math.round(fat * 9),
      tone: "fat",
      detail: `${fat}g fat`,
    },
  ];
}

function buildSampleHistory(today: BalanceDay): BalanceDay[] {
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const generated = Array.from({ length: 29 }, (_, index) => {
    const dayNumber = index + 1;
    const protein = 112 + ((index * 7) % 42);
    const carbs = 158 + ((index * 19) % 92);
    const fat = 42 + ((index * 5) % 31);
    const training = index % 3 === 0 ? 360 : index % 4 === 0 ? 260 : 0;
    const mobility = index % 5 === 0 ? 65 : 30;
    const steps = 225 + ((index * 23) % 155);

    return {
      id: `history-${dayNumber}`,
      label: weekday[index % weekday.length],
      dateLabel: `Day ${dayNumber}`,
      intake: macroSegmentsForTotals({ protein, carbs, fat }),
      output: [
        {
          label: "Base burn",
          calories: 1710,
          tone: "bmr" as const,
          detail: "Resting metabolic estimate",
        },
        {
          label: "Steps",
          calories: steps,
          tone: "steps" as const,
          detail: `${Math.round(steps * 28)} estimated steps`,
        },
        {
          label: "Training",
          calories: training,
          tone: "training" as const,
          detail: training ? "Structured workout" : "No workout logged",
        },
        {
          label: "Mobility",
          calories: mobility,
          tone: "mobility" as const,
          detail: "Mobility and light movement",
        },
      ].filter((segment) => segment.calories > 0),
      note:
        training > 0
          ? "Training day with higher output."
          : "Lower-output day; nutrition flexibility matters more.",
    };
  });

  return [...generated, today];
}

function buildToday(
  meals: MealRecord[],
  targets: MacroTargets,
  activityOutputSignals: ActivityOutputSignal[] = []
): BalanceDay {
  const totals = sumMeals(meals);
  const hasMeals = meals.length > 0;
  const protein = hasMeals ? totals.protein : Math.round(targets.protein * 0.78);
  const carbs = hasMeals ? totals.carbs : Math.round(targets.carbs * 0.72);
  const fat = hasMeals ? totals.fat : Math.round(targets.fat * 0.68);

  return {
    id: "today",
    label: "Today",
    dateLabel: "Current day",
    intake: macroSegmentsForTotals({ protein, carbs, fat }),
    output: [
      {
        label: "Base burn",
        calories: 1710,
        tone: "bmr" as const,
        detail: "Resting metabolic estimate",
      },
      ...(activityOutputSignals.length > 0
        ? activityOutputSignals
        : [
            {
              label: "Morning walk",
              calories: 118,
              tone: "steps" as const,
              detail: "24 min easy neighborhood loop",
            },
            {
              label: "Zone 2 ride",
              calories: 310,
              tone: "training" as const,
              detail: "42 min conversational aerobic base",
            },
            {
              label: "Mobility reset",
              calories: 55,
              tone: "mobility" as const,
              detail: "18 min hips and upper back",
            },
          ]),
    ],
    note: hasMeals
      ? `${meals.length} meal${meals.length === 1 ? "" : "s"} logged and 3 activity signals counted.`
      : "Uses starting-plan estimates until meals are logged.",
  };
}

export function CalorieBalanceChart({
  meals,
  targets,
  activityOutputSignals = [],
}: {
  meals: MealRecord[];
  targets: MacroTargets;
  activityOutputSignals?: ActivityOutputSignal[];
}) {
  const [range, setRange] = useState<RangeOption>(7);
  const [offset, setOffset] = useState(0);
  const [showBmr, setShowBmr] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const [selectedBar, setSelectedBar] = useState<SelectedBar | null>(null);
  const [intakeExpanded, setIntakeExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(true);

  const days = useMemo(
    () => buildSampleHistory(buildToday(meals, targets, activityOutputSignals)),
    [activityOutputSignals, meals, targets]
  );
  const hasRealData = meals.length > 0 || activityOutputSignals.length > 0;
  const maxOffset = Math.max(0, days.length - range);
  const clampedOffset = Math.min(offset, maxOffset);
  const start = Math.max(0, days.length - range - clampedOffset);
  const visibleDays = days.slice(start, start + range);
  const filteredDays = visibleDays.map((day) => ({
    ...day,
    output: day.output.filter((segment) => {
      if (!showBmr && segment.tone === "bmr") return false;
      if (!showSessions && segment.tone !== "bmr") return false;
      return true;
    }),
  }));
  const maxTotal = Math.max(
    1,
    ...filteredDays.flatMap((day) => [
      ...(intakeExpanded ? [totalCalories(day.intake)] : []),
      ...(outputExpanded ? [totalCalories(day.output)] : []),
    ])
  );
  const hasExpandedSeries = intakeExpanded || outputExpanded;
  const windowLabel =
    range === 1 && clampedOffset === 0
      ? "Today only"
      : clampedOffset === 0
      ? `Latest ${range}`
      : `${range} days · ${clampedOffset} window${clampedOffset === 1 ? "" : "s"} back`;

  // Controls make no sense with nothing charted: without a single logged
  // meal or activity signal the card explains itself and points at Log.
  if (!hasRealData) {
    return (
      <Card className="rounded-[1.6rem] border-primary-100/90 px-5 py-5 shadow-[0_14px_34px_rgba(20,90,75,0.07)] md:px-6 md:py-6">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
          <BarChart3 className="h-4 w-4" />
          Energy ledger
        </p>
        <h2 className="mt-1.5 font-heading text-xl font-black text-[#16302a] md:text-3xl">
          Intake and output by day
        </h2>
        <div className="mt-4 rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60 p-5">
          <p className="font-black text-[#16302a]">No energy data yet today.</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#6f8981]">
            Log a meal or a workout and this becomes a day-by-day comparison of
            calories eaten against calories burned.
          </p>
          <Link href="/app/log" className="mt-4 inline-block">
            <Button size="sm" className="rounded-full">
              Log your first meal
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-[1.6rem] border-primary-100/90 px-5 py-5 shadow-[0_14px_34px_rgba(20,90,75,0.07)] md:px-6 md:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
              <BarChart3 className="h-4 w-4" />
              Energy ledger
            </p>
            <h2 className="mt-1.5 font-heading text-xl font-black text-[#16302a] md:text-3xl">
              Intake and output by day
            </h2>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#6f8981] md:text-base">
              Compare calories eaten against calories burned. Each day has an intake bar
              for protein, carbs, and fat, plus an output bar for base burn and movement.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setRange(option.value);
                    setOffset(0);
                  }}
                  className={cn(
                    "min-h-11 rounded-full px-3.5 py-2 text-xs font-black transition md:min-h-0",
                    range === option.value
                      ? "bg-primary-600 text-white shadow-[0_12px_24px_rgba(21,145,108,0.2)]"
                      : "bg-[#f4f8f6] text-[#6f8981] hover:bg-primary-50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-4 grid gap-2"
          aria-label="Energy ledger visibility"
          data-testid="energy-ledger-controls"
        >
          <LedgerSeriesToggle
            label="Intake"
            detail="Protein, carbs, and fat"
            expanded={intakeExpanded}
            onClick={() => setIntakeExpanded((value) => !value)}
            tone="intake"
            controlsId={hasExpandedSeries ? "energy-ledger-content" : undefined}
          />
          <LedgerSeriesToggle
            label="Output"
            detail="Base burn and activity"
            expanded={outputExpanded}
            onClick={() => setOutputExpanded((value) => !value)}
            tone="output"
            controlsId={hasExpandedSeries ? "energy-ledger-content" : undefined}
          />
        </div>

        {hasExpandedSeries && (
          <div id="energy-ledger-content" data-testid="energy-ledger-content">
            <div className="mt-4 flex flex-col gap-3 rounded-[1.2rem] border border-primary-100 bg-primary-50/45 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-700">
                  <CalendarRange className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-primary-950">{windowLabel}</p>
                  <p className="text-xs font-semibold text-primary-900/60">
                    Hover any bar for an instant breakdown. Click to pin the detail open.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOffset((value) => Math.min(value + 1, maxOffset))}
                  disabled={clampedOffset >= maxOffset}
                  className="min-w-0 flex-1 rounded-full md:flex-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOffset((value) => Math.max(value - 1, 0))}
                  disabled={clampedOffset === 0}
                  className="min-w-0 flex-1 rounded-full md:flex-none"
                >
                  Forward
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {outputExpanded && (
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterButton active={showBmr} onClick={() => setShowBmr((value) => !value)}>
                  Base burn
                </FilterButton>
                <FilterButton active={showSessions} onClick={() => setShowSessions((value) => !value)}>
                  Sessions
                </FilterButton>
              </div>
            )}

            <div className="mt-4 overflow-x-auto pb-2">
              {range >= 7 && (
                <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[#91a7a0] md:hidden">
                  Swipe sideways to compare days
                </p>
              )}
              {/* Column minimums alone size the grid: narrow ranges fit the
                  viewport (no phantom scroll area), wide ranges scroll. */}
              <div
                className="grid items-end gap-2"
                style={{ gridTemplateColumns: `repeat(${filteredDays.length}, minmax(84px, 1fr))` }}
              >
                {filteredDays.map((day) => (
                  <DayColumn
                    key={day.id}
                    day={day}
                    maxTotal={maxTotal}
                    onSelect={setSelectedBar}
                    showIntake={intakeExpanded}
                    showOutput={outputExpanded}
                  />
                ))}
              </div>
            </div>

            {range === 30 && (
              <AggregateThirtyDayCharts
                days={filteredDays}
                showIntake={intakeExpanded}
                showOutput={outputExpanded}
              />
            )}

            <div className="mt-4 flex flex-wrap gap-3 border-t border-primary-100 pt-4 text-xs font-bold text-[#78928a]">
              {intakeExpanded && <LegendItem tone="protein" label="Protein" />}
              {intakeExpanded && <LegendItem tone="carbs" label="Carbs" />}
              {intakeExpanded && <LegendItem tone="fat" label="Fat" />}
              {outputExpanded && <LegendItem tone="bmr" label="Base burn" />}
              {outputExpanded && <LegendItem tone="steps" label="Steps" />}
              {outputExpanded && <LegendItem tone="training" label="Workout" />}
              {outputExpanded && <LegendItem tone="mobility" label="Mobility" />}
            </div>

            <div className={cn("mt-4 grid gap-3", intakeExpanded && outputExpanded ? "md:grid-cols-3" : "md:grid-cols-1")}>
              {intakeExpanded && (
                <TrendCard
                  icon={Flame}
                  label="Avg intake"
                  value={`${Math.round(average(filteredDays.map((day) => totalCalories(day.intake)))).toLocaleString()} kcal`}
                  detail="Macro calories over visible window"
                />
              )}
              {outputExpanded && (
                <TrendCard
                  icon={Activity}
                  label="Avg output"
                  value={`${Math.round(average(filteredDays.map((day) => totalCalories(day.output)))).toLocaleString()} kcal`}
                  detail="Base burn plus visible movement filters"
                />
              )}
              {intakeExpanded && outputExpanded && (
                <TrendCard
                  icon={Layers3}
                  label="Avg balance"
                  value={`${Math.round(
                    average(filteredDays.map((day) => totalCalories(day.intake) - totalCalories(day.output)))
                  ).toLocaleString()} kcal`}
                  detail="Negative means output exceeded intake"
                />
              )}
            </div>
          </div>
        )}
      </Card>

      {selectedBar && (
        <BarDetailModal selected={selectedBar} onClose={() => setSelectedBar(null)} />
      )}
    </>
  );
}

function LedgerSeriesToggle({
  label,
  detail,
  expanded,
  onClick,
  tone,
  controlsId,
}: {
  label: string;
  detail: string;
  expanded: boolean;
  onClick: () => void;
  tone: BarKind;
  controlsId?: string;
}) {
  const isIntake = tone === "intake";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full min-w-0 items-center justify-between gap-2 rounded-[1rem] border px-3 py-2 text-left shadow-sm transition",
        expanded
          ? isIntake
            ? "border-primary-600 bg-primary-600 text-white hover:bg-primary-700"
            : "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
          : isIntake
            ? "border-primary-200 bg-primary-50 text-primary-800 hover:bg-primary-100"
            : "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-200"
      )}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label.toLowerCase()} series`}
      data-testid={`energy-ledger-${tone}-toggle`}
    >
      <span className="min-w-0">
        <span className="block text-xs font-black sm:text-sm">
          {expanded ? `Collapse ${label.toLowerCase()}` : `Expand ${label.toLowerCase()}`}
        </span>
        <span className={cn("hidden text-xs font-semibold sm:block", expanded ? "text-white/80" : "opacity-70")}>
          {detail}
        </span>
      </span>
      {expanded ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
    </button>
  );
}

function DayColumn({
  day,
  maxTotal,
  onSelect,
  showIntake,
  showOutput,
}: {
  day: BalanceDay;
  maxTotal: number;
  onSelect: (selected: SelectedBar) => void;
  showIntake: boolean;
  showOutput: boolean;
}) {
  const intakeTotal = totalCalories(day.intake);
  const outputTotal = totalCalories(day.output);
  const net = intakeTotal - outputTotal;

  return (
    <div className="flex min-h-[16rem] flex-col justify-end gap-2 rounded-[1.1rem] border border-transparent p-2 transition hover:border-primary-100 hover:bg-white">
      <div className="flex flex-1 items-end justify-center gap-2">
        {showIntake && (
          <StackedBar
            label="Intake"
            total={intakeTotal}
            segments={day.intake}
            maxTotal={maxTotal}
            onClick={() => onSelect({ day, kind: "intake" })}
          />
        )}
        {showOutput && (
          <StackedBar
            label="Output"
            total={outputTotal}
            segments={day.output}
            maxTotal={maxTotal}
            onClick={() => onSelect({ day, kind: "output" })}
          />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-[#16302a]">{day.label}</p>
        <p className={cn("text-xs font-black", net <= 0 ? "text-primary-700" : "text-accent-600")}>
          {net <= 0 ? "" : "+"}
          {net.toLocaleString()} net
        </p>
      </div>
    </div>
  );
}

function StackedBar({
  label,
  total,
  segments,
  maxTotal,
  onClick,
}: {
  label: string;
  total: number;
  segments: Segment[];
  maxTotal: number;
  onClick: () => void;
}) {
  const height = Math.max(54, Math.round((total / maxTotal) * 168));

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-9 flex-col items-center gap-2 focus:outline-none"
      aria-label={`Open ${label.toLowerCase()} detail with ${total} calories`}
    >
      <span className="text-[10px] font-black tabular-nums text-[#54635d] opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
        {total}
      </span>
      <span className="absolute bottom-[calc(100%+0.65rem)] left-1/2 z-30 hidden w-72 -translate-x-1/2 rounded-[1.25rem] border border-primary-100 bg-white p-4 text-left shadow-[0_22px_58px_rgba(7,29,24,0.18)] group-hover:block group-focus:block">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-primary-600">
          {label} breakdown
        </span>
        <span className="mt-2 block text-2xl font-black tabular-nums text-[#16302a]">
          {total.toLocaleString()} kcal
        </span>
        <span className="mt-3 grid gap-2">
          {segments.map((segment) => (
            <span key={`${label}-hover-${segment.label}`} className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-base font-black text-[#54635d]">
                <span className={cn("h-3 w-3 rounded-full", TONE_DOTS[segment.tone])} />
                {segment.label}
              </span>
              <span className="text-base font-black tabular-nums text-[#16302a]">
                {segment.calories.toLocaleString()}
              </span>
            </span>
          ))}
        </span>
      </span>
      <span
        className="flex w-8 flex-col justify-end overflow-hidden rounded-full bg-[#edf3f0] shadow-inner ring-1 ring-primary-900/5 transition group-hover:scale-[1.03] group-focus:ring-2 group-focus:ring-primary-400"
        style={{ height }}
      >
        {segments.map((segment) => (
          <span
            key={`${label}-${segment.label}`}
            className={cn("w-full", TONE_CLASSES[segment.tone])}
            style={{
              height: `${Math.max(8, (segment.calories / Math.max(total, 1)) * 100)}%`,
            }}
            title={`${segment.label}: ${segment.calories} calories`}
          />
        ))}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#9db0aa]">
        {label}
      </span>
      <span className="rounded-full bg-primary-50 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-primary-700 opacity-80">
        Hover
      </span>
    </button>
  );
}

function AggregateThirtyDayCharts({
  days,
  showIntake,
  showOutput,
}: {
  days: BalanceDay[];
  showIntake: boolean;
  showOutput: boolean;
}) {
  const intake = aggregateSegments(days.flatMap((day) => day.intake));
  const output = aggregateSegments(days.flatMap((day) => day.output));

  return (
    <div className={cn("mt-6 grid gap-4", showIntake && showOutput && "lg:grid-cols-2")}>
      {showIntake && (
        <AggregateChart title="30-day intake aggregate" detail="Protein, carbs, and fat across the full window." segments={intake} />
      )}
      {showOutput && (
        <AggregateChart title="30-day output aggregate" detail="Base burn and movement across the full window." segments={output} />
      )}
    </div>
  );
}

function aggregateSegments(segments: Segment[]): Segment[] {
  const totals = new Map<string, Segment>();
  segments.forEach((segment) => {
    const current = totals.get(segment.label);
    totals.set(segment.label, {
      ...segment,
      calories: (current?.calories ?? 0) + segment.calories,
    });
  });
  return Array.from(totals.values());
}

function AggregateChart({
  title,
  detail,
  segments,
}: {
  title: string;
  detail: string;
  segments: Segment[];
}) {
  const max = Math.max(1, ...segments.map((segment) => segment.calories));

  return (
    <div className="rounded-[1.5rem] border border-primary-100 bg-[#f8fbf9] p-5">
      <h3 className="font-heading text-xl font-black text-[#16302a]">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-[#78928a]">{detail}</p>
      <div className="mt-5 grid gap-4">
        {segments.map((segment) => (
          <div key={`${title}-${segment.label}`} className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-black text-[#54635d]">
                <span className={cn("h-3 w-3 rounded-full", TONE_DOTS[segment.tone])} />
                {segment.label}
              </span>
              <span className="text-sm font-black tabular-nums text-[#16302a]">
                {segment.calories.toLocaleString()} kcal
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white">
              <div
                className={cn("h-full rounded-full", TONE_CLASSES[segment.tone])}
                style={{ width: `${Math.max(8, (segment.calories / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-3.5 py-2 text-xs font-black transition md:min-h-0",
        active
          ? "bg-primary-100 text-primary-700"
          : "bg-[#f4f8f6] text-[#9db0aa] line-through"
      )}
    >
      {children}
    </button>
  );
}

function BarDetailModal({
  selected,
  onClose,
}: {
  selected: SelectedBar;
  onClose: () => void;
}) {
  const segments = selected.kind === "intake" ? selected.day.intake : selected.day.output;
  const total = totalCalories(segments);
  const isIntake = selected.kind === "intake";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071d18]/35 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${selected.day.label} ${selected.kind} breakdown`}
        className="w-full max-w-2xl rounded-[2rem] border border-primary-100 bg-white p-5 shadow-[0_28px_90px_rgba(7,29,24,0.28)] md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-600">
              {selected.day.dateLabel}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-black text-[#16302a]">
              {selected.day.label} {isIntake ? "intake" : "output"} breakdown
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6f8981]">
              {selected.day.note}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f8f6] text-[#6f8981] transition hover:bg-primary-50 hover:text-primary-700"
            aria-label="Close detail"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-[#f8fbf9] p-4">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black tabular-nums text-[#16302a]">
              {total.toLocaleString()}
            </p>
            <p className="pb-1 text-sm font-black uppercase tracking-[0.08em] text-[#9db0aa]">
              calories in this {isIntake ? "intake" : "output"} bar
            </p>
          </div>
          <div className="mt-4 flex h-5 overflow-hidden rounded-full bg-white">
            {segments.map((segment) => (
              <span
                key={segment.label}
                className={TONE_CLASSES[segment.tone]}
                style={{ width: `${(segment.calories / Math.max(total, 1)) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex flex-col gap-3 rounded-[1.25rem] border border-primary-100/80 px-4 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={cn("h-3 w-3 rounded-full", TONE_DOTS[segment.tone])} />
                <div>
                  <p className="font-heading text-base font-black text-[#16302a]">
                    {segment.label}
                  </p>
                  <p className="text-sm font-semibold text-[#7c968f]">{segment.detail}</p>
                </div>
              </div>
              <p className="text-lg font-black tabular-nums text-[#16302a]">
                {segment.calories.toLocaleString()} kcal
              </p>
            </div>
          ))}
        </div>

        {isIntake && selected.day.id === "today" && (
          <div className="mt-5 rounded-[1.25rem] border border-primary-100 bg-primary-50/70 p-4">
            <p className="text-sm font-black text-primary-800">Meal detail available below</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-primary-800/70">
              Scroll to the nutrition log to inspect breakfast, lunch, dinner, and item-level macros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ tone, label }: { tone: SegmentTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", TONE_DOTS[tone])} />
      {label}
    </span>
  );
}

function TrendCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.25rem] bg-[#f8fbf9] px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-700">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c968f]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums text-[#16302a]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#7c968f]">{detail}</p>
    </div>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
