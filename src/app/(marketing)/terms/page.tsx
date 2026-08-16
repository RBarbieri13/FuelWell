import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FuelWell Terms of Service.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using FuelWell, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
  },
  {
    title: "Description of Service",
    content:
      "FuelWell provides AI-powered nutrition coaching, meal planning, fitness programming, and progress tracking. The service is intended for informational and educational purposes and does not constitute medical advice.",
  },
  {
    title: "Account Registration",
    content:
      "You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.",
  },
  {
    title: "Subscription & Billing",
    content:
      "FuelWell offers paid subscription plans. Founders 100 members receive lifetime pricing locked at their enrollment rate. Subscriptions auto-renew unless cancelled. You may cancel your subscription at any time from your account settings.",
  },
  {
    title: "Health Disclaimer",
    content:
      "FuelWell is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified health provider before starting any new diet, exercise program, or wellness regimen. FuelWell is designed to complement, not replace, professional guidance.",
  },
  {
    title: "Intellectual Property",
    content:
      "All content, features, and functionality of FuelWell are owned by FuelWell Health, Inc. and are protected by copyright, trademark, and other intellectual property laws.",
  },
  {
    title: "Limitation of Liability",
    content:
      'FuelWell is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to health outcomes, data loss, or service interruptions.',
  },
  {
    title: "Changes to Terms",
    content:
      "We reserve the right to modify these terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="March 2026"
      sections={sections}
      contactEmail="legal@fuelwell.app"
    />
  );
}
