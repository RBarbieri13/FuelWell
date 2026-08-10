import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel packages Next.js functions itself. Keep standalone output only for
  // the local bounded-mobile server and other self-hosted verification runs.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
