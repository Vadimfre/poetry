import { MailerOptions } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

export const getMailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.getOrThrow("EMAIL_HOST"),
    port: configService.getOrThrow("EMAIL_PORT"),
    secure: false,
    auth: {
      user: configService.getOrThrow("EMAIL_USER"),
      pass: configService.getOrThrow("EMAIL_PASSWORD"),
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  defaults: {
    from: `"Poetry Team" <${configService.getOrThrow("EMAIL_USER")}>`,
  },
});
