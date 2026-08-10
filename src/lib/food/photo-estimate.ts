import { searchFoods } from "@/lib/food-database";
import type { MacroTotals } from "@/lib/fuelwell-data";
import {
  createCoachProviderClient,
  providerModelCandidates,
  resolveCoachProviderConfig,
} from "@/lib/coach/provider-client";
import { costUsdCents } from "@/lib/coach/cost";

export type PhotoEstimateCandidate = {
  name: string;
  portionLabel: string;
  totals: MacroTotals;
  confidence: number;
  source: "vision_model" | "description_search";
  sourceNote: string;
};

export type PhotoEstimateResult = {
  enabled: boolean;
  candidates: PhotoEstimateCandidate[];
  reviewRequired: true;
  sourceNote: string;
};

type PhotoEstimateUsage = {
  inputTokens: number;
  outputTokens: number;
  costUsdCents: number;
  model: string;
};

function candidateFromName(name: string, source: PhotoEstimateCandidate["source"]): PhotoEstimateCandidate | null {
  const food = searchFoods(name, 1)[0];
  if (!food) return null;
  const serving = food.commonServings[1] ?? food.commonServings[0] ?? { label: "100 g", amount: 100 };
  const f = serving.amount / 100;
  return {
    name: food.name,
    portionLabel: serving.label,
    totals: {
      calories: Math.round(food.per100.kcal * f),
      protein: Math.round(food.per100.protein * f),
      carbs: Math.round(food.per100.carbs * f),
      fat: Math.round(food.per100.fat * f),
    },
    confidence: source === "vision_model" ? 0.68 : 0.52,
    source,
    sourceNote:
      source === "vision_model"
        ? "AI photo estimate. Review before saving; no meal is auto-logged."
        : "Draft from your description. Review before saving; no meal is auto-logged.",
  };
}

export function estimateFromDescription(description: string): PhotoEstimateCandidate[] {
  const words = description
    .split(/[,;\n]+|\band\b/i)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
  const candidates: PhotoEstimateCandidate[] = [];
  for (const part of words) {
    const candidate = candidateFromName(part, "description_search");
    if (candidate && !candidates.some((c) => c.name === candidate.name)) {
      candidates.push(candidate);
    }
    if (candidates.length === 4) break;
  }
  return candidates;
}

export async function estimateFromImage(input: {
  dataUrl: string;
  description?: string;
}, options?: {
  onUsage?: (usage: PhotoEstimateUsage) => Promise<void> | void;
}): Promise<PhotoEstimateResult> {
  const enabled = process.env.PHOTO_LOGGING_ENABLED === "true";
  if (!enabled) {
    return {
      enabled: false,
      candidates: input.description ? estimateFromDescription(input.description) : [],
      reviewRequired: true,
      sourceNote:
        "Photo AI is behind a kill switch. Draft candidates can come from your description, but the photo itself was not analyzed.",
    };
  }

  const providerConfig = resolveCoachProviderConfig();
  if (!providerConfig) {
    return {
      enabled: false,
      candidates: input.description ? estimateFromDescription(input.description) : [],
      reviewRequired: true,
      sourceNote:
        "Photo AI is enabled but no approved server provider is configured. No image analysis ran.",
    };
  }

  const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) {
    return {
      enabled: false,
      candidates: input.description ? estimateFromDescription(input.description) : [],
      reviewRequired: true,
      sourceNote: "Unsupported image format. Use JPG, PNG, or WebP.",
    };
  }

  const anthropic = createCoachProviderClient(providerConfig);
  const models = providerModelCandidates(
    providerConfig,
    process.env.PHOTO_LOGGING_MODEL ?? "claude-haiku-4-5",
  );
  let message: Awaited<ReturnType<typeof anthropic.messages.create>> | null = null;
  let selectedModel: string | null = null;
  for (const model of models) {
    try {
      message = await anthropic.messages.create({
        model,
        max_tokens: 500,
        system:
          "Identify likely foods in the meal photo. Return only JSON: {\"foods\":[\"short food name\"]}. Do not estimate calories.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: match[1] as "image/jpeg" | "image/png" | "image/webp", data: match[2] },
              },
              {
                type: "text",
                text: input.description
                  ? `User note: ${input.description}`
                  : "List the likely foods in this meal photo.",
              },
            ],
          },
        ],
      });
      selectedModel = model;
      break;
    } catch {
      // Try the next approved vision-capable Gateway model.
    }
  }
  if (!message) {
    return {
      enabled: false,
      candidates: input.description ? estimateFromDescription(input.description) : [],
      reviewRequired: true,
      sourceNote:
        "Photo analysis is temporarily unavailable. Any draft comes from your description and must be reviewed before saving.",
    };
  }
  if (selectedModel && options?.onUsage) {
    await options.onUsage({
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      costUsdCents: costUsdCents(
        selectedModel,
        message.usage.input_tokens,
        message.usage.output_tokens,
      ),
      model: selectedModel,
    });
  }
  const text = message.content.find((block) => block.type === "text")?.text ?? "{}";
  let names: string[] = [];
  try {
    const parsed = JSON.parse(text) as { foods?: string[] };
    names = Array.isArray(parsed.foods) ? parsed.foods.slice(0, 4) : [];
  } catch {
    names = [];
  }
  const candidates = names
    .map((name) => candidateFromName(name, "vision_model"))
    .filter((candidate): candidate is PhotoEstimateCandidate => candidate !== null);
  return {
    enabled: true,
    candidates,
    reviewRequired: true,
    sourceNote: "AI photo estimate. Review every item before saving; no meal is auto-logged.",
  };
}
