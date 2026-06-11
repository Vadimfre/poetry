import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Найти пользователя по ID
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  // Найти по email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Обновить профиль (имя, аватар)
  async updateProfile(
    userId: number,
    data: { name?: string; avatar?: string },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return user;
  }

  // Обновить email
  async updateEmail(userId: number, newEmail: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Проверить пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Неверный пароль");
    }

    // Проверить, не занят ли email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException("Email уже используется");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    return updatedUser;
  }

  // Обновить пароль
  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Проверить текущий пароль
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Неверный текущий пароль");
    }

    // Проверить что новый пароль отличается
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        "Новый пароль должен отличаться от текущего",
      );
    }

    // Хэшировать новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Пароль успешно изменён" };
  }

  // users.service.ts — никакого импорта LikesService не нужно
  async deleteUser(userId: number) {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      select: { poemId: true },
    });

    await this.prisma.user.delete({
      where: { id: userId },
    });

    await Promise.all(
      likes.map(async (like) => {
        const count = await this.prisma.like.count({
          where: { poemId: like.poemId },
        });
        await this.prisma.poem.update({
          where: { id: like.poemId },
          data: { likesCount: count },
        });
      }),
    );
  }
}
