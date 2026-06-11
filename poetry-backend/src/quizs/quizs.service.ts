import { localizeQuiz } from "@/i18n/content-localizer";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AnswerDto, CheckQuizAnswersDto } from "./dto/check-quiz-answers.dto";
import { QuestionValidators } from "./helpers/question-validators";

@Injectable()
export class QuizsService {
  private validator = new QuestionValidators();

  constructor(private prisma: PrismaService) {}

  private mapQuiz(quiz: Record<string, unknown>) {
    const localized = localizeQuiz(quiz);
    return {
      id: localized.id,
      title: localized.title,
      description: localized.description,
      icon: localized.icon,
      color: localized.color,
      imageUrl: localized.imageUrl,
      questionsCount: (quiz._count as { questions: number })?.questions,
    };
  }

  // ========== READ ==========

  async getAllQuizzes() {
    const quizzes = await this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        i18n: true,
        icon: true,
        color: true,
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
            zones: {
              include: {
                itemZones: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    // Strip isCorrect from itemZones to prevent cheating
    const sanitizedQuestions = quiz.questions.map((question) => ({
      ...question,
      items: question.items.map((item) => ({
        ...item,
        itemZones: item.itemZones.map(({ isCorrect, ...zone }) => zone),
      })),
      zones: question.zones.map((zone) => ({
        ...zone,
        itemZones: zone.itemZones.map(({ isCorrect, ...iz }) => iz),
      })),
    }));

    return localizeQuiz({ ...quiz, questions: sanitizedQuestions });
  }

  // ========== CHECK ANSWERS ==========
  async checkQuizAnswers(quizId: string, dto: CheckQuizAnswersDto) {
    const result = await this.gradeQuizAnswers([quizId], dto);

    return { total: result.total, correct: result.correct };
  }

  async gradeQuizAnswers(quizIds: string[], dto: CheckQuizAnswersDto) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { id: { in: quizIds } },
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

    if (quizzes.length !== quizIds.length) {
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

    const answerResults: (AnswerDto & { isCorrect: boolean })[] = [];

    for (const quiz of quizzes) {
      for (const question of quiz.questions) {
      const userAnswers = answersByQuestion.get(question.id) || [];

      total += 1;

      const isCorrect = this.validator.checkQuestion(question, userAnswers);

      if (isCorrect) correct++;

        for (const answer of userAnswers) {
          answerResults.push({
            ...answer,
            isCorrect: this.checkSingleAnswer(question, answer),
          });
        }
      }
    }

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, percentage, answerResults };
  }

  private checkSingleAnswer(question: any, answer: AnswerDto) {
    const item = question.items.find((candidate) => candidate.id === answer.itemId);
    if (!item) return false;

    if (question.type === "ORDER") {
      if (answer.order === undefined) return false;

      if (item.year !== null) {
        return Math.abs(answer.order - item.year) <= 5;
      }

      return item.order === answer.order;
    }

    if (!answer.zoneId) return false;

    return item.itemZones.some(
      (itemZone) => itemZone.zoneId === answer.zoneId && itemZone.isCorrect,
    );
  }
}
