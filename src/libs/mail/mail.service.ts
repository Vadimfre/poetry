import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { render } from "@react-email/render";
import { ConfirmationTemplate } from "./templates/confirmation.template";
import { ResetPasswordTemplate } from "./templates/reset-password.template";

@Injectable()
export class MailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendConfirmationMail(email: string, token: string) {
    const domain = this.configService.getOrThrow("FRONTEND_URL");
    const template = ConfirmationTemplate({ domain, token });
    const html = await render(template);
    const text = await render(template, { plainText: true });

    return this.sendMail(email, "Подтверждение почты", html, text);
  }

  public async sendPasswordResetMail(email: string, token: string) {
    const domain = this.configService.getOrThrow("FRONTEND_URL");
    const template = ResetPasswordTemplate({ domain, token });
    const html = await render(template);
    const text = await render(template, { plainText: true });

    return this.sendMail(email, "Сброс пароля", html, text);
  }

  public async sendMail(
    email: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
      text,
    });
  }
}
