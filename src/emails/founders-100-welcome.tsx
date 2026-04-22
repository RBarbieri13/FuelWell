import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Founders100WelcomeProps = {
  firstName?: string | null;
};

const colors = {
  background: "#FAFBFE",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F1117",
  textMuted: "#475569",
  accent: "#34D399",
  accentSoft: "#ECFDF5",
};

const fontStack =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function Founders100WelcomeEmail({ firstName }: Founders100WelcomeProps) {
  const greeting = firstName ? `Hello ${firstName},` : "Hello,";

  return (
    <Html>
      <Head />
      <Preview>Welcome to the FuelWell Founders 100 — here&apos;s what happens next.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading as="h1" style={brandStyle}>
              FuelWell
            </Heading>
            <Text style={brandTaglineStyle}>Founders 100</Text>
          </Section>

          <Section style={cardStyle}>
            <Text style={greetingStyle}>{greeting}</Text>

            <Text style={paragraphStyle}>
              Thank you for joining FuelWell! We really appreciate you signing up for the
              FuelWell Founders 100. It means a lot to have you involved this early.
            </Text>

            <Text style={paragraphStyle}>
              We&apos;re currently kicking off a small pilot group in early May to test,
              break, and improve everything before opening things up more broadly. That
              group is helping us make sure what we&apos;re building actually works the way
              it&apos;s supposed to.
            </Text>

            <Text style={paragraphStyle}>
              The plan is to open up the Founders 100 shortly after, with a target launch
              of <strong style={strongStyle}>June 30th</strong>.
            </Text>

            <Text style={paragraphStyle}>
              When that opens up, you&apos;ll be one of the first to:
            </Text>

            <Section style={listStyle}>
              <Text style={listItemStyle}>
                <span style={bulletStyle}>•</span> Get full access to the app
              </Text>
              <Text style={listItemStyle}>
                <span style={bulletStyle}>•</span> Lock in discounted pricing (50% off)
                for life
              </Text>
              <Text style={listItemStyle}>
                <span style={bulletStyle}>•</span> Have a direct hand in shaping how we
                build and improve it
              </Text>
            </Section>

            <Text style={paragraphStyle}>
              More than anything, this group is important to us because we&apos;re not
              trying to build just another tracking app. The whole goal with FuelWell is
              to help people make better decisions throughout the day — the moments where
              consistency usually breaks down.
            </Text>

            <Text style={paragraphStyle}>
              Between now and launch, we&apos;ll keep you in the loop with updates,
              previews, and ways to get involved if you want to.
            </Text>

            <Text style={paragraphStyle}>
              If you have any questions, ideas, or just want to talk through what
              we&apos;re building, feel free to reply directly to this — we&apos;d love to
              hear from you.
            </Text>

            <Text style={paragraphStyle}>Really appreciate the support.</Text>

            <Hr style={hrStyle} />

            <Section style={signatureStyle}>
              <Text style={signatureNameStyle}>Max Laureano</Text>
              <Text style={signatureTitleStyle}>CEO and Founder</Text>
              <Text style={signatureTitleStyle}>FuelWell Health</Text>
              <Text style={signatureContactStyle}>
                <Link href="mailto:max@fuelwellhealth.com" style={linkStyle}>
                  max@fuelwellhealth.com
                </Link>
                {" | "}
                <Link href="tel:+13204597934" style={linkStyle}>
                  320-459-7934
                </Link>
              </Text>
            </Section>
          </Section>

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              You received this because you signed up for the FuelWell Founders 100 at{" "}
              <Link href="https://fuelwellhealth.com" style={footerLinkStyle}>
                fuelwellhealth.com
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default Founders100WelcomeEmail;

const bodyStyle: React.CSSProperties = {
  backgroundColor: colors.background,
  fontFamily: fontStack,
  margin: 0,
  padding: "32px 0",
  color: colors.textPrimary,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "0 16px",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "8px 0 24px",
};

const brandStyle: React.CSSProperties = {
  color: colors.accent,
  fontSize: "28px",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  margin: 0,
};

const brandTaglineStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: "13px",
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "4px 0 0",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "32px 28px",
  boxShadow: "0 1px 2px rgba(15, 17, 23, 0.04)",
};

const greetingStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: colors.textPrimary,
  margin: "0 0 16px",
};

const paragraphStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.65,
  color: colors.textPrimary,
  margin: "0 0 16px",
};

const strongStyle: React.CSSProperties = {
  color: colors.textPrimary,
  fontWeight: 700,
};

const listStyle: React.CSSProperties = {
  backgroundColor: colors.accentSoft,
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "0 0 20px",
};

const listItemStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: colors.textPrimary,
  margin: "6px 0",
};

const bulletStyle: React.CSSProperties = {
  color: colors.accent,
  fontWeight: 700,
  marginRight: "8px",
};

const hrStyle: React.CSSProperties = {
  borderColor: colors.border,
  margin: "24px 0 20px",
};

const signatureStyle: React.CSSProperties = {
  margin: 0,
};

const signatureNameStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: colors.textPrimary,
  margin: "0 0 2px",
};

const signatureTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "0 0 2px",
};

const signatureContactStyle: React.CSSProperties = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "8px 0 0",
};

const linkStyle: React.CSSProperties = {
  color: colors.accent,
  textDecoration: "none",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "24px 16px 8px",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: colors.textMuted,
  margin: 0,
  lineHeight: 1.5,
};

const footerLinkStyle: React.CSSProperties = {
  color: colors.textMuted,
  textDecoration: "underline",
};
