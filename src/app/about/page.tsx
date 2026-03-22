import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "About",
  description:
    "FuelWell was born from a personal frustration with rigid diet plans. Learn our story and philosophy.",
};

export default function AboutPage() {
  return (
    <Section>
      <h2>Why FuelWell was created</h2>
      <p className="mt-4 text-muted-foreground">About page — coming soon.</p>
    </Section>
  );
}
