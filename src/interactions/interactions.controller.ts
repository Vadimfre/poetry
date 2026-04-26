import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { InteractionsService } from "./interactions.service";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";

@Controller("poems")
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get(":id/interactions")
  @UseGuards(OptionalJwtAuthGuard)
  async getInteractions(@Param("id") poemId: number, @Req() req) {
    const userId = req.user?.id ?? null;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    return this.interactionsService.getInteractions(poemId, userId, ip);
  }

  @Post(":id/view")
  @UseGuards(OptionalJwtAuthGuard)
  async addView(@Param("id") poemId: number, @Req() req) {
    const userId = req.user?.id ?? null;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    return this.interactionsService.addView(poemId, userId ?? undefined, ip);
  }
}
