import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Join FuelWell and start building a healthier lifestyle with AI-powered nutrition and fitness coaching.",
};

type SearchParams = Promise<{
  from?: string;
}>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const isFounders = params.from === "founders-100";

  const heading = isFounders ? "Claim Your Founders 100 Spot" : "Join FuelWell";
  const subheading = isFounders
    ? "Lock in founding-member pricing for life. Only 100 spots — no payment required today."
    : "Sign up for early access and be among the first to experience AI-powered nutrition and fitness coaching.";
  const submitLabel = isFounders ? "Claim My Spot" : "Join FuelWell";
  const successTitle = isFounders
    ? "Your Founders 100 spot is secured!"
    : "You're on the list!";
  const successMessage = isFounders
    ? "We'll reach out soon with next steps. Your pricing is locked in."
    : "We'll be in touch soon.";

  return (
    <>
      <Section className="pt-24 md:pt-32 pb-8">
        <AnimatedSection className="text-center max-w-2xl mx-auto">
          <h1 className="gradient-text">{heading}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
        </AnimatedSection>
      </Section>

      <Section className="pb-24">
        <AnimatedSection delay={0.15}>
          <SignupForm
            source={isFounders ? "founders-100" : "signup"}
            submitLabel={submitLabel}
            successTitle={successTitle}
            successMessage={successMessage}
            showFoundersPricing={isFounders}
          />
          <p className="text-xs text-muted-foreground text-center mt-6 max-w-lg mx-auto">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </AnimatedSection>
      </Section>
    </>
  );
}