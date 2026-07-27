/**
 * Colour as a semantic tool.
 *
 * FuelWell is a green app. Colour outside that green is therefore expensive
 * signal, and it is spent only where a hue carries meaning the user can learn
 * once and reuse everywhere: protein is always sky, carbs are always lemon,
 * fat is always coral, training output is always teal, sleep and recovery are
 * violet, and soreness or an over-target is rose.
 *
 * The rule this file exists to enforce: a tone is chosen by WHAT THE NUMBER IS,
 * never by what looks nice in that card. Two screens showing protein must show
 * the same blue, or the colour teaches nothing.
 */

export type Tone =
  | "primary"
  | "sky"
  | "lemon"
  | "accent"
  | "teal"
  | "violet"
  | "rose"
  | "neutral";

export type ToneStyle = {
  /** Icon plate / small square glyph background. */
  chip: string;
  /** Inline pill or status chip. */
  pill: string;
  /** Tinted card surface — for when the whole card carries the tone. */
  surface: string;
  /** Solid fill for meters, bars, and chart series. A raw CSS colour. */
  meter: string;
  /** Text colour at readable contrast on white or on the tinted surface. */
  text: string;
  /** Dot marker for legends. */
  dot: string;
};

const RING = "ring-1 ring-inset";

export const toneStyles: Record<Tone, ToneStyle> = {
  primary: {
    chip: `bg-primary-50 text-primary-700 ${RING} ring-primary-100`,
    pill: `bg-primary-50 text-primary-800 ${RING} ring-primary-100`,
    surface: `bg-primary-50/60 ${RING} ring-primary-100`,
    meter: "var(--color-macro-calories)",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
  sky: {
    chip: `bg-sky-50 text-sky-700 ${RING} ring-sky-100`,
    pill: `bg-sky-50 text-sky-700 ${RING} ring-sky-100`,
    surface: `bg-sky-50/70 ${RING} ring-sky-100`,
    meter: "var(--color-macro-protein)",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  lemon: {
    chip: `bg-lemon-50 text-lemon-700 ${RING} ring-lemon-100`,
    pill: `bg-lemon-50 text-lemon-700 ${RING} ring-lemon-100`,
    surface: `bg-lemon-50/70 ${RING} ring-lemon-100`,
    meter: "var(--color-macro-carbs)",
    text: "text-lemon-700",
    dot: "bg-lemon-500",
  },
  accent: {
    chip: `bg-accent-50 text-accent-700 ${RING} ring-accent-100`,
    pill: `bg-accent-50 text-accent-700 ${RING} ring-accent-100`,
    surface: `bg-accent-50/70 ${RING} ring-accent-100`,
    meter: "var(--color-macro-fat)",
    text: "text-accent-700",
    dot: "bg-accent-400",
  },
  teal: {
    chip: `bg-teal-50 text-teal-700 ${RING} ring-teal-100`,
    pill: `bg-teal-50 text-teal-700 ${RING} ring-teal-100`,
    surface: `bg-teal-50/80 ${RING} ring-teal-100`,
    meter: "var(--color-teal-500)",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  violet: {
    chip: `bg-violet-50 text-violet-700 ${RING} ring-violet-100`,
    pill: `bg-violet-50 text-violet-700 ${RING} ring-violet-100`,
    surface: `bg-violet-50/70 ${RING} ring-violet-100`,
    meter: "var(--color-violet-500)",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  rose: {
    chip: `bg-rose-50 text-rose-700 ${RING} ring-rose-100`,
    pill: `bg-rose-50 text-rose-700 ${RING} ring-rose-100`,
    surface: `bg-rose-50/70 ${RING} ring-rose-100`,
    meter: "var(--color-rose-500)",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  neutral: {
    chip: `bg-surface-muted text-ink-muted ${RING} ring-hairline-strong`,
    pill: `bg-surface-muted text-ink-muted ${RING} ring-hairline-strong`,
    surface: `bg-surface-muted ${RING} ring-hairline`,
    meter: "var(--color-primary-300)",
    text: "text-ink-muted",
    dot: "bg-ink-faint",
  },
};

/**
 * The registry that makes the colour mean something. Look a concept up here
 * rather than picking a tone by eye — that is what keeps protein the same blue
 * on the dashboard, in the log, in the coach card, and on the progress chart.
 */
export const SEMANTIC_TONES = {
  calories: "primary",
  protein: "sky",
  carbs: "lemon",
  fat: "accent",

  // Movement and output
  workout: "teal",
  activity: "teal",
  steps: "primary",
  baseBurn: "primary",

  // Recovery and readiness
  sleep: "violet",
  recovery: "violet",
  readiness: "violet",
  hydration: "sky",
  soreness: "rose",

  // States
  overTarget: "accent",
  alert: "rose",
  planned: "neutral",
  logged: "primary",
} as const satisfies Record<string, Tone>;

export type SemanticConcept = keyof typeof SEMANTIC_TONES;

export function toneFor(concept: SemanticConcept): Tone {
  return SEMANTIC_TONES[concept];
}

/**
 * Soreness, effort, and readiness scores read 0-10 or 0-100. Colour should
 * track severity so a glance is enough: calm green low, amber mid, rose high.
 */
export function severityTone(value: number, max = 10): Tone {
  if (max <= 0) return "neutral";
  const ratio = value / max;
  if (ratio >= 0.6) return "rose";
  if (ratio >= 0.35) return "lemon";
  return "primary";
}
