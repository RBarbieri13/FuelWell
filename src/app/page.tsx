import { Section } from "@/components/ui/section";

export default function Home() {
  return (
    <Section className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4">
        <h1 className="gradient-text">FuelWell</h1>
        <p className="text-lg text-muted-foreground">
          Fuel Well, Feel Well.
        </p>
      </div>
    </Section>
  );
}
