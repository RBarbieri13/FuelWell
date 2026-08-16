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
  const heading = "Claim Your Founders 100 Spot";
  const subheading =
    "Lock in founding-member pricing for life. Only 100 spots — no payment required today.";
  const submitLabel = "Claim My Spot";
  const successTitle = "Your Founders 100 spot is secured!";
  const successMessage =
    "We'll reach out soon with next steps. Your pricing is locked in.";

  return (
    <>
      <Section className="pb-8 pt-20 md:pb-10 md:pt-28">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <h1 className="gradient-text">{heading}</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-muted-foreground">{subheading}</p>
        </AnimatedSection>
      </Section>

      <Section className="pb-24 pt-8 md:pt-10">
        <AnimatedSection delay={0.15}>
          <SignupForm
            source="founders-100"
            submitLabel={submitLabel}
            successTitle={successTitle}
            successMessage={successMessage}
            showFoundersPricing
          />
          <p className="text-xs text-muted-foreground text-center mt-6 max-w-lg mx-auto">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </AnimatedSection>
      </Section>
    </>
  );
}
