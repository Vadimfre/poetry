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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: { poemId: number; text: string }) {
    return this.commentsService.create(req.user.id, body.poemId, body.text);
  }

  @Get('poem/:poemId')
  async findByPoem(@Param('poemId', ParseIntPipe) poemId: number) {
    return this.commentsService.findByPoem(poemId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: { text: string },
  ) {
    return this.commentsService.update(id, req.user.id, body.text);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.commentsService.delete(id, req.user.id);
  }
}
