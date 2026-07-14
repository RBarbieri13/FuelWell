import type { Metadata, Viewport } from "next";
import { Geist_Mono, Hanken_Grotesk, Quicksand } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-fw-body",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-fw-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-fw-mono",
  subsets: ["latin"],
});

// viewport-fit=cover makes env(safe-area-inset-*) resolve to real insets in
// the iOS WKWebView shell; without it the safe-area padding in the app layout
// and mobile nav is always 0 on device.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "FuelWell — AI Nutrition Coach",
  description:
    "Your personal AI-powered nutrition coach. Track meals, hit macros, and reach your goals.",
  appleWebApp: {
    capable: true,
    title: "FuelWell",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
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
      data-scroll-behavior="smooth"
      className={`${hankenGrotesk.variable} ${quicksand.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
