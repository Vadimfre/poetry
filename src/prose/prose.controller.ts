import { Controller, Get, Param } from "@nestjs/common";
import { ProseService } from "./prose.service";

@Controller("prose")
export class ProseController {
  constructor(private readonly proseService: ProseService) {}

  @Get()
  findAll() {
    return this.proseService.findAll();
  }

  @Get("by-author/:slug")
  findByAuthor(@Param("slug") slug: string) {
    return this.proseService.findByAuthorSlug(slug);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.proseService.findBySlug(slug);
  }

  @Get(":slug/chapters/:chapterSlug")
  findChapter(
    @Param("slug") slug: string,
    @Param("chapterSlug") chapterSlug: string,
  ) {
    return this.proseService.findChapter(slug, chapterSlug);
  }
}
