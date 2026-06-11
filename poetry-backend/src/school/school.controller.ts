import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SchoolService } from "./school.service";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";

@Controller("school")
@UseGuards(OptionalJwtAuthGuard)
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get("grades")
  getGradesOverview() {
    return this.schoolService.getGradesOverview();
  }

  @Get(":grade")
  getGradeCurriculum(
    @Param("grade", ParseIntPipe) grade: number,
    @Req() req: { user?: { id: number } },
  ) {
    return this.schoolService.getGradeCurriculum(grade, req.user?.id);
  }
}
