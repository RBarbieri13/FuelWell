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

const appName = "FuelWell — AI Nutrition Coach";
const appDescription =
  "Your personal AI-powered nutrition coach. Track meals, hit macros, and reach your goals.";
const publicAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://fuelwell-preview.vercel.app";

// viewport-fit=cover makes env(safe-area-inset-*) resolve to real insets in
// the iOS WKWebView shell; without it the safe-area padding in the app layout
// and mobile nav is always 0 on device.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Matches --background, so the translucent iOS status bar and the Android
  // browser chrome blend into the app surface instead of framing it in white.
  themeColor: "#e8f5f1",
  // The palette is light-only; declaring it stops the UA from inverting form
  // controls and scrollbars when the device is in dark mode.
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  title: appName,
  description: appDescription,
  openGraph: {
    type: "website",
    title: appName,
    description: appDescription,
    images: [
      {
        url: "/brand/fuelwell-social-card.png",
        width: 1200,
        height: 630,
        alt: "FuelWell Health",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: appDescription,
    images: ["/brand/fuelwell-social-card.png"],
  },
  appleWebApp: {
    capable: true,
    title: "FuelWell",
    statusBarStyle: "black-translucent",
  },
  // iOS Safari otherwise auto-links bare figures — calorie totals, macro grams,
  // weights — and repaints them as blue underlined tel:/date links, which
  // breaks every tabular-nums column in the app.
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
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
      {/* touch-manipulation removes the double-tap-zoom delay so taps on the
          marketing and auth pages register as fast as they do in the shell.
          min-h-dvh (not min-h-full) so the page floor tracks the *small*
          viewport while mobile browser chrome is showing, instead of leaving a
          100vh-tall gap under the fold. */}
      <body className="flex min-h-dvh flex-col bg-background text-foreground touch-manipulation">
        {children}
      </body>
    </html>
  );
}
