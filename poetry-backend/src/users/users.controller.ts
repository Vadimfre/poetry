import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
  Delete,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Получить текущего пользователя
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getCurrentUser(@Req() req: any) {
    return this.usersService.findById(req.user.id);
  }

  // Получить пользователя по ID
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async getUser(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // Обновить профиль (имя, аватар)
  @UseGuards(JwtAuthGuard)
  @Put("profile")
  async updateProfile(
    @Req() req: any,
    @Body() data: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, data);
  }

  // Обновить email
  @UseGuards(JwtAuthGuard)
  @Put("email")
  async updateEmail(
    @Req() req: any,
    @Body() data: { email: string; password: string },
  ) {
    if (!data.email || !data.password) {
      throw new BadRequestException("Email and password are required");
    }
    return this.usersService.updateEmail(
      req.user.id,
      data.email,
      data.password,
    );
  }

  // Обновить пароль
  @UseGuards(JwtAuthGuard)
  @Put("password")
  async updatePassword(
    @Req() req: any,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    if (!data.currentPassword || !data.newPassword) {
      throw new BadRequestException("Current and new passwords are required");
    }
    return this.usersService.updatePassword(
      req.user.id,
      data.currentPassword,
      data.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete("me")
  async deleteAccount(@Req() req: any) {
    return this.usersService.deleteUser(req.user.id);
  }
}
