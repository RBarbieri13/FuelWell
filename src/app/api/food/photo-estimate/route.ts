import { z } from "zod";
import { estimateFromImage } from "@/lib/food/photo-estimate";

const requestSchema = z.object({
  imageDataUrl: z.preprocess(
    (value) => (value === null ? undefined : value),
    z.string().max(7_000_000).optional().describe("JPG, PNG, or WebP data URL.")
  ),
  description: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Upload a meal photo or add a short description." }, { status: 400 });
  }
  const { imageDataUrl, description } = parsed.data;
  if (!imageDataUrl && !description) {
    return Response.json({ error: "Upload a meal photo or add a short description." }, { status: 400 });
  }
  const result = await estimateFromImage({
    dataUrl: imageDataUrl ?? "data:image/png;base64,",
    description,
  });
  return Response.json(result, { status: result.enabled || result.candidates.length > 0 ? 200 : 202 });
}
