import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  Post,
  Body,
} from "@nestjs/common";
import { HolidaysService } from "./holidays.service";
import { Season } from "@prisma/client";

@Controller("holidays")
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.holidaysService.findAll(parseInt(page), parseInt(limit));
  }

  @Get("season/:season")
  async findBySeason(
    @Param("season", new ParseEnumPipe(Season)) season: Season,
  ) {
    return this.holidaysService.findBySeason(season);
  }

  @Get("slug/:slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.holidaysService.findBySlug(slug);
  }

  @Get("month/:month")
  async findByMonth(@Param("month", ParseIntPipe) month: number) {
    return this.holidaysService.findByMonth(month);
  }

  @Get("month/:month/day/:day")
  async findByMonthAndDay(
    @Param("month", ParseIntPipe) month: number,
    @Param("day", ParseIntPipe) day: number,
  ) {
    return this.holidaysService.findByMonthAndDay(month, day);
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
