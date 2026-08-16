import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./marketing.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fuelwellhealth.com"),
  title: {
    default: "FuelWell — AI-Powered Nutrition & Fitness Coaching",
    template: "%s | FuelWell",
  },
  description:
    "Your AI-powered wellness coach for smarter food choices, adaptive workouts, real-time progress tracking, and sustainable habits that actually fit your life.",
  keywords: [
    "AI fitness coach",
    "nutrition coaching",
    "macro tracking",
    "meal planning",
    "adaptive workouts",
    "FuelWell",
  ],
  openGraph: {
    title: "FuelWell — Fuel Well, Feel Well",
    description:
      "AI-powered nutrition and fitness coaching that adapts to your life.",
    type: "website",
    images: ["/og-image.svg"],
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${inter.variable} ${outfit.variable} fw-legacy-marketing min-h-screen bg-background text-foreground antialiased`}
    >
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
