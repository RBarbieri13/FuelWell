"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronDown,
  Flame,
  Layers3,
  X,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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

/** Fixed plot band height in px. Bars and gridlines share this scale. */
const PLOT_HEIGHT = 168;

const TONE_CLASSES: Record<SegmentTone, string> = {
  protein: "bg-sky-500",
  carbs: "bg-lemon-500",
  fat: "bg-accent-400",
  bmr: "bg-primary-700",
  steps: "bg-primary-400",
  training: "bg-teal-500",
  mobility: "bg-teal-400/70",
};

const TONE_DOTS: Record<SegmentTone, string> = {
  protein: "bg-sky-500",
  carbs: "bg-lemon-500",
  fat: "bg-accent-400",
  bmr: "bg-primary-700",
  steps: "bg-primary-400",
  training: "bg-teal-500",
  mobility: "bg-teal-400/70",
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

/**
 * Segment heights as percentages that always sum to exactly 100. Clamping
 * each segment to a visible minimum independently used to push the stack past
 * the bar's own height, so the largest segment was silently clipped away by
 * the bar's overflow. Flooring first and then renormalising keeps every
 * segment visible *and* inside the painted box.
 */
function segmentHeights(segments: Segment[], total: number) {
  const safeTotal = Math.max(total, 1);
  const floored = segments.map((segment) =>
    Math.max((segment.calories / safeTotal) * 100, 2.5)
  );
  const sum = floored.reduce((a, b) => a + b, 0) || 1;
  return floored.map((value) => (value / sum) * 100);
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

/**
 * Scale macro-derived segment calories so the intake bar total equals the
 * item-level calorie total shown in the overview tiles — both surfaces then
 * report the same "food in" number (grams in each segment stay as logged).
 */
function scaleSegmentsToTotal(segments: Segment[], targetTotal: number): Segment[] {
  const macroTotal = totalCalories(segments);
  if (macroTotal <= 0 || targetTotal <= 0) {
    return segments;
  }
  let allocated = 0;
  return segments.map((segment, index) => {
    if (index === segments.length - 1) {
      return { ...segment, calories: Math.max(0, targetTotal - allocated) };
    }
    const scaled = Math.round((segment.calories / macroTotal) * targetTotal);
    allocated += scaled;
    return { ...segment, calories: scaled };
  });
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
  const macroSegments = macroSegmentsForTotals({ protein, carbs, fat });

  return {
    id: "today",
    label: "Today",
    dateLabel: "Current day",
    intake: hasMeals ? scaleSegmentsToTotal(macroSegments, totals.calories) : macroSegments,
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
  const [showBmr, setShowBmr] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const [selectedBar, setSelectedBar] = useState<SelectedBar | null>(null);
  const [previewBar, setPreviewBar] = useState<SelectedBar | null>(null);
  const [intakeExpanded, setIntakeExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const days = useMemo(
    () => buildSampleHistory(buildToday(meals, targets, activityOutputSignals)),
    [activityOutputSignals, meals, targets]
  );
  const hasRealData = meals.length > 0 || activityOutputSignals.length > 0;
  const start = Math.max(0, days.length - range);
  const visibleDays = days.slice(start, start + range);

  // Days render oldest → newest; on a page about today the strip should open
  // with Today in view (swipe left for history), not scrolled to the oldest day.
  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollLeft = element.scrollWidth;
    }
  }, [range, intakeExpanded, outputExpanded]);
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
  const windowLabel = range === 1 ? "Today only" : `Latest ${range}`;

  const clearPreview = useCallback(() => setPreviewBar(null), []);

  // Controls make no sense with nothing charted: without a single logged
  // meal or activity signal the card explains itself and points at Log.
  if (!hasRealData) {
    return (
      <Card className="px-5 py-5 md:px-6 md:py-6">
        <p className="inline-flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
          <BarChart3 className="h-4 w-4" strokeWidth={2} />
          Energy ledger
        </p>
        <h2 className="mt-1.5 font-heading text-xl font-black text-ink md:text-3xl">
          Intake and output by day
        </h2>
        <div className="mt-4 rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/50">
          <EmptyState
            size="inline"
            icon={BarChart3}
            title="No energy data yet today."
            description="Log a meal or a workout and this becomes a day-by-day comparison of calories eaten against calories burned."
            action={{ label: "Log your first meal", href: "/app/log" }}
          />
        </div>
      </Card>
    );
  }

  const readout = previewBar ?? selectedBar;
  const readoutSegments = readout
    ? readout.kind === "intake"
      ? readout.day.intake
      : readout.day.output
    : [];

  return (
    <>
      <Card className="px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              <BarChart3 className="h-4 w-4" strokeWidth={2} />
              Energy ledger
            </p>
            <h2 className="mt-1.5 font-heading text-xl font-black text-ink md:text-3xl">
              Intake and output by day
            </h2>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-ink-muted md:text-base">
              Compare calories eaten against calories burned. Each day has an intake bar
              for protein, carbs, and fat, plus an output bar for base burn and movement.
            </p>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div
              role="group"
              aria-label="Ledger window"
              className="flex flex-wrap gap-1.5 rounded-[1.4rem] bg-surface-sunken p-1 ring-1 ring-inset ring-hairline"
            >
              {RANGE_OPTIONS.map((option) => {
                const selected = range === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      "fw-press min-h-11 rounded-full px-3.5 py-2 text-xs font-black focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1 md:min-h-9",
                      selected
                        ? "bg-primary-600 text-white shadow-e2"
                        : "text-ink-muted hover:bg-surface hover:text-primary-800"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="mt-4 grid gap-2 sm:grid-cols-2"
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
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-ink">{windowLabel}</p>
                <p className="text-xs font-semibold text-ink-muted">
                  Tap any bar to pin its full breakdown open.
                </p>
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

            {/* Hover / focus readout. It lives outside the horizontal scroller
                so a breakdown is never clipped by the strip's own overflow. */}
            <div
              className="mt-3 min-h-[3.25rem] rounded-[1rem] bg-surface-subtle px-3.5 py-2.5 ring-1 ring-inset ring-hairline"
              aria-live="polite"
            >
              {readout ? (
                <>
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-black tabular-nums text-ink">
                    <span>
                      {readout.day.label} · {readout.kind === "intake" ? "Intake" : "Output"}
                    </span>
                    <span className="text-primary-700">
                      {totalCalories(readoutSegments).toLocaleString()} kcal
                    </span>
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold tabular-nums text-ink-muted">
                    {readoutSegments.map((segment) => (
                      <span key={segment.label} className="inline-flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className={cn("h-2 w-2 rounded-full", TONE_DOTS[segment.tone])}
                        />
                        {segment.label} {segment.calories.toLocaleString()}
                      </span>
                    ))}
                  </p>
                </>
              ) : (
                <p className="text-xs font-semibold leading-5 text-ink-subtle">
                  Hover or focus a bar for its breakdown. Scale runs 0 to{" "}
                  <span className="tabular-nums">{maxTotal.toLocaleString()}</span> kcal.
                </p>
              )}
            </div>

            {range >= 7 && (
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-ink-subtle md:hidden">
                Swipe sideways to compare days
              </p>
            )}

            <div className="mt-3 flex min-w-0 gap-2">
              {/* Shared y axis, parked outside the scroller so the scale stays
                  on screen while the day strip pans. */}
              <div aria-hidden="true" className="w-9 shrink-0 pt-2 sm:w-11">
                <div
                  className="flex flex-col justify-between text-right text-[10px] font-bold leading-none tabular-nums text-ink-faint"
                  style={{ height: PLOT_HEIGHT }}
                >
                  <span>{maxTotal.toLocaleString()}</span>
                  <span>{Math.round(maxTotal / 2).toLocaleString()}</span>
                  <span>0</span>
                </div>
              </div>

              <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto pb-2">
                {/* Column minimums alone size the grid: narrow ranges fit the
                    viewport (no phantom scroll area), wide ranges scroll. */}
                <div
                  className="relative grid items-end gap-2"
                  style={{ gridTemplateColumns: `repeat(${filteredDays.length}, minmax(84px, 1fr))` }}
                >
                  {/* Gridlines span the whole strip at the same stops as the
                      axis labels — values are being compared across days. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-2"
                    style={{ height: PLOT_HEIGHT }}
                  >
                    <span className="absolute inset-x-0 top-0 border-t border-dashed border-hairline-strong" />
                    <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-hairline-strong" />
                    <span className="absolute inset-x-0 bottom-0 border-t border-hairline-strong" />
                  </div>

                  {filteredDays.map((day) => (
                    <DayColumn
                      key={day.id}
                      day={day}
                      maxTotal={maxTotal}
                      onSelect={setSelectedBar}
                      onPreview={setPreviewBar}
                      onPreviewEnd={clearPreview}
                      showIntake={intakeExpanded}
                      showOutput={outputExpanded}
                    />
                  ))}
                </div>
              </div>
            </div>

            {range === 30 && (
              <AggregateThirtyDayCharts
                days={filteredDays}
                showIntake={intakeExpanded}
                showOutput={outputExpanded}
              />
            )}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-hairline pt-4 text-xs font-bold text-ink-muted">
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
        "fw-press flex min-h-12 w-full min-w-0 items-center justify-between gap-2 rounded-[1rem] px-3 py-2 text-left ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1",
        expanded
          ? isIntake
            ? "bg-primary-600 text-white shadow-e2 ring-primary-700 hover:bg-primary-700"
            : "bg-sky-600 text-white shadow-e2 ring-sky-700 hover:bg-sky-700"
          : isIntake
            ? "bg-primary-50 text-primary-800 ring-primary-200 hover:bg-primary-100"
            : "bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100"
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
        <span className={cn("hidden text-xs font-semibold sm:block", expanded ? "text-white/80" : "opacity-75")}>
          {detail}
        </span>
      </span>
      <ChevronDown
        className={cn("h-5 w-5 shrink-0 transition-transform duration-200 ease-out-soft", expanded && "rotate-180")}
        strokeWidth={2.25}
      />
    </button>
  );
}

function DayColumn({
  day,
  maxTotal,
  onSelect,
  onPreview,
  onPreviewEnd,
  showIntake,
  showOutput,
}: {
  day: BalanceDay;
  maxTotal: number;
  onSelect: (selected: SelectedBar) => void;
  onPreview: (selected: SelectedBar) => void;
  onPreviewEnd: () => void;
  showIntake: boolean;
  showOutput: boolean;
}) {
  const intakeTotal = totalCalories(day.intake);
  const outputTotal = totalCalories(day.output);
  const net = intakeTotal - outputTotal;
  const isToday = day.id === "today";

  return (
    <div
      className={cn(
        "flex flex-col rounded-[1.1rem] p-2 transition-colors duration-200 ease-out-soft",
        isToday
          ? "bg-primary-50/60 ring-1 ring-inset ring-primary-200"
          : "ring-1 ring-inset ring-transparent hover:bg-surface hover:ring-hairline"
      )}
    >
      <div className="flex items-end justify-center gap-2" style={{ height: PLOT_HEIGHT }}>
        {showIntake && (
          <StackedBar
            label="Intake"
            total={intakeTotal}
            segments={day.intake}
            maxTotal={maxTotal}
            onClick={() => onSelect({ day, kind: "intake" })}
            onPreview={() => onPreview({ day, kind: "intake" })}
            onPreviewEnd={onPreviewEnd}
          />
        )}
        {showOutput && (
          <StackedBar
            label="Output"
            total={outputTotal}
            segments={day.output}
            maxTotal={maxTotal}
            onClick={() => onSelect({ day, kind: "output" })}
            onPreview={() => onPreview({ day, kind: "output" })}
            onPreviewEnd={onPreviewEnd}
          />
        )}
      </div>
      <div aria-hidden="true" className="mt-1.5 flex justify-center gap-2">
        {showIntake && (
          <span className="w-9 text-center text-[9px] font-black uppercase tracking-[0.06em] text-ink-faint">
            In
          </span>
        )}
        {showOutput && (
          <span className="w-9 text-center text-[9px] font-black uppercase tracking-[0.06em] text-ink-faint">
            Out
          </span>
        )}
      </div>
      <div className="mt-1.5 text-center">
        <p className="truncate text-sm font-black text-ink">{day.label}</p>
        <p
          className={cn(
            "text-xs font-black tabular-nums",
            net <= 0 ? "text-primary-700" : "text-accent-600"
          )}
        >
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
  onPreview,
  onPreviewEnd,
}: {
  label: string;
  total: number;
  segments: Segment[];
  maxTotal: number;
  onClick: () => void;
  onPreview: () => void;
  onPreviewEnd: () => void;
}) {
  const heightPercent = Math.max(total > 0 ? 4 : 0, (total / Math.max(maxTotal, 1)) * 100);
  const heights = segmentHeights(segments, total);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreview}
      onBlur={onPreviewEnd}
      className="group relative flex h-full w-9 items-end justify-center rounded-lg focus:outline-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
      aria-label={`Open ${label.toLowerCase()} detail with ${total} calories`}
    >
      {/* Value rides above the bar, outside its clipped box, so it is never
          swallowed the way an inside-the-bar label would be. */}
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black leading-none tabular-nums text-ink-subtle transition-opacity duration-200 ease-out-soft group-hover:text-ink group-focus-visible:text-ink"
        style={{ bottom: `calc(${heightPercent}% + 0.3rem)` }}
      >
        {total.toLocaleString()}
      </span>
      <span
        className="flex w-8 flex-col justify-end overflow-hidden rounded-t-[0.5rem] rounded-b-[0.2rem] bg-surface-sunken ring-1 ring-inset ring-ink/5 transition-[height,box-shadow] duration-500 ease-out-soft group-hover:ring-primary-400 group-focus-visible:ring-2 group-focus-visible:ring-primary-600"
        style={{ height: `${heightPercent}%` }}
      >
        {segments.map((segment, index) => (
          <span
            key={`${label}-${segment.label}`}
            className={cn(
              "block w-full",
              TONE_CLASSES[segment.tone],
              index > 0 && "border-t border-white/40"
            )}
            style={{ height: `${heights[index]}%` }}
            title={`${segment.label}: ${segment.calories} calories`}
          />
        ))}
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
    <div className="rounded-[1.5rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline sm:p-5">
      <h3 className="font-heading text-lg font-black text-ink md:text-xl">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-ink-muted">{detail}</p>
      <div className="mt-5 grid gap-4">
        {segments.map((segment) => (
          <div key={`${title}-${segment.label}`} className="grid gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-2 text-sm font-black text-ink-muted">
                <span
                  aria-hidden="true"
                  className={cn("h-3 w-3 rounded-full", TONE_DOTS[segment.tone])}
                />
                {segment.label}
              </span>
              <span className="text-sm font-black tabular-nums text-ink">
                {segment.calories.toLocaleString()} kcal
              </span>
            </div>
            <div
              className="h-3.5 overflow-hidden rounded-full bg-surface-sunken"
              role="img"
              aria-label={`${segment.label}: ${segment.calories.toLocaleString()} kcal of a ${max.toLocaleString()} kcal maximum`}
            >
              <div
                className={cn("h-full rounded-full transition-[width] duration-700 ease-out-soft", TONE_CLASSES[segment.tone])}
                style={{ width: `${Math.max(4, (segment.calories / max) * 100)}%` }}
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
      aria-pressed={active}
      className={cn(
        "fw-press min-h-11 rounded-full px-3.5 py-2 text-xs font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-1 md:min-h-9",
        active
          ? "bg-primary-100 text-primary-800 ring-primary-200"
          : "bg-surface-muted text-ink-subtle line-through ring-hairline-strong hover:bg-surface"
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
  const heights = segmentHeights(segments, total);

  // Escape closes the pinned breakdown — a modal that only closes by a small
  // corner target is a trap on a phone.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${selected.day.label} ${selected.kind} breakdown`}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-hairline bg-surface p-5 shadow-e4 md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              {selected.day.dateLabel}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-black text-ink">
              {selected.day.label} {isIntake ? "intake" : "output"} breakdown
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
              {selected.day.note}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="fw-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-muted ring-1 ring-inset ring-hairline hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
            aria-label="Close detail"
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="text-4xl font-black tabular-nums text-ink">
              {total.toLocaleString()}
            </p>
            <p className="pb-1 text-sm font-black uppercase tracking-[0.08em] text-ink-subtle">
              calories in this {isIntake ? "intake" : "output"} bar
            </p>
          </div>
          <div
            className="mt-4 flex h-5 overflow-hidden rounded-full bg-surface-sunken"
            role="img"
            aria-label={segments
              .map((segment) => `${segment.label} ${segment.calories.toLocaleString()} kcal`)
              .join(", ")}
          >
            {segments.map((segment, index) => (
              <span
                key={segment.label}
                className={cn(TONE_CLASSES[segment.tone], index > 0 && "border-l border-white/40")}
                style={{ width: `${heights[index]}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="flex flex-col gap-3 rounded-[1.25rem] bg-surface-muted px-4 py-3.5 ring-1 ring-inset ring-hairline md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn("h-3 w-3 shrink-0 rounded-full", TONE_DOTS[segment.tone])}
                />
                <div className="min-w-0">
                  <p className="font-heading text-base font-black text-ink">
                    {segment.label}
                  </p>
                  <p className="text-sm font-semibold text-ink-muted">{segment.detail}</p>
                </div>
              </div>
              <p className="shrink-0 text-lg font-black tabular-nums text-ink">
                {segment.calories.toLocaleString()} kcal
              </p>
            </div>
          ))}
        </div>

        {isIntake && selected.day.id === "today" && (
          <div className="mt-5 rounded-[1.25rem] bg-primary-50/70 p-4 ring-1 ring-inset ring-primary-100">
            <p className="text-sm font-black text-primary-800">Meal detail available below</p>
            <a
              href="#nutrition-log"
              onClick={onClose}
              className="fw-press mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-black text-primary-700 shadow-e1 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 md:min-h-0"
            >
              Jump to the nutrition log
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ tone, label }: { tone: SegmentTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TONE_DOTS[tone])}
      />
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
    <div className="rounded-[1.25rem] bg-surface-subtle px-4 py-4 ring-1 ring-inset ring-hairline">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
        </span>
        <p className="text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle">
          {label}
        </p>
      </div>
      <p className="mt-3 text-2xl font-black tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">{detail}</p>
    </div>
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}
