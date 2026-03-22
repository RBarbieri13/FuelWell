import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";
import { GradientButton } from "@/components/ui/gradient-button";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the FuelWell team.",
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-10%] right-[10%] w-[300px] h-[300px] rounded-full bg-fw-accent/5 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <h1 className="gradient-text">Get in Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Have a question, idea, or just want to say hello? We&apos;d love to
              hear from you.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <Section className="pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <AnimatedSection delay={0.1}>
              <div className="rounded-2xl border border-fw-border bg-white p-6 text-center space-y-3 hover:border-fw-accent/30 transition-colors duration-300 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 mx-auto">
                  <Mail className="h-6 w-6 text-fw-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Email Us</h3>
                <p className="text-sm text-muted-foreground">
                  hello@fuelwell.app
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="rounded-2xl border border-fw-border bg-white p-6 text-center space-y-3 hover:border-violet-200 transition-colors duration-300 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 mx-auto">
                  <MessageSquare className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Founders 100</h3>
                <p className="text-sm text-muted-foreground">
                  Direct feedback channel for members
                </p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.3}>
            <div className="text-center space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                We&apos;re a small team building something we believe in. We read
                every message and respond personally. Whether it&apos;s feedback, a
                feature request, or a partnership inquiry &mdash; reach out.
              </p>
              <GradientButton href="/founders-100">
                Join the Founders 100 for Direct Access
              </GradientButton>
            </div>
          </AnimatedSection>
        </div>
      </Section>
    </>
  );
}
