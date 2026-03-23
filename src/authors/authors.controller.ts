import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { AuthorsService } from "./authors.service";

@Controller("authors")
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.authorsService.findOne(id);
  }

  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.authorsService.findBySlug(slug);
  }
}
