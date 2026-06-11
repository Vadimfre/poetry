import {
  Body,
  Container,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

interface ConfirmationTemplateProps {
  domain: string;
  token: string;
}

export function ConfirmationTemplate({
  domain,
  token,
}: ConfirmationTemplateProps) {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  return (
    <Html>
      <Preview>Пацвердзіце пошту, каб завяршыць рэгістрацыю ў Poetry</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>Poetry</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Пацверджанне пошты</Heading>
            <Text style={paragraph}>
              Націсніце кнопку ніжэй, каб пацвердзіць email і завяршыць уваход у
              сістэму.
            </Text>

            <Section style={buttonWrap}>
              <Button href={confirmLink} style={button}>
                Пацвердзіць пошту
              </Button>
            </Section>

            <Text style={muted}>
              Калі кнопка не працуе, адкрыйце спасылку ў браўзеры:
            </Text>
            <Link href={confirmLink} style={link}>
              {confirmLink}
            </Link>

            {/* <Link href={confirmLink}>Подтвердить почту</Link> */}

            <Hr style={hr} />
            <Text style={fineprint}>
              Спасылка дзейнічае цягам 1 гадзіны. Калі вы не запытвалі
              пацверджанне пошты, проста праігнаруйце гэты ліст.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              З павагай,
              <br />
              каманда Poetry
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#a9a9d4",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  padding: "24px 12px",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
};

const header: React.CSSProperties = {
  padding: "18px 22px",
  background:
    "linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(59,130,246,1) 55%, rgba(16,185,129,1) 100%)",
};

const brand: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: 700,
  letterSpacing: "0.2px",
};

const content: React.CSSProperties = {
  padding: "26px 22px 10px",
};

const h1: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "22px",
  lineHeight: "28px",
  color: "#0f172a",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 18px",
  fontSize: "14px",
  lineHeight: "22px",
  color: "#334155",
};

const buttonWrap: React.CSSProperties = {
  padding: "8px 0 18px",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#111827",
  borderRadius: "12px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
  padding: "12px 16px",
};

const muted: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  lineHeight: "18px",
  color: "#64748b",
};

const link: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "18px",
  color: "#2563eb",
  wordBreak: "break-all",
};

const hr: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "20px 0 12px",
};

const fineprint: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "12px",
  lineHeight: "18px",
  color: "#64748b",
};

const footer: React.CSSProperties = {
  padding: "0 22px 22px",
};

const footerText: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "18px",
  color: "#64748b",
};
