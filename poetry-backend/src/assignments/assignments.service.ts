import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";
import { MailService } from "@/libs/mail/mail.service";
import { localizeQuiz, localizeProseWork } from "@/i18n/content-localizer";
import { QuizsService } from "@/quizs/quizs.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { SubmitAssignmentDto } from "./dto/submit-assignment.dto";
import {
  CreateReadingAssignmentDto,
  UpdateReadingProgressDto,
} from "./dto/reading-assignment.dto";

type RequestUser = {
  id: number;
  role: string;
  email: string;
  name?: string | null;
};

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quizsService: QuizsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async createAssignment(
    classroomId: string,
    teacherId: number,
    dto: CreateAssignmentDto,
  ) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException("Класс не найден");
    }

    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Нет доступа к этому классу");
    }

    const quizzes = await this.prisma.quiz.findMany({
      where: { id: { in: dto.quizIds } },
      select: { id: true, title: true },
    });

    if (quizzes.length !== dto.quizIds.length) {
      throw new NotFoundException("Один или несколько квизов не найдены");
    }

    let dueDate: Date | null = null;
    if (dto.dueDate) {
      dueDate = new Date(dto.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        throw new BadRequestException("Некорректная дата дедлайна");
      }
      const minAheadMs = 60_000;
      if (dueDate.getTime() <= Date.now() + minAheadMs) {
        throw new BadRequestException(
          "Дедлайн должен быть в будущем минимум на 1 минуту от текущего времени",
        );
      }
    }

    const assignment = await this.prisma.quizAssignment.create({
      data: {
        classroomId,
        title: dto.title || quizzes[0].title,
        dueDate,
        sendEmailResults: dto.sendEmailResults ?? true,
        items: {
          create: dto.quizIds.map((quizId, index) => ({
            quizId,
            order: index,
          })),
        },
      },
      include: this.assignmentInclude(),
    });

    return this.enrichAssignment(assignment);
  }

  async getMyAssignments(studentId: number) {
    const assignments = await this.prisma.quizAssignment.findMany({
      where: {
        status: "ACTIVE",
        classroom: {
          members: {
            some: { studentId },
          },
        },
      },
      include: {
        classroom: {
          select: { id: true, name: true, code: true },
        },
        items: {
          include: { quiz: true },
          orderBy: { order: "asc" },
        },
        attempts: {
          where: { studentId },
          orderBy: { submittedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return assignments.map((a) => this.localizeAssignmentItems(a));
  }

  async getAssignment(assignmentId: string, user: RequestUser) {
    const assignment = await this.findAssignmentOrThrow(assignmentId);
    await this.assertAssignmentAccess(assignment, user);

    return this.enrichAssignment(assignment);
  }

  async getResults(assignmentId: string, teacherId: number) {
    const assignment = await this.findAssignmentOrThrow(assignmentId);

    if (assignment.classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Нет доступа к журналу");
    }

    return this.localizeAssignmentItems(assignment);
  }

  async submitAssignment(
    assignmentId: string,
    student: RequestUser,
    dto: SubmitAssignmentDto,
  ) {
    const assignment = await this.findAssignmentOrThrow(assignmentId);

    if (
      !assignment.classroom.members.some(
        (member) => member.studentId === student.id,
      )
    ) {
      throw new ForbiddenException("Вы не состоите в этом классе");
    }

    const existingAttempt = await this.prisma.quizAttempt.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: student.id,
        },
      },
    });

    if (existingAttempt) {
      throw new ConflictException("Задание уже сдано");
    }

    const quizIds = assignment.items.map((item) => item.quizId);
    const graded = await this.quizsService.gradeQuizAnswers(quizIds, dto);
    const grade = this.calculateGrade(graded.percentage);

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        assignmentId,
        studentId: student.id,
        total: graded.total,
        correct: graded.correct,
        percentage: graded.percentage,
        grade,
        answers: {
          create: graded.answerResults.map((answer) => ({
            questionId: answer.questionId,
            itemId: answer.itemId,
            zoneId: answer.zoneId,
            order: answer.order,
            content: answer.content,
            isCorrect: answer.isCorrect,
          })),
        },
      },
      include: {
        answers: true,
        assignment: {
          include: {
            classroom: {
              include: {
                teacher: { select: { id: true, name: true, email: true } },
              },
            },
            items: { include: { quiz: true }, orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (assignment.sendEmailResults) {
      await this.sendResultEmail(student, attempt).catch(() => undefined);
    }

    await this.sendTeacherNewSubmissionEmail(student, attempt).catch(
      () => undefined,
    );

    return attempt;
  }

  async createReadingAssignment(
    classroomId: string,
    teacherId: number,
    dto: CreateReadingAssignmentDto,
  ) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException("Класс не найден");
    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Нет доступа к этому классу");
    }

    const work = await this.prisma.proseWork.findUnique({
      where: { id: dto.proseWorkId },
      include: { author: true },
    });
    if (!work) throw new NotFoundException("Произведение не найдено");

    let dueDate: Date | null = null;
    if (dto.dueDate) {
      dueDate = new Date(dto.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        throw new BadRequestException("Некорректная дата дедлайна");
      }
    }

    const assignment = await this.prisma.readingAssignment.create({
      data: {
        classroomId,
        proseWorkId: dto.proseWorkId,
        title: dto.title?.trim() || work.title,
        dueDate,
      },
      include: {
        proseWork: { include: { author: true, _count: { select: { chapters: true } } } },
        classroom: { select: { id: true, name: true, code: true } },
      },
    });

    return {
      ...assignment,
      proseWork: {
        ...localizeProseWork(assignment.proseWork as Record<string, unknown>),
        chapterCount: assignment.proseWork._count.chapters,
      },
    };
  }

  async getMyReadingAssignments(studentId: number) {
    const items = await this.prisma.readingAssignment.findMany({
      where: {
        status: "ACTIVE",
        classroom: { members: { some: { studentId } } },
      },
      include: {
        proseWork: {
          include: { author: true, _count: { select: { chapters: true } } },
        },
        classroom: { select: { id: true, name: true, code: true } },
        progress: { where: { studentId } },
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((a) => ({
      ...a,
      proseWork: {
        ...localizeProseWork(a.proseWork as Record<string, unknown>),
        author: a.proseWork.author,
        chapterCount: a.proseWork._count.chapters,
      },
      myProgress: a.progress[0] ?? null,
    }));
  }

  async getClassroomReadingAssignments(classroomId: string, teacherId: number) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom) throw new NotFoundException("Класс не найден");
    if (classroom.teacherId !== teacherId) {
      throw new ForbiddenException("Нет доступа");
    }

    const items = await this.prisma.readingAssignment.findMany({
      where: { classroomId, status: "ACTIVE" },
      include: {
        proseWork: {
          include: { author: true, _count: { select: { chapters: true } } },
        },
        progress: {
          include: {
            lastChapter: { select: { id: true, title: true, slug: true, order: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((a) => ({
      ...a,
      proseWork: {
        ...localizeProseWork(a.proseWork as Record<string, unknown>),
        chapterCount: a.proseWork._count.chapters,
      },
    }));
  }

  async updateReadingProgress(
    assignmentId: string,
    studentId: number,
    dto: UpdateReadingProgressDto,
  ) {
    const assignment = await this.prisma.readingAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        classroom: { include: { members: true } },
        proseWork: { include: { chapters: true } },
      },
    });
    if (!assignment) throw new NotFoundException("Задание не найдено");
    if (
      !assignment.classroom.members.some((m) => m.studentId === studentId)
    ) {
      throw new ForbiddenException("Вы не состоите в этом классе");
    }

    let progressPercent = dto.progressPercent ?? 0;
    if (dto.lastChapterId) {
      const chapter = assignment.proseWork.chapters.find(
        (c) => c.id === dto.lastChapterId,
      );
      if (!chapter) throw new BadRequestException("Глава не найдена");
      const total = assignment.proseWork.chapters.length;
      progressPercent = Math.round((chapter.order / total) * 100);
    }
    if (dto.completed) progressPercent = 100;

    const completedAt =
      dto.completed || progressPercent >= 100 ? new Date() : null;

    return this.prisma.readingProgress.upsert({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      create: {
        assignmentId,
        studentId,
        lastChapterId: dto.lastChapterId,
        progressPercent,
        completedAt,
      },
      update: {
        lastChapterId: dto.lastChapterId ?? undefined,
        progressPercent,
        completedAt,
      },
    });
  }

  private async findAssignmentOrThrow(assignmentId: string) {
    const assignment = await this.prisma.quizAssignment.findUnique({
      where: { id: assignmentId },
      include: this.assignmentInclude(),
    });

    if (!assignment) {
      throw new NotFoundException("Задание не найдено");
    }

    return assignment;
  }

  private async assertAssignmentAccess(assignment: any, user: RequestUser) {
    if (user.role === "TEACHER" && assignment.classroom.teacherId !== user.id) {
      throw new ForbiddenException("Нет доступа к заданию");
    }

    if (
      user.role === "STUDENT" &&
      !assignment.classroom.members.some(
        (member) => member.studentId === user.id,
      )
    ) {
      throw new ForbiddenException("Нет доступа к заданию");
    }
  }

  private localizeAssignmentItems<T extends { items?: { quiz?: unknown }[] }>(
    assignment: T,
  ): T {
    if (!assignment.items?.length) return assignment;
    return {
      ...assignment,
      items: assignment.items.map((item) => ({
        ...item,
        quiz: item.quiz ? localizeQuiz(item.quiz as Record<string, unknown>) : item.quiz,
      })),
    };
  }

  private async enrichAssignment(assignment: any) {
    const quizzes = await Promise.all(
      assignment.items.map((item) => this.quizsService.getQuizById(item.quizId)),
    );

    return {
      ...this.localizeAssignmentItems(assignment),
      quizzes,
    };
  }

  private assignmentInclude() {
    return {
      classroom: {
        include: {
          teacher: {
            select: { id: true, name: true, email: true },
          },
          members: {
            include: {
              student: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
      items: {
        include: { quiz: true },
        orderBy: { order: "asc" as const },
      },
      attempts: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          answers: true,
        },
        orderBy: { submittedAt: "desc" as const },
      },
    };
  }

  /** Балл 0–10 по доле правильных ответов (0% → 0, 100% → 10). */
  private calculateGrade(percentage: number) {
    const rounded = Math.round(percentage / 10);
    return Math.max(0, Math.min(10, rounded));
  }

  private async sendResultEmail(student: RequestUser, attempt: any) {
    const subject = `Результат задания "${attempt.assignment.title}"`;
    const text = [
      `Здравствуйте, ${student.name || student.email}!`,
      "",
      `Ваш результат по заданию "${attempt.assignment.title}":`,
      `${attempt.correct}/${attempt.total} (${attempt.percentage}%), оценка ${attempt.grade}.`,
    ].join("\n");
    const html = `
      <p>Здравствуйте, ${student.name || student.email}!</p>
      <p>Ваш результат по заданию <strong>${attempt.assignment.title}</strong>:</p>
      <p><strong>${attempt.correct}/${attempt.total}</strong> (${attempt.percentage}%), оценка <strong>${attempt.grade}</strong>.</p>
    `;

    return this.mailService.sendMail(student.email, subject, html, text);
  }

  private async sendTeacherNewSubmissionEmail(
    student: RequestUser,
    attempt: {
      correct: number;
      total: number;
      percentage: number;
      grade: number;
      assignment: {
        id: string;
        title: string;
        classroom: {
          teacher: { email: string | null; name: string | null } | null;
        };
      };
    },
  ) {
    const teacherEmail = attempt.assignment.classroom.teacher?.email;
    if (!teacherEmail) {
      return;
    }

    const base =
      this.configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
    const journalUrl = `${base.replace(/\/$/, "")}/teacher/assignments/${attempt.assignment.id}/results`;
    const who = student.name || student.email;
    const subject = `Новая сдача: ${attempt.assignment.title}`;
    const text = [
      `Здравствуйте!`,
      "",
      `Ученик ${who} сдал задание «${attempt.assignment.title}».`,
      `Результат: ${attempt.correct}/${attempt.total} (${attempt.percentage}%), оценка ${attempt.grade}.`,
      "",
      `Журнал результатов: ${journalUrl}`,
    ].join("\n");
    const html = `
      <p>Здравствуйте!</p>
      <p>Ученик <strong>${who}</strong> сдал задание «<strong>${attempt.assignment.title}</strong>».</p>
      <p><strong>${attempt.correct}/${attempt.total}</strong> (${attempt.percentage}%), оценка <strong>${attempt.grade}</strong>.</p>
      <p><a href="${journalUrl}">Открыть журнал результатов</a></p>
    `;

    return this.mailService.sendMail(teacherEmail, subject, html, text);
  }
}
