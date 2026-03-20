import { Body, Heading, Text, Link } from "@react-email/components";
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
      <Body>
        <Heading>Подтверждение почты</Heading>
        <Text>Для подтверждения почты перейдите по ссылке: {confirmLink}</Text>
        {/* <Link href={confirmLink}>Подтвердить почту</Link> */}
        <Text>
          Эта ссылка действительна в течение 1 часа. Если вы не запрашивали
          подтверждение почты, проигнорируйте данное письмо.
        </Text>
        <Text>Спасибо, что пользуетесь нашим сервисом.</Text>
      </Body>
    </Html>
  );
}
