import { createReleaseManifest } from "@/lib/release-manifest";

export const dynamic = "force-dynamic";

export function GET(): Response {
  try {
    return Response.json(createReleaseManifest(), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Release manifest is unavailable", error);
    return Response.json(
      { error: "Release manifest is unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
