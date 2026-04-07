import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { NavbarV2 } from "@/components/v2/navbar-v2";
import { FooterV2 } from "@/components/v2/footer-v2";
import "./globals-v2.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter-v2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "FuelWell V2 — AI-Powered Nutrition & Fitness Coaching",
    template: "%s | FuelWell V2",
  },
  description:
    "Your AI-powered wellness coach — redesigned with a fresh visual language.",
};

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`v2 ${plusJakarta.variable} ${inter.variable} min-h-screen flex flex-col`}>
      <NavbarV2 />
      <main className="flex-1">{children}</main>
      <FooterV2 />
    </div>
  );
}
