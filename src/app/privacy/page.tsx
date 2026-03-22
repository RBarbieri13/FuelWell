import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FuelWell Privacy Policy — how we handle your data.",
};

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly, such as your name, email address, dietary preferences, fitness goals, and usage data within the app. We may also collect data from connected wearable devices with your explicit permission.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your data is used exclusively to power your personalized coaching experience. This includes generating meal plans, workout recommendations, progress insights, and AI coaching responses. We never sell your personal data to third parties.",
  },
  {
    title: "Data Storage & Security",
    content:
      "All data is encrypted in transit and at rest. We use industry-standard security practices to protect your information. Your health and fitness data is stored securely and accessible only to you.",
  },
  {
    title: "Third-Party Services",
    content:
      "We may use third-party services for analytics, payment processing, and infrastructure. These services are bound by their own privacy policies and are selected for their commitment to data protection.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, export, or delete your data at any time. You can request a complete copy of your data or permanent deletion by contacting us at privacy@fuelwell.app.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this policy from time to time. We will notify you of any material changes via email or in-app notification. Continued use of FuelWell after changes constitutes acceptance of the updated policy.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="March 2026"
      intro="At FuelWell, your privacy is fundamental to everything we build. This policy explains what information we collect, how we use it, and what choices you have. The short version: your data belongs to you, we never sell it, and you can delete it anytime."
      sections={sections}
      contactEmail="privacy@fuelwell.app"
    />
  );
}
