import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("poem/:poemId")
  async create(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      req.user.id,
      poemId,
      createCommentDto.text,
      createCommentDto.parentId,
    );
  }

  @Get("poem/:poemId")
  async findByPoem(@Param("poemId", ParseIntPipe) poemId: number) {
    return this.commentsService.findByPoem(poemId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, req.user.id, updateCommentDto.text);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    return this.commentsService.delete(id, req.user.id);
  }

  @Get("poem/:poemId/count")
  async getCommentCount(@Param("poemId", ParseIntPipe) poemId: number) {
    const count = await this.commentsService.getCommentCount(poemId);
    return { count };
  }
}
