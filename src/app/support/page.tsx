import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import {
  PublicInfoPage,
  PublicInfoSection,
} from "@/components/marketing/public-info-page";

export const metadata: Metadata = {
  title: "Support | FuelWell",
  description: "FuelWell account help, troubleshooting, privacy support, and issue-reporting guidance.",
};

const actionClass =
  "fw-press inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary-50 px-4 py-2 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600";

export default function SupportPage() {
  return (
    <PublicInfoPage
      eyebrow="Support"
      title="Get back to the next useful decision."
      description="Start with the quickest route below for account, Coach, logging, privacy, or access problems."
      icon={HelpCircle}
    >
      <PublicInfoSection title="Account and sign-in">
        <p>
          Confirm that you are using the same email or social sign-in provider used to create the account.
          If a sign-in session expires, close and reopen FuelWell, then sign in again.
        </p>
        <Link href="/login" className={actionClass}>Open sign in</Link>
      </PublicInfoSection>

      <PublicInfoSection title="Meals, workouts, and saved changes">
        <p>
          Signed-in changes should follow your account across screens and devices. If a new meal, workout,
          grocery item, or profile change is missing after refresh, do not enter it repeatedly. Note the
          approximate time, the screen, and the action so the record can be reviewed.
        </p>
        <Link href="/app/daily-review" className={actionClass}>Review today&apos;s data</Link>
      </PublicInfoSection>

      <PublicInfoSection title="Coach and attachments">
        <p>
          For a failed Coach request, retry once after checking your connection. For an attachment, include
          only the pages or image needed for the question and remove unrelated personal information first.
          FuelWell will show an actionable unavailable state instead of a raw provider error.
        </p>
        <Link href="/app/coach" className={actionClass}>Open Coach</Link>
      </PublicInfoSection>

      <PublicInfoSection title="Report a problem or request a data review">
        <p>
          Open Settings, choose Support, and include the app version, iPhone model, what you expected,
          what happened, and the steps that reproduce it. Screenshots help, but never include a password,
          verification code, or payment information.
        </p>
        <Link href="/app/settings#support" className={actionClass}>Open support settings</Link>
      </PublicInfoSection>

      <PublicInfoSection title="Privacy and account deletion">
        <p>
          Review the public Privacy page before sharing health data or attachments. Signed-in users can
          export their data or start permanent account deletion from Settings.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/privacy" className={actionClass}>Read privacy policy</Link>
          <Link href="/app/settings#privacy" className={actionClass}>Open privacy settings</Link>
        </div>
      </PublicInfoSection>
    </PublicInfoPage>
  );
}
