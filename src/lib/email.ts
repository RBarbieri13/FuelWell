import { Resend } from "resend";
import { render } from "@react-email/components";
import { createElement } from "react";
import { Founders100WelcomeEmail } from "@/emails/founders-100-welcome";

const FROM = "Max Laureano <max@fuelwellhealth.com>";
const REPLY_TO = "max@fuelwellhealth.com";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendFounders100WelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName?: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const resend = getResend();
  if (!resend) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const plainText = buildPlainText(firstName);

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: "Welcome to the FuelWell Founders 100",
      react: createElement(Founders100WelcomeEmail, { firstName }),
      text: plainText,
      html: await render(createElement(Founders100WelcomeEmail, { firstName })),
    });

    if (error) {
      return { sent: false, reason: error.message };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { sent: false, reason: message };
  }
}

function buildPlainText(firstName?: string | null): string {
  const greeting = firstName ? `Hello ${firstName},` : "Hello,";
  return `${greeting}

Thank you for joining FuelWell! We really appreciate you signing up for the FuelWell Founders 100. It means a lot to have you involved this early.

We're currently kicking off a small pilot group in early May to test, break, and improve everything before opening things up more broadly. That group is helping us make sure what we're building actually works the way it's supposed to.

The plan is to open up the Founders 100 shortly after, with a target launch of June 30th.

When that opens up, you'll be one of the first to:

  - Get full access to the app
  - Lock in discounted pricing (50% off) for life
  - Have a direct hand in shaping how we build and improve it

More than anything, this group is important to us because we're not trying to build just another tracking app. The whole goal with FuelWell is to help people make better decisions throughout the day — the moments where consistency usually breaks down.

Between now and launch, we'll keep you in the loop with updates, previews, and ways to get involved if you want to.

If you have any questions, ideas, or just want to talk through what we're building, feel free to reply directly to this — we'd love to hear from you.

Really appreciate the support.


Max Laureano
CEO and Founder
FuelWell Health
max@fuelwellhealth.com | 320-459-7934
`;
}
