import { Section } from "@/components/ui/section";
import { AnimatedSection } from "@/components/animated-section";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
  contactEmail: string;
}

export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
  contactEmail,
}: LegalPageProps) {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-[-10%] right-[15%] w-[300px] h-[300px] rounded-full bg-emerald-200/10 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <h1 className="gradient-text">{title}</h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <Section className="pb-24">
        <div className="max-w-3xl mx-auto space-y-10">
          {intro && (
            <AnimatedSection>
              <p className="text-muted-foreground leading-relaxed">{intro}</p>
            </AnimatedSection>
          )}

          {sections.map((section, i) => (
            <AnimatedSection key={section.title} delay={i * 0.05}>
              <div className="space-y-3 pb-10 border-b border-fw-border/30 last:border-b-0 last:pb-0">
                <h2 className="text-xl font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            </AnimatedSection>
          ))}

          <AnimatedSection>
            <div className="rounded-2xl border border-fw-border bg-white p-6 shadow-card">
              <p className="text-sm text-muted-foreground">
                Questions? Contact us at{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-fw-accent hover:underline transition-colors duration-200"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </Section>
    </>
  );
}
