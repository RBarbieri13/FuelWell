import { Resend } from "resend";

type WelcomeEmailArgs = {
  firstName: string;
  email: string;
};

function getFromAddress(): string {
  return process.env.FOUNDERS_EMAIL_FROM ?? "FuelWell <hello@fuelwellhealth.com>";
}

function getReplyTo(): string | undefined {
  return process.env.FOUNDERS_EMAIL_REPLY_TO ?? undefined;
}

export function buildFoundersWelcomeEmail({ firstName }: { firstName: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Welcome to the FuelWell Founders 100!";
  const safeName = escapeHtml(firstName);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2933;line-height:1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f7f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <p style="margin:0 0 16px 0;font-size:16px;">Hi ${safeName},</p>
                <p style="margin:0 0 16px 0;font-size:16px;">
                  I&rsquo;m so excited you&rsquo;ve agreed to join our pilot group! Thank you for your support as we
                  get ready to launch. Your feedback is going to be incredibly valuable in shaping the future of
                  FuelWell. If you haven&rsquo;t seen it yet, check out our website:
                  <a href="https://fuelwellhealth.com/" style="color:#0f766e;text-decoration:underline;">https://fuelwellhealth.com/</a>
                </p>

                <h2 style="margin:24px 0 8px 0;font-size:20px;color:#0f172a;">The Pilot Launch</h2>
                <p style="margin:0 0 16px 0;font-size:16px;">
                  We are on track for a launch in early May 2026. You can expect one more email from me in the
                  upcoming weeks with detailed instructions on how to download the app and set up your profile.
                </p>

                <h2 style="margin:24px 0 8px 0;font-size:20px;color:#0f172a;">What to Expect from FuelWell</h2>
                <p style="margin:0 0 12px 0;font-size:16px;">
                  FuelWell is designed to be a real-time decision coach rather than a traditional tracking app.
                  Key features you&rsquo;ll be testing include:
                </p>
                <ul style="margin:0 0 16px 20px;padding:0;font-size:16px;">
                  <li style="margin-bottom:8px;"><strong>24/7 AI Health Coach:</strong> Provides reactive and contextual guidance to help you decide what to eat or how to adjust your day in real time.</li>
                  <li style="margin-bottom:8px;"><strong>Dynamic Nutrition:</strong> Macro targets that can adapt based on your progress and daily behavior.</li>
                  <li style="margin-bottom:8px;"><strong>Intelligent Logging:</strong> Fast meal logging via photo recognition, search, or barcode scanning to reduce daily friction.</li>
                  <li style="margin-bottom:8px;"><strong>Real-World Guidance:</strong> Practical advice for eating at restaurants, including menu analysis and healthy choice indicators.</li>
                  <li style="margin-bottom:8px;"><strong>Adaptive Workouts:</strong> Personalized training sessions that adjust based on your soreness, energy levels, and available time.</li>
                </ul>

                <h2 style="margin:24px 0 8px 0;font-size:20px;color:#0f172a;">What We&rsquo;re Looking For</h2>
                <p style="margin:0 0 12px 0;font-size:16px;">
                  As part of this pilot, we are looking for your honest feedback on:
                </p>
                <ul style="margin:0 0 16px 20px;padding:0;font-size:16px;">
                  <li style="margin-bottom:8px;"><strong>Usability:</strong> Is the app intuitive and fast enough to use during a busy day?</li>
                  <li style="margin-bottom:8px;"><strong>Coaching Quality:</strong> Do the AI&rsquo;s suggestions feel personal, relevant, and supportive of your health goals?</li>
                  <li style="margin-bottom:8px;"><strong>Consistency:</strong> Does the app help you stay on track during difficult times, like weekends or social events?</li>
                </ul>
                <p style="margin:0 0 16px 0;font-size:16px;">
                  We&rsquo;ll be collecting feedback through a few short surveys sent through the duration of the
                  Pilot, most likely one per week, with a total of 3.
                </p>

                <p style="margin:0 0 16px 0;font-size:16px;">
                  I&rsquo;m incredibly excited to get this into your hands, and start building FuelWell alongside
                  you. If you wouldn&rsquo;t mind, please confirm receipt by replying that you got the email!
                </p>

                <p style="margin:24px 0 4px 0;font-size:16px;">Best,</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px 40px;">
                <p style="margin:0;font-size:12px;color:#64748b;">
                  You&rsquo;re receiving this email because you signed up for the FuelWell Founders 100 pilot at
                  <a href="https://fuelwellhealth.com/" style="color:#64748b;text-decoration:underline;">fuelwellhealth.com</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Hi ${firstName},

I'm so excited you've agreed to join our pilot group! Thank you for your support as we get ready to launch. Your feedback is going to be incredibly valuable in shaping the future of FuelWell. If you haven't seen it yet, check out our website:
https://fuelwellhealth.com/

The Pilot Launch

We are on track for a launch in early May 2026. You can expect one more email from me in the upcoming weeks with detailed instructions on how to download the app and set up your profile.

What to Expect from FuelWell

FuelWell is designed to be a real-time decision coach rather than a traditional tracking app. Key features you'll be testing include:
- 24/7 AI Health Coach: Provides reactive and contextual guidance to help you decide what to eat or how to adjust your day in real time.
- Dynamic Nutrition: Macro targets that can adapt based on your progress and daily behavior.
- Intelligent Logging: Fast meal logging via photo recognition, search, or barcode scanning to reduce daily friction.
- Real-World Guidance: Practical advice for eating at restaurants, including menu analysis and healthy choice indicators.
- Adaptive Workouts: Personalized training sessions that adjust based on your soreness, energy levels, and available time.

What We're Looking For

As part of this pilot, we are looking for your honest feedback on:
- Usability: Is the app intuitive and fast enough to use during a busy day?
- Coaching Quality: Do the AI's suggestions feel personal, relevant, and supportive of your health goals?
- Consistency: Does the app help you stay on track during difficult times, like weekends or social events?

We'll be collecting feedback through a few short surveys sent through the duration of the Pilot, most likely one per week, with a total of 3.

I'm incredibly excited to get this into your hands, and start building FuelWell alongside you. If you wouldn't mind, please confirm receipt by replying that you got the email!

Best,
`;

  return { subject, html, text };
}

export async function sendFoundersWelcomeEmail({
  firstName,
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
  const { subject, html, text } = buildFoundersWelcomeEmail({ firstName });

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: email,
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
