import { PrismaService } from "@/prisma/prisma.service";
import { v4 as uuidv4 } from "uuid";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TokenType, User } from "@prisma/client";
import { ConfirmationDto } from "./dto/confirmation.dto";
import { MailService } from "@/libs/mail/mail.service";
import { UsersService } from "@/users/users.service";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class EmailConfirmationService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async newVerification(req: Request, dto: ConfirmationDto) {
    const existingToken = await this.prismaService.token.findFirst({
      where: {
        token: dto.token,
        type: TokenType.VERIFICATION,
      },
    });

    if (!existingToken) {
      throw new NotFoundException(
        "Токен пацверджання не знойдзены. Калі ласка, пераканайцеся, што ў вас правільны токен.",
      );
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date();

    if (hasExpired) {
      throw new BadRequestException(
        "Тэрмін дзеяння токена пацверджання скончыўся. Калі ласка, запытайце новы токен.",
      );
    }

    const existingUser = await this.userService.findByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      throw new NotFoundException(
        "Карыстальнік не знойдзены. Калі ласка, пераканайцеся, што вы ўвялі правільны email.",
      );
    }

    if (existingUser.isVerified) {
      throw new BadRequestException("Email ужо пацверджаны");
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: existingUser.id },
      data: { isVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    await this.prismaService.token.delete({
      where: { id: existingToken.id },
    });

    const token = this.generateToken(updatedUser.id, updatedUser.email);

    return {
      message: "Email паспяхова пацверджаны. Вы ўвайшлі ў сістэму.",
      token,
      user: updatedUser,
    };
  }

  private generateToken(userId: number, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  public async sendVerificationToken(user: User) {
    const verificationToken = await this.generateVerificationToken(user.email);

    await this.mailService.sendConfirmationMail(
      verificationToken.email,
      verificationToken.token,
    );

    return true;
  }

  public async generateVerificationToken(email: string) {
    const token = uuidv4();

    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 60);

    const existingToken = await this.prismaService.token.findFirst({
      where: {
        email,
        type: TokenType.VERIFICATION,
      },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const verificationToken = await this.prismaService.token.create({
      data: {
        email,
        token,
        expiresIn,
        type: TokenType.VERIFICATION,
      },
    });

    return verificationToken;
  }
}
