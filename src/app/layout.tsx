import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
