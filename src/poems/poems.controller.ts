import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PoemsService } from './poems.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('poems')
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.poemsService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.poemsService.search(query);
  }

  @Get('authors')
  async getAllAuthors() {
    return this.poemsService.getAllAuthors();
  }

  @Get('authors/:slug')
  async getAuthorBySlug(@Param('slug') slug: string) {
    return this.poemsService.getAuthorBySlug(slug);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.poemsService.findBySlug(slug, userId);
  }

  @Get('category/:categorySlug')
  async findByCategorySlug(@Param('categorySlug') categorySlug: string) {
    return this.poemsService.findByCategorySlug(categorySlug);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.poemsService.findOne(id, userId);
  }
}
