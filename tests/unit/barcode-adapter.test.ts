import { describe, expect, it } from "vitest";
import { lookupBarcode } from "@/lib/food/barcode-adapter";

describe("lookupBarcode", () => {
  it("returns a verified seed match for a known barcode", () => {
    const result = lookupBarcode("000000000104");
    expect(result?.verified).toBe(true);
    expect(result?.food.name).toBe("Chicken breast, grilled");
  });

  it("returns null for unknown or malformed barcodes", () => {
    expect(lookupBarcode("123")).toBeNull();
    expect(lookupBarcode("999999999999")).toBeNull();
  });
});
