import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ========== STATS ==========

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getStats() {
    return this.adminService.getStats();
  }

  // ========== POEMS ==========

  @Get('poems')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllPoems() {
    return this.adminService.getAllPoems();
  }

  @Post('poems')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createPoem(
    @Body()
    body: {
      title: string;
      content: string;
      description?: string;
      authorId: number;
      year?: number;
      categoryId: number;
      videoUrl?: string;
    },
  ) {
    return this.adminService.createPoem(body);
  }

  @Put('poems/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updatePoem(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      content?: string;
      description?: string;
      authorId?: number;
      year?: number;
      categoryId?: number;
      videoUrl?: string;
    },
  ) {
    return this.adminService.updatePoem(id, body);
  }

  // ========== AUTHORS ==========

  @Get('authors')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllAuthors() {
    return this.adminService.getAllAuthors();
  }

  @Post('authors')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createAuthor(
    @Body()
    body: {
      name: string;
      bio?: string;
      birthYear?: number;
      deathYear?: number;
      image?: string;
    },
  ) {
    return this.adminService.createAuthor(body);
  }

  @Delete('poems/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deletePoem(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deletePoem(id);
    return { success: true };
  }

  // ========== VIDEO UPLOAD ==========

  @Post('upload/video')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Файл не загружен');
    }
    return {
      videoUrl: `/upload/${file.filename}`,
      filename: file.filename,
    };
  }

  // ========== CATEGORIES ==========

  @Get('categories')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post('categories')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createCategory(
    @Body()
    body: {
      name: string;
      description?: string;
    },
  ) {
    return this.adminService.createCategory(body);
  }

  // ========== USERS (SUPER_ADMIN ONLY) ==========

  @Get('users')
  @Roles('SUPER_ADMIN')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id/role')
  @Roles('SUPER_ADMIN')
  async setUserRole(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: 'USER' | 'ADMIN',
  ) {
    return this.adminService.setUserRole(req.user.email, id, role);
  }

  @Delete('users/:id')
  @Roles('SUPER_ADMIN')
  async deleteUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteUser(req.user.email, id);
    return { success: true };
  }
}
