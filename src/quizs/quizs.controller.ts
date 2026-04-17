import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { QuizsService } from "./quizs.service";
import { CheckQuizAnswersDto } from "./dto/check-quiz-answers.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { RolesGuard } from "@/auth/roles.guard";
import { Roles } from "@/auth/roles.decorator";

@Controller("quizs")
export class QuizsController {
  constructor(private readonly quizsService: QuizsService) {}

  // ========== PUBLIC ==========

  @Get()
  async getAllQuizzes() {
    return this.quizsService.getAllQuizzes();
  }

  @Get(":id")
  async getQuizById(@Param("id") id: string) {
    return this.quizsService.getQuizById(id);
  }

  @Post(":id/check")
  async checkQuizAnswers(
    @Param("id") id: string,
    @Body() dto: CheckQuizAnswersDto,
  ) {
    return this.quizsService.checkQuizAnswers(id, dto);
  }

  // ========== ADMIN ==========

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("ADMIN", "SUPER_ADMIN")
  @Post()
  async createQuiz(@Body() dto: CreateQuizDto) {
    return this.quizsService.createQuiz(dto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("ADMIN", "SUPER_ADMIN")
  @Put(":id")
  async updateQuiz(@Param("id") id: string, @Body() dto: UpdateQuizDto) {
    return this.quizsService.updateQuiz(id, dto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles("ADMIN", "SUPER_ADMIN")
  @Delete(":id")
  async deleteQuiz(@Param("id") id: string) {
    return this.quizsService.deleteQuiz(id);
  }
}
