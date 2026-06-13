import { z } from "zod";
import { lookupBarcode } from "@/lib/food/barcode-adapter";

const querySchema = z.object({
  barcode: z.string().min(8).max(32),
});

export function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ barcode: url.searchParams.get("barcode") ?? "" });
  if (!parsed.success) {
    return Response.json({ error: "Enter an 8-14 digit barcode." }, { status: 400 });
  }
  const result = lookupBarcode(parsed.data.barcode);
  if (!result) {
    return Response.json(
      {
        found: false,
        barcode: parsed.data.barcode.replace(/\D/g, ""),
        message: "No verified match found. Search foods or add the meal manually.",
      },
      { status: 404 },
    );
  }
  return Response.json({ found: true, ...result });
}
