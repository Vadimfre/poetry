import { MailService } from "@/libs/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { UsersService } from "@/users/users.service";
import { v4 as uuidv4 } from "uuid";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TokenType } from "@prisma/client";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { NewPasswordDto } from "./dto/new-password.dto";
import { hash } from "bcrypt";

@Injectable()
export class PasswordRecoveryService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) {}

  public async resetPassword(dto: ResetPasswordDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    
    if (!existingUser) {
      throw new NotFoundException(
        "Пользоваель не найден. Пожалуйста, проверьте правильность введенного email.",
      );
    }

    const passwordResetToken = await this.generatePasswordResetToken(dto.email);

    await this.mailService.sendPasswordResetMail(
      passwordResetToken.email,
      passwordResetToken.token,
    );

    return true;
  }

  public async newPassword(dto: NewPasswordDto, token: string) {
    const existingToken = await this.prismaService.token.findFirst({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
      },
    });

    if (!existingToken) {
      throw new NotFoundException(
        "Токен сброса пароля не найден. Пожалуйста, проверьте правильность введенного токена.",
      );
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();

    if (hasExpired) {
      throw new BadRequestException(
        "Токен истек. Пожалуйста запросите новый токен для сброса пароля.",
      );
    }

    const existingUser = await this.userService.findByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      throw new NotFoundException(
        "Пользователь не найден. Пожалуйста убедитесь, что вы ввели правильный email.",
      );
    }

    await this.prismaService.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        password: await hash(dto.password, 10),
      },
    });

    await this.prismaService.token.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  public async generatePasswordResetToken(email: string) {
    const token = uuidv4();

    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 60);

    const existingToken = await this.prismaService.token.findFirst({
      where: {
        email,
        type: TokenType.PASSWORD_RESET,
      },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const passwordResetToken = await this.prismaService.token.create({
      data: {
        email,
        token,
        expiresIn,
        type: TokenType.PASSWORD_RESET,
      },
    });

    return passwordResetToken;
  }
}
