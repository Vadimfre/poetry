import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateClassroomDto } from "./dto/create-classroom.dto";
import { JoinClassroomDto } from "./dto/join-classroom.dto";

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClassroom(teacherId: number, dto: CreateClassroomDto) {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException("Название класса не может быть пустым");
    }

    const code = await this.generateUniqueCode();

    return this.prisma.classroom.create({
      data: {
        name,
        code,
        teacherId,
      },
      include: this.classroomInclude(),
    });
  }

  async getMyClassrooms(user: { id: number; role: string }) {
    if (user.role === "TEACHER") {
      return this.prisma.classroom.findMany({
        where: { teacherId: user.id },
        include: this.classroomInclude(),
        orderBy: { createdAt: "desc" },
      });
    }

    return this.prisma.classroom.findMany({
      where: {
        members: {
          some: {
            studentId: user.id,
          },
        },
      },
      include: this.classroomInclude(user.id),
      orderBy: { createdAt: "desc" },
    });
  }

  async getClassroom(classroomId: string, user: { id: number; role: string }) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: this.classroomInclude(user.role === "STUDENT" ? user.id : undefined),
    });

    if (!classroom) {
      throw new NotFoundException("Класс не найден");
    }

    if (user.role === "TEACHER" && classroom.teacherId !== user.id) {
      throw new ForbiddenException("Нет доступа к этому классу");
    }

    if (
      user.role === "STUDENT" &&
      !classroom.members.some((member) => member.studentId === user.id)
    ) {
      throw new ForbiddenException("Вы не состоите в этом классе");
    }

    return classroom;
  }

  async joinClassroom(studentId: number, dto: JoinClassroomDto) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (!classroom) {
      throw new NotFoundException("Класс с таким кодом не найден");
    }

    await this.prisma.classroomMember.upsert({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId,
        },
      },
      update: {},
      create: {
        classroomId: classroom.id,
        studentId,
      },
    });

    return this.getClassroom(classroom.id, { id: studentId, role: "STUDENT" });
  }

  private classroomInclude(studentId?: number) {
    return {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" as const },
      },
      assignments: {
        include: {
          items: {
            include: {
              quiz: true,
            },
            orderBy: { order: "asc" as const },
          },
          attempts: studentId
            ? {
                where: { studentId },
                orderBy: { submittedAt: "desc" as const },
              }
            : true,
        },
        orderBy: { createdAt: "desc" as const },
      },
    };
  }

  private async generateUniqueCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    for (let attempt = 0; attempt < 10; attempt++) {
      const code = Array.from({ length: 6 }, () =>
        alphabet[Math.floor(Math.random() * alphabet.length)],
      ).join("");
      const existing = await this.prisma.classroom.findUnique({
        where: { code },
      });

      if (!existing) return code;
    }

    return `${Date.now()}`.slice(-6);
  }
}
