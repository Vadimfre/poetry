import { PrismaService } from "@/prisma/prisma.service";
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CheckQuizAnswersDto } from "./dto/check-quiz-answers.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";

const QUIZ_INCLUDE = {
  questions: {
    include: {
      items: true,
      zones: true,
    },
  },
} as const;

@Injectable()
export class QuizsService {
  constructor(private prisma: PrismaService) {}

  // ========== READ ==========

  async getAllQuizzes() {
    const quizs = await this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        imageUrl: true,
      },
    });

    if (quizs.length === 0) {
      throw new NotFoundException("Quizs not found");
    }

    return quizs;
  }

  async getQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            items: {
              omit: {
                correctZoneId: true,
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

  // ========== CREATE (transaction: zones first, then items with real IDs) ==========

  async createQuiz(dto: CreateQuizDto) {
    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: { title: dto.title, imageUrl: dto.imageUrl },
      });

      for (const q of dto.questions) {
        const question = await tx.question.create({
          data: { quizId: quiz.id, text: q.text },
        });

        // Create zones first to get real IDs
        const zoneIds: string[] = [];
        for (const z of q.zones) {
          const zone = await tx.zone.create({
            data: { questionId: question.id, content: z.content },
          });
          zoneIds.push(zone.id);
        }

        // Create items with correctZoneId resolved from correctZoneIndex
        for (const item of q.items) {
          await tx.item.create({
            data: {
              questionId: question.id,
              content: item.content,
              correctZoneId: zoneIds[item.correctZoneIndex],
            },
          });
        }
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: QUIZ_INCLUDE,
      });
    });
  }

  // ========== UPDATE (full replace in transaction) ==========

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException("Quiz not found");

    if (!dto.questions) {
      return this.prisma.quiz.update({
        where: { id },
        data: { title: dto.title, imageUrl: dto.imageUrl },
        include: QUIZ_INCLUDE,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete old questions + items + zones
      const oldQuestions = await tx.question.findMany({
        where: { quizId: id },
        select: { id: true },
      });
      const questionIds = oldQuestions.map((q) => q.id);

      if (questionIds.length > 0) {
        await tx.item.deleteMany({
          where: { questionId: { in: questionIds } },
        });
        await tx.zone.deleteMany({
          where: { questionId: { in: questionIds } },
        });
        await tx.question.deleteMany({ where: { id: { in: questionIds } } });
      }

      // Update title
      await tx.quiz.update({
        where: { id },
        data: { title: dto.title, imageUrl: dto.imageUrl },
      });

      // Recreate questions with zones-first approach
      for (const q of dto.questions) {
        const question = await tx.question.create({
          data: { quizId: id, text: q.text },
        });

        const zoneIds: string[] = [];
        for (const z of q.zones) {
          const zone = await tx.zone.create({
            data: { questionId: question.id, content: z.content },
          });
          zoneIds.push(zone.id);
        }

        for (const item of q.items) {
          await tx.item.create({
            data: {
              questionId: question.id,
              content: item.content,
              correctZoneId: zoneIds[item.correctZoneIndex],
            },
          });
        }
      }

      return tx.quiz.findUnique({
        where: { id },
        include: QUIZ_INCLUDE,
      });
    });
  }

  // ========== DELETE ==========

  async deleteQuiz(id: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException("Quiz not found");

    await this.prisma.quiz.delete({ where: { id } });
    return { message: "Quiz deleted" };
  }

  // ========== CHECK ANSWERS ==========

  async checkQuizAnswers(quizId: string, dto: CheckQuizAnswersDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    let correctCount = 0;
    let total = 0;

    for (const question of quiz.questions) {
      const userAnswer = dto.answers.find((a) => a.questionId === question.id);

      if (!userAnswer) {
        throw new BadRequestException(
          `Missing answer for question ${question.id}`,
        );
      }

      for (const item of question.items) {
        total++;

        const userZone = userAnswer.mapping[item.id];

        if (item.correctZoneId === userZone) {
          correctCount++;
        }
      }
    }
    return {
      isCorrect: correctCount === total,
      correctCount,
      total,
    };
  }
}
