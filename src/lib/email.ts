import { Resend } from "resend";

type WelcomeEmailArgs = {
  email: string;
};

function getFromAddress(): string {
  return (
    process.env.FOUNDERS_EMAIL_FROM ??
    "Max Laureano <max@fuelwellhealth.com>"
  );
}

function getReplyTo(): string | undefined {
  return process.env.FOUNDERS_EMAIL_REPLY_TO ?? "max@fuelwellhealth.com";
}

const DEFAULT_FOUNDERS_CC = [
  "Max@FuelWellHealth.com",
  "Robby@FuelWellHealth.com",
];

function getCcAddresses(): string[] {
  const raw = process.env.FOUNDERS_EMAIL_CC;
  if (!raw) return DEFAULT_FOUNDERS_CC;
  return raw
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

export function buildFoundersWelcomeEmail(): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Welcome to the FuelWell Founders 100";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#202124;line-height:1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;padding:24px 16px;">
      <tr>
        <td align="left">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;">
            <tr>
              <td style="padding:0 8px;font-size:14px;color:#202124;">
                <p style="margin:0 0 14px 0;">Hello,</p>

                <p style="margin:0 0 14px 0;">
                  Thank you for joining FuelWell! We really appreciate you signing up for the FuelWell Founders
                  100. It means a lot to have you involved this early.
                </p>

                <p style="margin:0 0 14px 0;">
                  We&rsquo;re currently kicking off a small pilot group in early May to test, break, and improve
                  everything before opening things up more broadly. That group is helping us make sure what
                  we&rsquo;re building actually works the way it&rsquo;s supposed to.
                </p>

                <p style="margin:0 0 14px 0;">
                  The plan is to open up the Founders 100 shortly after, with a target launch of
                  <strong>June 30th.</strong>
                </p>

                <p style="margin:0 0 8px 0;">When that opens up, you&rsquo;ll be one of the first to:</p>
                <ul style="margin:0 0 14px 24px;padding:0;">
                  <li style="margin-bottom:4px;">get full access to the app</li>
                  <li style="margin-bottom:4px;">lock in discounted pricing (50 percent off) for life</li>
                  <li style="margin-bottom:4px;">have a direct hand in shaping how we build and improve it</li>
                </ul>

                <p style="margin:0 0 14px 0;">
                  More than anything, this group is important to us because we&rsquo;re not trying to build just
                  another tracking app. The whole goal with FuelWell is to help people make better decisions
                  throughout the day &mdash; the moments where consistency usually breaks down.
                </p>

                <p style="margin:0 0 14px 0;">
                  Between now and launch, we&rsquo;ll keep you in the loop with updates, previews, and ways to
                  get involved if you want to.
                </p>

                <p style="margin:0 0 14px 0;">
                  If you have any questions, ideas, or just want to talk through what we&rsquo;re building, feel
                  free to reply directly to this &mdash; We&rsquo;d love to hear from you.
                </p>

                <p style="margin:0 0 28px 0;">Really appreciate the support.</p>

                <p style="margin:0 0 2px 0;color:#9aa0a6;font-size:13px;"><strong>Max Laureano</strong></p>
                <p style="margin:0 0 2px 0;color:#9aa0a6;font-size:13px;">CEO and Founder</p>
                <p style="margin:0 0 2px 0;color:#9aa0a6;font-size:13px;">FuelWell Health</p>
                <p style="margin:0 0 14px 0;color:#9aa0a6;font-size:13px;">
                  <a href="mailto:max@fuelwellhealth.com" style="color:#1a73e8;text-decoration:underline;">max@fuelwellhealth.com</a>
                  | 320-459-7934
                </p>
                <p style="margin:0;">
                  <a href="https://fuelwellhealth.com/" style="text-decoration:none;">
                    <img
                      src="https://fuelwellhealth.com/fuelwell-logo-full.png"
                      alt="FuelWell Health"
                      width="110"
                      style="display:block;width:110px;max-width:110px;height:auto;border:0;outline:none;"
                    />
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Hello,

Thank you for joining FuelWell! We really appreciate you signing up for the FuelWell Founders 100. It means a lot to have you involved this early.

We're currently kicking off a small pilot group in early May to test, break, and improve everything before opening things up more broadly. That group is helping us make sure what we're building actually works the way it's supposed to.

The plan is to open up the Founders 100 shortly after, with a target launch of June 30th.

When that opens up, you'll be one of the first to:
- get full access to the app
- lock in discounted pricing (50 percent off) for life
- have a direct hand in shaping how we build and improve it

More than anything, this group is important to us because we're not trying to build just another tracking app. The whole goal with FuelWell is to help people make better decisions throughout the day — the moments where consistency usually breaks down.

Between now and launch, we'll keep you in the loop with updates, previews, and ways to get involved if you want to.

If you have any questions, ideas, or just want to talk through what we're building, feel free to reply directly to this — We'd love to hear from you.

Really appreciate the support.


Max Laureano
CEO and Founder
FuelWell Health
max@fuelwellhealth.com | 320-459-7934
`;

  return { subject, html, text };
}

export async function sendFoundersWelcomeEmail({
  email,
}: WelcomeEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "RESEND_API_KEY is not set; skipping Founders 100 welcome email to",
      email,
    );
    return;
  }

  const resend = new Resend(apiKey);
  const { subject, html, text } = buildFoundersWelcomeEmail();

  const cc = getCcAddresses().filter(
    (address) => address.toLowerCase() !== email.toLowerCase(),
  );

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: email,
    cc: cc.length > 0 ? cc : undefined,
    replyTo: getReplyTo(),
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(
      `Resend failed to send welcome email: ${error.name ?? "unknown"} — ${error.message ?? ""}`,
    );
  }
}
