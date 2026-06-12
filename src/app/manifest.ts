import type { MetadataRoute } from "next";

/**
 * Web app manifest so the preview installs as a standalone app from
 * Safari/Chrome "Add to Home Screen" (no browser chrome, brand splash).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FuelWell — AI Nutrition Coach",
    short_name: "FuelWell",
    description:
      "Your personal AI-powered nutrition coach. Track meals, hit macros, and reach your goals.",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#f6f7f4",
    theme_color: "#073b2f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
