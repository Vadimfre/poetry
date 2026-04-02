import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import { ViewsService } from "./views.service";

@Controller("views")
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  // 📌 Добавить просмотр (работает и для гостей)
  @Post(":poemId")
  async addView(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
  ) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

    return this.viewsService.addView(
      poemId,
      req.user?.id, // может быть undefined (гость)
      ip,
    );
  }

  // 📊 Получить количество просмотров
  @Get(":poemId/count")
  async getViewsCount(@Param("poemId", ParseIntPipe) poemId: number) {
    return this.viewsService.getViewsCount(poemId);
  }
}
