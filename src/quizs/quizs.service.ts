import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CheckQuizAnswersDto } from "./dto/check-quiz-answers.dto";
import { QuestionValidators } from "./helpers/question-validators";

@Injectable()
export class QuizsService {
  private validator = new QuestionValidators();

  constructor(private prisma: PrismaService) {}

  private mapQuiz(quiz: any) {
    return {
      id: quiz.id,
      title: quiz.title,
      imageUrl: quiz.imageUrl,
      questionsCount: quiz._count.questions,
    };
  }

  // ========== READ ==========

  async getAllQuizzes() {
    const quizzes = await this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        imageUrl: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (quizzes.length === 0) {
      throw new NotFoundException("Quizs not found");
    }

    return quizzes.map(this.mapQuiz);
  }

  async getQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            items: {
              include: {
                itemZones: true,
              },
            },
            zones: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }
    return quiz;
  }

  // ========== CHECK ANSWERS ==========
  async checkQuizAnswers(quizId: string, dto: CheckQuizAnswersDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            items: {
              include: {
                itemZones: true,
              },
            },
            zones: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    const answersByQuestion = new Map<string, typeof dto.answers>();

    for (const answer of dto.answers) {
      if (!answersByQuestion.has(answer.questionId)) {
        answersByQuestion.set(answer.questionId, []);
      }
      answersByQuestion.get(answer.questionId)!.push(answer);
    }

    let total = 0;
    let correct = 0;

    for (const question of quiz.questions) {
      const userAnswers = answersByQuestion.get(question.id) || [];

      total += 1;

      const isCorrect = this.validator.checkQuestion(question, userAnswers);

      if (isCorrect) correct++;
    }

    return { total, correct };
  }
}
