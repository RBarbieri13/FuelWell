import { z } from "zod";
import { evaluateBudget } from "@/lib/coach/cost";
import {
  getSupabaseDayCents,
  insertSupabaseUsage,
} from "@/lib/coach/persistence";
import {
  estimateFromDescription,
  estimateFromImage,
  type PhotoEstimateResult,
} from "@/lib/food/photo-estimate";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_DATA_URL_LENGTH = 7_000_000;
const MAX_REQUEST_BYTES = MAX_IMAGE_DATA_URL_LENGTH + 10_000;
const SUPPORTED_IMAGE_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

const requestSchema = z.object({
  imageDataUrl: z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string()
      .max(MAX_IMAGE_DATA_URL_LENGTH)
      .regex(SUPPORTED_IMAGE_DATA_URL)
      .optional()
      .describe("JPG, PNG, or WebP data URL.")
  ),
  description: z.string().trim().min(1).max(500).optional(),
});

function descriptionFallback(description: string | undefined, sourceNote: string): PhotoEstimateResult {
  return {
    enabled: false,
    candidates: description ? estimateFromDescription(description) : [],
    reviewRequired: true,
    sourceNote,
  };
}

function resultResponse(result: PhotoEstimateResult) {
  return Response.json(result, {
    status: result.enabled || result.candidates.length > 0 ? 200 : 202,
  });
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "That photo is too large. Choose a smaller image and try again." }, { status: 413 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Upload a meal photo or add a short description." }, { status: 400 });
  }
  const { imageDataUrl, description } = parsed.data;
  if (!imageDataUrl && !description) {
    return Response.json({ error: "Upload a meal photo or add a short description." }, { status: 400 });
  }

  // Description search is deterministic and local. It never needs auth and
  // must never initialize a paid provider, even when photo logging is enabled.
  if (!imageDataUrl) {
    return resultResponse(
      descriptionFallback(
        description,
        "Draft candidates came from your description. Review every item before saving.",
      ),
    );
  }

  // The kill switch is also a zero-provider path. Keep preview and local
  // development useful without creating paid inference traffic.
  if (process.env.PHOTO_LOGGING_ENABLED !== "true") {
    return resultResponse(
      descriptionFallback(
        description,
        "Photo AI is currently unavailable. Any draft comes from your description and must be reviewed before saving.",
      ),
    );
  }

  if (!hasSupabaseConfig()) {
    return Response.json({ error: "Photo analysis is temporarily unavailable. Try again later." }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    const user = error ? null : data.user;
    if (!user) {
      return Response.json({ error: "Sign in to analyze a meal photo." }, { status: 401 });
    }

    const day = new Date().toISOString().split("T")[0];
    const spentCents = await getSupabaseDayCents(supabase, user.id, day);
    const budget = evaluateBudget(spentCents);
    if (!budget.allowed) {
      return Response.json({ error: budget.message, budgetExceeded: true }, { status: 429 });
    }

    const result = await estimateFromImage(
      { dataUrl: imageDataUrl, description },
      {
        onUsage: async (usage) => {
          await insertSupabaseUsage(supabase, {
            userId: user.id,
            day,
            ...usage,
          });
        },
      },
    );
    return resultResponse(result);
  } catch {
    return Response.json({ error: "Photo analysis is temporarily unavailable. Try again later." }, { status: 503 });
  }
}
