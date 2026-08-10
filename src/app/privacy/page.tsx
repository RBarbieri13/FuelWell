import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import {
  PublicInfoPage,
  PublicInfoSection,
} from "@/components/marketing/public-info-page";

export const metadata: Metadata = {
  title: "Privacy | FuelWell",
  description: "How FuelWell handles account, health, fitness, meal, Coach, and attachment data.",
};

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      eyebrow="Privacy"
      title="Your health data should stay understandable and under your control."
      description="This policy explains what FuelWell processes, why it is needed, and the controls available to you. Last updated August 10, 2026."
      icon={ShieldCheck}
    >
      <PublicInfoSection title="Information FuelWell processes">
        <p>
          FuelWell processes account information and the health-profile details you choose to provide,
          including goals, body measurements, dietary preferences, allergies, activity level, and
          equipment. It also stores the meals, workouts, recovery details, recipes, grocery items,
          and other records you add to your account.
        </p>
        <p>
          When you use Coach or photo and file review, FuelWell processes your message, the attachment,
          and relevant account context so it can answer the request. Location is used only after you
          request a nearby search and allow access while the app is in use.
        </p>
      </PublicInfoSection>

      <PublicInfoSection title="How the information is used">
        <p>
          Your information is used to provide account-specific nutrition, activity, recovery, meal,
          recipe, grocery, progress, and Coach features. FuelWell may also process limited product
          interaction and crash information to keep the app reliable. FuelWell does not use your data
          for cross-app advertising or tracking.
        </p>
      </PublicInfoSection>

      <PublicInfoSection title="Storage and service providers">
        <p>
          Signed-in account data is stored in FuelWell&apos;s Supabase-backed service. Hosting, authentication,
          database, and AI service providers process information only as needed to operate the features
          you request. A Coach request can include relevant profile and log context; attachments are not
          interpreted until you choose to send them.
        </p>
      </PublicInfoSection>

      <PublicInfoSection title="Your controls">
        <p>
          Settings lets you update profile and intake preferences, export account data, sign out, and
          request permanent account deletion. You can decline camera, photo, location, or health access
          in iOS Settings; features that depend on a declined permission may be unavailable.
        </p>
        <p>
          Deleting an account removes the account-owned FuelWell records covered by the deletion flow.
          Some limited records may be retained when required for security, fraud prevention, or legal
          compliance.
        </p>
      </PublicInfoSection>

      <PublicInfoSection title="Health guidance">
        <p>
          FuelWell provides informational decision support, not medical diagnosis or emergency care.
          Contact a qualified clinician for medical concerns and local emergency services for urgent help.
        </p>
      </PublicInfoSection>

      <PublicInfoSection title="Questions">
        <p>
          Visit the FuelWell Support page for troubleshooting, account help, privacy questions, and the
          in-app support path available from Settings.
        </p>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
