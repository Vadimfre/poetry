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
}
