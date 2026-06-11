import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { QuizsService } from "./quizs.service";
import { CheckQuizAnswersDto } from "./dto/check-quiz-answers.dto";

@Controller("quizzes")
export class QuizsController {
  constructor(private readonly quizsService: QuizsService) {}

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
    @Param("id") quizId: string,
    @Body() dto: CheckQuizAnswersDto,
  ) {
    return this.quizsService.checkQuizAnswers(quizId, dto);
  }
}
