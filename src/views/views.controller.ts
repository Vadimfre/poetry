import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { ViewsService } from "./views.service";
import { IpExtractionGuard } from "./guards/ip-extraction.guard";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";

@Controller("views")
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get(":poemId")
  @UseGuards(OptionalJwtAuthGuard, IpExtractionGuard)
  async getOrAddView(
    @Param("poemId", ParseIntPipe) poemId: number,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const result = await this.viewsService.getOrAddView(
      poemId,
      req.user?.id,
      req.extractedIp,
    );

    this.viewsService.setCacheHeaders(res);

    return res.json(result);
  }
}
