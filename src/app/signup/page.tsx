import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Join FuelWell and start building a healthier lifestyle with AI-powered nutrition and fitness coaching.",
};

export default function SignupPage() {
  return (
    <>
      <Section className="pt-24 md:pt-32 pb-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <h1 className="gradient-text">Join FuelWell</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sign up for early access and be among the first to experience
            AI-powered nutrition and fitness coaching.
          </p>
        </AnimatedSection>
      </Section>

      <Section className="pb-24">
        <AnimatedSection delay={0.15}>
          <SignupForm />
          <p className="text-xs text-muted-foreground text-center mt-6 max-w-lg mx-auto">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </AnimatedSection>
      </Section>
    </>
  );
}
