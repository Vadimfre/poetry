import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  ParseIntPipe,
  Ip,
  UseGuards,
} from "@nestjs/common";
import { ViewsService } from "./views.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("views")
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Post("poem/:poemId")
  async recordView(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
    @Ip() ip: string,
  ): Promise<{ views: number }> {
    const userId = req.user?.id; // если пользователь авторизован
    return this.viewsService.recordView(poemId, userId, ip);
  }

  @Get("poem/:poemId/count")
  async getViewsCount(
    @Param("poemId", ParseIntPipe) poemId: number,
  ): Promise<{ views: number }> {
    const count = await this.viewsService.getViewsCount(poemId);
    return { views: count };
  }

  @UseGuards(JwtAuthGuard)
  @Get("poem/:poemId/history")
  async getViewsHistory(
    @Param("poemId", ParseIntPipe) poemId: number,
  ): Promise<{ date: string; count: number }[]> {
    return this.viewsService.getViewsHistory(poemId, 30);
  }
}
