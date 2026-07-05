import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FuelWell · Build Status",
  description:
    "Live bird's-eye view of FuelWell's build progress against the master plan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
