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
    const html = await render(ConfirmationTemplate({ domain, token }));

    return this.sendMail(email, "Подтверждение почты", html);
  }

  public async sendPasswordResetMail(email: string, token: string) {
    const domain = this.configService.getOrThrow("FRONTEND_URL");
    const html = await render(ResetPasswordTemplate({ domain, token }));

    return this.sendMail(email, "Сброс пароля", html);
  }

  public async sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
