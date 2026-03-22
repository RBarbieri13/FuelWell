import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Features",
  description:
    "AI nutrition coaching, adaptive workouts, meal planning, grocery budgeting, and real-time progress tracking.",
};

export default function FeaturesPage() {
  return (
    <Section>
      <h2>What FuelWell helps you do</h2>
      <p className="mt-4 text-muted-foreground">Features page — coming soon.</p>
    </Section>
  );
}
