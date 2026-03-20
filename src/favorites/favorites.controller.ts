import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':poemId')
  async addToFavorites(
    @Param('poemId', ParseIntPipe) poemId: number,
    @Req() req: any,
  ) {
    return this.favoritesService.addToFavorites(req.user.id, poemId);
  }

  @Delete(':poemId')
  async removeFromFavorites(
    @Param('poemId', ParseIntPipe) poemId: number,
    @Req() req: any,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.id, poemId);
  }

  @Get()
  async getUserFavorites(@Req() req: any) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Get('check/:poemId')
  async checkFavorite(
    @Param('poemId', ParseIntPipe) poemId: number,
    @Req() req: any,
  ) {
    return this.favoritesService.checkFavorite(req.user.id, poemId);
  }
}
