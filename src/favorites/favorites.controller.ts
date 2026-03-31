import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import { FavoritesService } from "./favorites.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  FavoriteResponseDto,
  ToggleFavoriteResponseDto,
} from "./dto/favorite-response.dto";

@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Post("poem/:poemId/toggle")
  async toggleFavorite(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
  ): Promise<ToggleFavoriteResponseDto> {
    const userId = req.user.id;
    return this.favoritesService.toggleFavorite(userId, poemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("poem/:poemId/status")
  async getFavoriteStatus(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
  ): Promise<{ isFavorite: boolean }> {
    const userId = req.user.id;
    const isFavorite = await this.favoritesService.isFavorite(userId, poemId);
    return { isFavorite };
  }

  @UseGuards(JwtAuthGuard)
  @Get("my")
  async getMyFavorites(@Req() req: any): Promise<FavoriteResponseDto[]> {
    const userId = req.user.id;
    return this.favoritesService.getUserFavorites(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("poem/:poemId")
  async removeFavorite(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    return this.favoritesService.removeFavorite(userId, poemId);
  }
}
