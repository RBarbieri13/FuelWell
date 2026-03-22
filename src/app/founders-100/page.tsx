import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Founders 100",
  description:
    "Become one of the first 100 members shaping FuelWell. Lifetime pricing, early access, and a direct voice in how the platform grows.",
};

export default function Founders100Page() {
  return (
    <Section>
      <h2>Become one of the first 100 members shaping FuelWell</h2>
      <p className="mt-4 text-muted-foreground">
        Founders 100 page — coming soon.
      </p>
    </Section>
  );
}
