import type { Metadata } from "next";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Join FuelWell and start building a healthier lifestyle.",
};

export default function SignupPage() {
  return (
    <Section>
      <h2>Join FuelWell</h2>
      <p className="mt-4 text-muted-foreground">Signup page — coming soon.</p>
    </Section>
  );
}
