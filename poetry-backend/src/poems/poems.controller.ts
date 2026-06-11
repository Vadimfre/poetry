import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PoemsService } from "./poems.service";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";

@Controller("poems")
@UseGuards(OptionalJwtAuthGuard)
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @Get()
  async findAll(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
    @Req() req: { user?: { id: number } },
  ) {
    return this.poemsService.findAll(
      parseInt(page),
      parseInt(limit),
      req.user?.id,
    );
  }
  
  @Get("search")
  async search(
    @Query("q") query: string,
    @Req() req: { user?: { id: number } },
  ) {
    return this.poemsService.search(query, req.user?.id);
  }

  @Get("authors")
  async getAllAuthors() {
    return this.poemsService.getAllAuthors();
  }

  @Get("authors/:slug")
  async getAuthorBySlug(
    @Param("slug") slug: string,
    @Req() req: { user?: { id: number } },
  ) {
    return this.poemsService.getAuthorBySlug(slug, req.user?.id);
  }

  @Get("slug/:slug")
  async findBySlug(
    @Param("slug") slug: string,
    @Req() req: { user?: { id: number } },
  ) {
    return this.poemsService.findBySlug(slug, req.user?.id);
  }

  @Get("category/slug/:categorySlug")
  async findByCategorySlug(
    @Param("categorySlug") categorySlug: string,
    @Req() req: { user?: { id: number } },
  ) {
    return this.poemsService.findByCategorySlug(categorySlug, req.user?.id);
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: { user?: { id: number } },
  ) {
    return this.poemsService.findOne(id, req.user?.id);
  }
}
