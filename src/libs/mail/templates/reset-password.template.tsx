import {
  Body,
  Button,
  Container,
  Heading,
  Hr,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Html } from "@react-email/html";
import * as React from "react";

interface ResetPasswordTemplateProps {
  domain: string;
  token: string;
}

export function ResetPasswordTemplate({
  domain,
  token,
}: ResetPasswordTemplateProps) {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  return (
    <Html>
      <Preview>Ссылка для сброса пароля (действительна 1 час)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>Poetry</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Сброс пароля</Heading>
            <Text style={paragraph}>
              Вы запросили сброс пароля. Нажмите кнопку ниже, чтобы создать
              новый пароль.
            </Text>

            <Section style={buttonWrap}>
              <Button href={resetLink} style={button}>
                Создать новый пароль
              </Button>
            </Section>

            <Text style={muted}>
              Если кнопка не работает, откройте ссылку в браузере:
            </Text>
            <Link href={resetLink} style={link}>
              {resetLink}
            </Link>

            <Hr style={hr} />
            <Text style={fineprint}>
              Ссылка действительна в течение 1 часа. Если вы не запрашивали
              сброс пароля, просто проигнорируйте это сообщение.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Если у вас есть вопросы, просто ответьте на это письмо.
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
    "linear-gradient(135deg, rgba(236,72,153,1) 0%, rgba(124,58,237,1) 50%, rgba(59,130,246,1) 100%)",
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
