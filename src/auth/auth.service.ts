import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { EmailConfirmationService } from "./email-confirmation/email-confirmation.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Пользователь с таким email уже существует");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name || dto.email.split("@")[0],
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    await this.emailConfirmationService.sendVerificationToken(user);

    return {
      message:
        "Вы успешно зарегистрировались. Пожалуйста, проверьте свою почту и подтвердите свой аккаунт.",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Неверные учетные данные");;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Неверные учетные данные");
    }

    if (!user.isVerified) {
      await this.emailConfirmationService.sendVerificationToken(user);
      throw new UnauthorizedException(
        "Ваш email не подтвержден. Пожалуйста, проверьте свою почту и подтвердите свой аккаунт.",
      );
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      message: "Вход выполнен успешно",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException("Пользователь не найден");
    }

    return user;
  }

  private generateToken(userId: number, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
