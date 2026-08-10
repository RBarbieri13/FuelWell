import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const expectedHashes = {
  "public/brand/fuelwell-lockup.png":
    "dc9f6a31fd2a12a9660d373dfbdf949d4cbb7ddc8fcff61b7c02c00ac58f23f8",
  "public/brand/fuelwell-lockup-ondark.png":
    "4b6e0be4e2aedef36105c458fff8aa77d6dbe37c618682cc343d0573a6163ab4",
  "public/brand/fuelwell-social-card.png":
    "9b4c42b9c089e9ccddd18fa559d4b6a2068ade4edb38d7b9e3a55c240655267c",
  "ios/FuelWellApp/Resources/Assets.xcassets/FuelWellLaunchLogo.imageset/FuelWellLaunchLogo.png":
    "800c74d744290571335c834a56a7f999ec1bdc5c0cb406a8b53e5e9ec7c5d64e",
  "ios/FuelWellApp/Resources/Assets.xcassets/FuelWellLaunchLogo.imageset/FuelWellLaunchLogo@2x.png":
    "e4fa17861e6c4603304423a4e3ee06efa85852e054615eccdb838b9819f5d71c",
  "ios/FuelWellApp/Resources/Assets.xcassets/FuelWellLaunchLogo.imageset/FuelWellLaunchLogo@3x.png":
    "8603fd2a2ff6cfa985c57916b4b914cdbe8a1069eb25436d3e138dda2e2f6aa3",
  "ios/FuelWellApp/Resources/Assets.xcassets/FuelWellLaunchLogoInverse.imageset/FuelWellLaunchLogoInverse.png":
    "682a581bd810c0000cb9e7b820baa6724e7d2ae3f2dd5f8f23c3622963a1379b",
  "ios/FuelWellApp/Resources/Assets.xcassets/FuelWellLaunchLogoInverse.imageset/FuelWellLaunchLogoInverse@2x.png":
    "f7e2a3f9f04a5ecb9dfaea459149a774003259935476e7bc7a17d8f35d6f2071",
  "ios/FuelWellApp/Resources/Assets.xcassets/FuelWellLaunchLogoInverse.imageset/FuelWellLaunchLogoInverse@3x.png":
    "9c79ce5584c78288d27f45a6c73d9bc73b4307ed9513898756a1288ef2ca97e8",
} as const;

function absolute(relativePath: string) {
  return path.join(root, relativePath);
}

function sha256(relativePath: string) {
  return createHash("sha256")
    .update(readFileSync(absolute(relativePath)))
    .digest("hex");
}

async function alphaBounds(relativePath: string) {
  const { data, info } = await sharp(absolute(relativePath))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha === 0) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return { minX, minY, maxX, maxY };
}

