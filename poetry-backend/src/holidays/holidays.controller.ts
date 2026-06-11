import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  Post,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { HolidaysService } from "./holidays.service";
import { Season } from "@prisma/client";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";

@Controller("holidays")
@UseGuards(OptionalJwtAuthGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Req() req: { user?: { id: number } },
  ) {
    return this.holidaysService.findAll(
      parseInt(page),
      parseInt(limit),
      req.user?.id,
    );
  }

  @Get("season/:season")
  async findBySeason(
    @Param("season", new ParseEnumPipe(Season)) season: Season,
    @Req() req: { user?: { id: number } },
  ) {
    return this.holidaysService.findBySeason(season, req.user?.id);
  }

  @Get("slug/:slug")
  async findBySlug(
    @Param("slug") slug: string,
    @Req() req: { user?: { id: number } },
  ) {
    return this.holidaysService.findBySlug(slug, req.user?.id);
  }

  @Get("month/:month")
  async findByMonth(
    @Param("month", ParseIntPipe) month: number,
    @Req() req: { user?: { id: number } },
  ) {
    return this.holidaysService.findByMonth(month, req.user?.id);
  }

  @Get("month/:month/day/:day")
  async findByMonthAndDay(
    @Param("month", ParseIntPipe) month: number,
    @Param("day", ParseIntPipe) day: number,
    @Req() req: { user?: { id: number } },
  ) {
    return this.holidaysService.findByMonthAndDay(
      month,
      day,
      req.user?.id,
    );
  }

  @Get("seasons")
  async getSeasons() {
    return this.holidaysService.getSeasons();
  }

  @Post("create")
  async createHoliday(
    @Body()
    body: {
      name: string;
      slug: string;
      day: number;
      month: number;
      season: Season;
      poems?: {
        title: string;
        slug: string;
        content: string;
        authorId: number;
        categoryIds?: number[];
      }[];
    },
  ) {
    return this.holidaysService.createHoliday(body);
  }
}
