import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from "@nestjs/common";
import { LikesService } from "./likes.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";

@Controller("likes")
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(":poemId/toggle")
  async toggleLike(
    @Req() req: any,
    @Param("poemId", ParseIntPipe) poemId: number,
  ) {
    return this.likesService.toggleLike(req.user.id, poemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":poemId/me")
  async isLikedByUser(
    @Req() req: any,
    @Param("poemId", ParseIntPipe) poemId: number,
  ) {
    return this.likesService.isLikedByUser(req.user.id, poemId);
  }

  @Get(":poemId/count")
  async getLikesCount(@Param("poemId", ParseIntPipe) poemId: number) {
    return this.likesService.getLikesCount(poemId);
  }

  async removeLike(
    @Req() req: any,
    @Param("poemId", ParseIntPipe) poemId: number,
  ) {
    return this.likesService.removeLike(req.user.id, poemId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @Post("recalculate-all")
  async recalculateAll() {
    return this.likesService.recalculateAllLikesCounts();
  }
}