describe("FuelWell revised release brand", () => {
  it("locks the revised raster derivatives to deterministic bytes", () => {
    for (const [relativePath, hash] of Object.entries(expectedHashes)) {
      expect(sha256(relativePath), relativePath).toBe(hash);
    }
  });

  it.each([
    "public/brand/fuelwell-lockup.png",
    "public/brand/fuelwell-lockup-ondark.png",
  ])("keeps %s horizontal, transparent, and safely padded", async (relativePath) => {
    const metadata = await sharp(absolute(relativePath)).metadata();
    expect(metadata.width).toBe(1400);
    expect(metadata.height).toBe(320);
    expect(metadata.hasAlpha).toBe(true);
    expect(metadata.width! / metadata.height!).toBeCloseTo(4.375, 3);

    const bounds = await alphaBounds(relativePath);
    expect(bounds.minX).toBeGreaterThanOrEqual(30);
    expect(bounds.minY).toBeGreaterThanOrEqual(40);
    expect(bounds.maxX).toBeLessThanOrEqual(1369);
    expect(bounds.maxY).toBeLessThanOrEqual(279);
  });

  it("matches the image aspect ratio to every existing wide logo slot", () => {
    const source = readFileSync(absolute("src/components/ui/logo.tsx"), "utf8");
    expect(source).toContain('sm: "h-8 w-[8.75rem]"');
    expect(source).toContain('md: "h-9 w-[9.75rem]"');
    expect(source).toContain('lg: "h-11 w-[11.75rem]"');
    expect(source).toContain('sm: "140px"');
    expect(source).toContain('md: "156px"');
    expect(source).toContain('lg: "188px"');
    expect(source).toContain('className="object-contain object-left"');

    const assetRatio = 1400 / 320;
    for (const slotRatio of [140 / 32, 156 / 36, 188 / 44]) {
      expect(Math.abs(slotRatio - assetRatio) / assetRatio).toBeLessThan(0.03);
    }
  });

  it("wires the 1200x630 social card into Open Graph and X metadata", async () => {
    const metadata = await sharp(
      absolute("public/brand/fuelwell-social-card.png")
    ).metadata();
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);

    const layout = readFileSync(absolute("src/app/layout.tsx"), "utf8");
    expect(layout).toContain('url: "/brand/fuelwell-social-card.png"');
    expect(layout).toContain('card: "summary_large_image"');
    expect(layout).toContain('images: ["/brand/fuelwell-social-card.png"]');
    expect(layout).toContain('alt: "FuelWell Health"');
  });

  it("uses the inverse lockup on the dark preview deck", () => {
    const preview = readFileSync(absolute("src/app/preview/page.tsx"), "utf8");
    expect(preview).toContain('import { Logo } from "@/components/ui/logo"');
    expect(preview).toContain(
      '<Logo href="" size="lg" tone="inverse" className="mb-3" />'
    );
    expect(preview).not.toContain("FuelWell live preview");
  });

  it.each([
    {
      imageSet: "FuelWellLaunchLogo.imageset",
      baseName: "FuelWellLaunchLogo",
    },
    {
      imageSet: "FuelWellLaunchLogoInverse.imageset",
      baseName: "FuelWellLaunchLogoInverse",
    },
  ])("stages complete native launch artwork in $imageSet", async ({ imageSet, baseName }) => {
    const directory = `ios/FuelWellApp/Resources/Assets.xcassets/${imageSet}`;
    const contents = JSON.parse(
      readFileSync(absolute(`${directory}/Contents.json`), "utf8")
    ) as {
      images: Array<{ filename: string; idiom: string; scale: string }>;
      properties: { "template-rendering-intent": string };
    };

    expect(contents.images).toEqual([
      { filename: `${baseName}.png`, idiom: "universal", scale: "1x" },
      { filename: `${baseName}@2x.png`, idiom: "universal", scale: "2x" },
      { filename: `${baseName}@3x.png`, idiom: "universal", scale: "3x" },
    ]);
    expect(contents.properties["template-rendering-intent"]).toBe("original");

    for (const [scale, width, height] of [
      ["", 400, 90],
      ["@2x", 800, 180],
      ["@3x", 1200, 270],
    ] as const) {
      const metadata = await sharp(
        absolute(`${directory}/${baseName}${scale}.png`)
      ).metadata();
      expect(metadata.width).toBe(width);
      expect(metadata.height).toBe(height);
      expect(metadata.hasAlpha).toBe(true);
    }
  });

  it("consumes the staged native artwork in launch and loading surfaces", () => {
    const app = readFileSync(
      absolute("ios/FuelWellApp/Sources/FuelWellApp.swift"),
      "utf8"
    );
    const info = readFileSync(absolute("ios/FuelWellApp/Info.plist"), "utf8");
    const project = readFileSync(absolute("ios/project.yml"), "utf8");

    expect(app).toContain('Image(colorScheme == .dark ? "FuelWellLaunchLogoInverse" : "FuelWellLaunchLogo")');
    expect(info).toContain("<string>FuelWellLaunchLogo</string>");
    expect(project).toContain("UIImageName: FuelWellLaunchLogo");
  });

  it("removes superseded logo-color instructions from release guidance", () => {
    const design = readFileSync(absolute("docs/ios-guide/DESIGN.md"), "utf8");
    const video = readFileSync(absolute("docs/video_production_packet.md"), "utf8");
    const appMap = readFileSync(absolute("docs/app-map.md"), "utf8");
    const appMapHtml = readFileSync(absolute("docs/app-map.html"), "utf8");
    const founderQuestionnaire = readFileSync(
      absolute("docs/founder_questionnaire_completed.md"),
      "utf8"
    );

    expect(design).toContain("the sole source of truth for logo artwork and logo colors");
    expect(design).not.toContain("Canonical brand mark");
    expect(video).not.toContain('FuelWell logo: "Fuel" in #22c55e');
    expect(video).not.toContain('logo "Fuel"');
    expect(video).not.toContain('"Fuel" in green, "Well" in dark');
    expect(video).toContain("Approved FuelWell raster lockup");
    expect(appMap).not.toContain("Green primary (#22c55e)");
    expect(appMapHtml).not.toContain("Primary Green");
    expect(appMapHtml).toContain("Use the committed FuelWell raster lockups");
    expect(founderQuestionnaire).not.toContain("green primary (#22c55e)");
    expect(founderQuestionnaire).not.toContain(
      'Logo component renders "FuelWell" in the brand font'
    );
    expect(founderQuestionnaire).toContain("Never reconstruct or hardcode logo colors");
    expect(founderQuestionnaire).toContain(
      "consume the committed light and inverse raster assets directly"
    );
  });

  it("renders the approved native logo instead of merely staging it", () => {
    const app = readFileSync(
      absolute("ios/FuelWellApp/Sources/FuelWellApp.swift"),
      "utf8"
    );
    const plist = readFileSync(
      absolute("ios/FuelWellApp/Info.plist"),
      "utf8"
    );

    expect(app).toContain(
      'Image(colorScheme == .dark ? "FuelWellLaunchLogoInverse" : "FuelWellLaunchLogo")'
    );
    expect(plist).toMatch(
      /<key>UIImageName<\/key>\s*<string>FuelWellLaunchLogo<\/string>/
    );
  });
});
