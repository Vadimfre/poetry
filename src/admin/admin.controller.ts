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
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ========== STATS ==========

  @Get("stats")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getStats() {
    return this.adminService.getStats();
  }

  // ========== POEMS ==========

  @Get("poems")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getAllPoems() {
    return this.adminService.getAllPoems();
  }

  @Get("poems/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getPoemById(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.getPoemById(id);
  }

  @Post("poems")
  @Roles("ADMIN", "SUPER_ADMIN")
  async createPoem(
    @Body()
    body: {
      title?: string;
      content?: string;
      description?: string;
      authorId: number;
      year?: number;
      categoryId: number;
      videoUrl?: string;
      i18n?: Record<string, Record<string, string>>;
      schoolGrades?: { grade: number; kind: string }[];
    },
  ) {
    return this.adminService.createPoem(body as any);
  }

  @Put("poems/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async updatePoem(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      title?: string;
      content?: string;
      description?: string;
      authorId?: number;
      year?: number;
      categoryId?: number;
      videoUrl?: string;
      i18n?: Record<string, Record<string, string>>;
      schoolGrades?: { grade: number; kind: string }[];
    },
  ) {
    return this.adminService.updatePoem(id, body as any);
  }

  // ========== AUTHORS ==========

  @Get("authors")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getAllAuthors() {
    return this.adminService.getAllAuthors();
  }

  @Post("authors")
  @Roles("ADMIN", "SUPER_ADMIN")
  async createAuthor(
    @Body()
    body: {
      name?: string;
      bio?: string;
      birthYear?: number;
      deathYear?: number;
      image?: string;
      i18n?: Record<string, Record<string, string>>;
    },
  ) {
    return this.adminService.createAuthor(body);
  }

  @Put("authors/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async updateAuthor(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      bio?: string;
      birthYear?: number;
      deathYear?: number;
      image?: string;
      i18n?: Record<string, Record<string, string>>;
    },
  ) {
    return this.adminService.updateAuthor(id, body);
  }

  @Delete("authors/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async deleteAuthor(@Param("id", ParseIntPipe) id: number) {
    await this.adminService.deleteAuthor(id);
    return { success: true };
  }

  @Delete("poems/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async deletePoem(@Param("id", ParseIntPipe) id: number) {
    await this.adminService.deletePoem(id);
    return { success: true };
  }

  // ========== VIDEO UPLOAD ==========

  @Post("upload/video")
  @Roles("ADMIN", "SUPER_ADMIN")
  @UseInterceptors(FileInterceptor("video"))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error("Файл не загружен");
    }
    return {
      videoUrl: `/upload/${file.filename}`,
      filename: file.filename,
    };
  }

  // ========== CATEGORIES ==========

  @Get("categories")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getAllCategories() {
    return this.adminService.getAllCategories();
  }

  @Post("categories")
  @Roles("ADMIN", "SUPER_ADMIN")
  async createCategory(
    @Body()
    body: {
      name?: string;
      description?: string;
      i18n?: Record<string, Record<string, string>>;
    },
  ) {
    return this.adminService.createCategory(body);
  }

  @Put("categories/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      description?: string;
      i18n?: Record<string, Record<string, string>>;
    },
  ) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete("categories/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async deleteCategory(@Param("id", ParseIntPipe) id: number) {
    await this.adminService.deleteCategory(id);
    return { success: true };
  }

  // ========== COMMENTS ==========

  @Get("comments")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getAllComments(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("userId") userId?: string,
    @Query("poemId") poemId?: string,
  ) {
    return this.adminService.getAllComments(
      parseInt(page),
      parseInt(limit),
      userId ? parseInt(userId) : undefined,
      poemId ? parseInt(poemId) : undefined,
    );
  }

  @Get("comments/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getCommentById(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.getCommentById(id);
  }

  @Put("comments/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async updateComment(
    @Param("id", ParseIntPipe) id: number,
    @Body("text") text: string,
  ) {
    return this.adminService.updateComment(id, text);
  }

  @Delete("comments/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async deleteComment(@Param("id", ParseIntPipe) id: number) {
    await this.adminService.deleteComment(id);
    return { success: true };
  }

  @Post("comments/bulk-delete")
  @Roles("ADMIN", "SUPER_ADMIN")
  async bulkDeleteComments(@Body("ids") ids: number[]) {
    const result = await this.adminService.bulkDeleteComments(ids);
    return { success: true, deletedCount: result.deletedCount };
  }

  // ========== LIKES ==========

  @Get("likes")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getAllLikes(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("userId") userId?: string,
    @Query("poemId") poemId?: string,
  ) {
    return this.adminService.getAllLikes(
      parseInt(page),
      parseInt(limit),
      userId ? parseInt(userId) : undefined,
      poemId ? parseInt(poemId) : undefined,
    );
  }

  @Get("likes/statistics")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getLikesStatistics() {
    return this.adminService.getLikesStatistics();
  }

  @Delete("likes/:id")
  @Roles("ADMIN", "SUPER_ADMIN")
  async deleteLike(@Param("id", ParseIntPipe) id: number) {
    await this.adminService.deleteLike(id);
    return { success: true };
  }

  // ========== VIEWS ==========

  @Get("views")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getAllViews(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Query("poemId") poemId?: string,
  ) {
    return this.adminService.getAllViews(
      parseInt(page),
      parseInt(limit),
      poemId ? parseInt(poemId) : undefined,
    );
  }

  @Get("views/analytics")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getViewsAnalytics() {
    return this.adminService.getViewsAnalytics();
  }

  @Delete("views/reset")
  @Roles("ADMIN", "SUPER_ADMIN")
  async resetAllViews() {
    return this.adminService.resetAllViews();
  }

  @Get("views/poem/:poemId")
  @Roles("ADMIN", "SUPER_ADMIN")
  async getViewsByPoem(@Param("poemId", ParseIntPipe) poemId: number) {
    return this.adminService.getViewsByPoem(poemId);
  }

  // ========== USERS (SUPER_ADMIN ONLY) ==========

  @Get("users")
  @Roles("SUPER_ADMIN")
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put("users/:id/role")
  @Roles("SUPER_ADMIN")
  async setUserRole(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
    @Body("role") role: "USER" | "ADMIN",
  ) {
    return this.adminService.setUserRole(req.user.email, id, role);
  }

  @Delete("users/:id")
  @Roles("SUPER_ADMIN")
  async deleteUser(@Request() req, @Param("id", ParseIntPipe) id: number) {
    await this.adminService.deleteUser(req.user.email, id);
    return { success: true };
  }
}
