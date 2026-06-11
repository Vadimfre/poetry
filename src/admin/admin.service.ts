import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { buildI18n } from "../i18n/build-i18n";
import {
  buildI18nFromInput,
  I18nFieldsInput,
  mergeI18nInput,
  scalarFromI18n,
} from "./admin-i18n.helper";
import { CurriculumKind } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ========== POEMS MANAGEMENT ==========

  async createPoem(data: {
    title?: string;
    content?: string;
    description?: string;
    authorId: number;
    year?: number;
    categoryId: number;
    videoUrl?: string;
    i18n?: I18nFieldsInput;
    schoolGrades?: { grade: number; kind: CurriculumKind }[];
  }) {
    const i18n = buildI18nFromInput(data.i18n ?? {}, {
      title: data.title,
      content: data.content,
      description: data.description ?? "",
    });

    const title = scalarFromI18n(i18n, "title");
    const content = scalarFromI18n(i18n, "content");
    if (!title || !content) {
      throw new BadRequestException(
        "Патрабуюцца назва і тэкст хоця б на адной мове (be)",
      );
    }

    const slug = this.generateSlug(title);

    const existing = await this.prisma.poem.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException("Верш з такой назвай ужо існуе");
    }

    const { categoryId, schoolGrades, i18n: _i, title: _t, content: _c, description: _d, ...rest } = data;

    const poem = await this.prisma.poem.create({
      data: {
        authorId: data.authorId,
        year: data.year,
        videoUrl: data.videoUrl,
        title,
        content,
        description: scalarFromI18n(i18n, "description") || null,
        slug,
        i18n,
        categories: {
          connect: { id: categoryId },
        },
      },
      include: {
        author: true,
        categories: true,
        schoolGrades: true,
      },
    });

    if (schoolGrades?.length) {
      await this.syncPoemSchoolGrades(poem.id, schoolGrades);
    }

    return this.getPoemById(poem.id);
  }

  async updatePoem(
    id: number,
    data: {
      title?: string;
      content?: string;
      description?: string;
      authorId?: number;
      year?: number;
      categoryId?: number;
      videoUrl?: string;
      i18n?: I18nFieldsInput;
      schoolGrades?: { grade: number; kind: CurriculumKind }[];
    },
  ) {
    const poem = await this.prisma.poem.findUnique({ where: { id } });
    if (!poem) {
      throw new NotFoundException("Верш не знойдзены");
    }

    const existingI18n =
      (poem.i18n as Record<string, Record<string, string>> | null) ?? {};

    let mergedI18n = existingI18n;
    if (data.i18n) {
      mergedI18n = mergeI18nInput(existingI18n, data.i18n);
    }
    if (
      data.title !== undefined ||
      data.content !== undefined ||
      data.description !== undefined
    ) {
      mergedI18n = mergeI18nInput(mergedI18n, {
        be: {
          ...(mergedI18n.be ?? {}),
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
          ...(data.description !== undefined
            ? { description: data.description ?? "" }
            : {}),
        },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.authorId !== undefined) updateData.authorId = data.authorId;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;

    updateData.i18n = mergedI18n;
    updateData.title = scalarFromI18n(mergedI18n, "title", poem.title);
    updateData.content = scalarFromI18n(mergedI18n, "content", poem.content);
    updateData.description =
      scalarFromI18n(mergedI18n, "description") || null;

    if (data.title && data.title !== poem.title) {
      updateData.slug = this.generateSlug(data.title);
    } else if (
      updateData.title &&
      typeof updateData.title === "string" &&
      updateData.title !== poem.title
    ) {
      updateData.slug = this.generateSlug(updateData.title);
    }

    if (data.categoryId !== undefined) {
      updateData.categories = {
        set: [{ id: data.categoryId }],
      };
    }

    await this.prisma.poem.update({
      where: { id },
      data: updateData,
    });

    if (data.schoolGrades !== undefined) {
      await this.syncPoemSchoolGrades(id, data.schoolGrades);
    }

    return this.getPoemById(id);
  }

  async getPoemById(id: number) {
    const poem = await this.prisma.poem.findUnique({
      where: { id },
      include: {
        author: true,
        categories: true,
        schoolGrades: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
    });
    if (!poem) {
      throw new NotFoundException("Верш не знойдзены");
    }
    return poem;
  }

  private async syncPoemSchoolGrades(
    poemId: number,
    grades: { grade: number; kind: CurriculumKind }[],
  ) {
    await this.prisma.$transaction([
      this.prisma.poemSchoolGrade.deleteMany({ where: { poemId } }),
      ...(grades.length
        ? [
            this.prisma.poemSchoolGrade.createMany({
              data: grades.map((g) => ({ poemId, grade: g.grade, kind: g.kind })),
            }),
          ]
        : []),
    ]);
  }

  async deletePoem(id: number) {
    const poem = await this.prisma.poem.findUnique({ where: { id } });
    if (!poem) {
      throw new NotFoundException("Твор не найден");
    }

    // Удаляем видео файл если есть
    if (poem.videoUrl) {
      const videoPath = path.join(
        process.cwd(),
        poem.videoUrl.replace(/^\//, ""),
      );
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    return this.prisma.poem.delete({ where: { id } });
  }

  async getAllPoems() {
    return this.prisma.poem.findMany({
      include: {
        author: true,
        categories: true,
        schoolGrades: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ========== AUTHORS MANAGEMENT ==========

  async createAuthor(data: {
    name?: string;
    bio?: string;
    birthYear?: number;
    deathYear?: number;
    image?: string;
    i18n?: I18nFieldsInput;
  }) {
    const i18n = buildI18nFromInput(data.i18n ?? {}, {
      name: data.name,
      bio: data.bio ?? "",
    });
    const name = scalarFromI18n(i18n, "name");
    if (!name) {
      throw new BadRequestException("Патрабуецца імя аўтара");
    }

    const slug = this.generateSlug(name);

    const existing = await this.prisma.author.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException("Аўтар з такім імем ужо існуе");
    }

    const { i18n: _i, name: _n, bio: _b, ...rest } = data;

    return this.prisma.author.create({
      data: {
        ...rest,
        name,
        bio: scalarFromI18n(i18n, "bio") || null,
        slug,
        i18n,
      },
    });
  }

  async updateAuthor(
    id: number,
    data: {
      name?: string;
      bio?: string;
      birthYear?: number;
      deathYear?: number;
      image?: string;
      i18n?: I18nFieldsInput;
    },
  ) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) {
      throw new NotFoundException("Аўтар не знойдзены");
    }

    const existingI18n =
      (author.i18n as Record<string, Record<string, string>> | null) ?? {};
    let mergedI18n = data.i18n
      ? mergeI18nInput(existingI18n, data.i18n)
      : existingI18n;

    if (data.name !== undefined || data.bio !== undefined) {
      mergedI18n = mergeI18nInput(mergedI18n, {
        be: {
          ...(mergedI18n.be ?? {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.bio !== undefined ? { bio: data.bio ?? "" } : {}),
        },
      });
    }

    const updateData: Record<string, unknown> = {};
    if (data.birthYear !== undefined) updateData.birthYear = data.birthYear;
    if (data.deathYear !== undefined) updateData.deathYear = data.deathYear;
    if (data.image !== undefined) updateData.image = data.image;

    updateData.i18n = mergedI18n;
    updateData.name = scalarFromI18n(mergedI18n, "name", author.name);
    updateData.bio = scalarFromI18n(mergedI18n, "bio") || null;

    if (updateData.name !== author.name) {
      updateData.slug = this.generateSlug(updateData.name as string);
    }

    return this.prisma.author.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAuthor(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { _count: { select: { poems: true, proseWorks: true } } },
    });
    if (!author) {
      throw new NotFoundException("Аўтар не знойдзены");
    }
    if (author._count.poems > 0 || author._count.proseWorks > 0) {
      throw new BadRequestException(
        "Нельга выдаліць аўтара з творамі. Спачатку выдаліце або пераназначце творы.",
      );
    }
    return this.prisma.author.delete({ where: { id } });
  }

  async getAllAuthors() {
    return this.prisma.author.findMany({
      include: {
        _count: {
          select: {
            poems: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // ========== CATEGORIES MANAGEMENT ==========

  async createCategory(data: {
    name?: string;
    description?: string;
    i18n?: I18nFieldsInput;
  }) {
    const i18n = buildI18nFromInput(data.i18n ?? {}, {
      name: data.name,
      description: data.description ?? "",
    });
    const name = scalarFromI18n(i18n, "name");
    if (!name) {
      throw new BadRequestException("Патрабуецца назва катэгорыі");
    }

    const slug = this.generateSlug(name);

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException("Катэгорыя з такой назвай ужо існуе");
    }

    const { i18n: _i, name: _n, description: _d } = data;

    return this.prisma.category.create({
      data: {
        name,
        description: scalarFromI18n(i18n, "description") || null,
        slug,
        i18n,
      },
    });
  }

  async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
      i18n?: I18nFieldsInput;
    },
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("Катэгорыя не знойдзена");
    }

    const existingI18n =
      (category.i18n as Record<string, Record<string, string>> | null) ?? {};
    let mergedI18n = data.i18n
      ? mergeI18nInput(existingI18n, data.i18n)
      : existingI18n;

    if (data.name !== undefined || data.description !== undefined) {
      mergedI18n = mergeI18nInput(mergedI18n, {
        be: {
          ...(mergedI18n.be ?? {}),
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined
            ? { description: data.description ?? "" }
            : {}),
        },
      });
    }

    const updateData: Record<string, unknown> = {
      i18n: mergedI18n,
      name: scalarFromI18n(mergedI18n, "name", category.name),
      description: scalarFromI18n(mergedI18n, "description") || null,
    };

    if (updateData.name !== category.name) {
      updateData.slug = this.generateSlug(updateData.name as string);
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { poems: true } } },
    });
    if (!category) {
      throw new NotFoundException("Катэгорыя не знойдзена");
    }
    if (category._count.poems > 0) {
      throw new BadRequestException(
        "Нельга выдаліць катэгорыю са стихамі. Спачатку пераназначце стихі.",
      );
    }
    return this.prisma.category.delete({ where: { id } });
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            poems: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  // ========== USERS/ADMINS MANAGEMENT ==========

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async setUserRole(
    adminEmail: string,
    userId: number,
    role: "USER" | "ADMIN",
  ) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    // Нельзя изменить роль суперадмина
    if (targetUser.role === "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Нельзя изменить роль главного администратора",
      );
    }

    // Нельзя изменить свою роль
    if (targetUser.email === adminEmail) {
      throw new ForbiddenException("Нельзя изменить свою роль");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  async deleteUser(adminEmail: string, userId: number) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException("Пользователь не найден");
    }

    // Нельзя удалить суперадмина
    if (targetUser.role === "SUPER_ADMIN") {
      throw new ForbiddenException("Нельзя удалить главного администратора");
    }

    // Нельзя удалить себя
    if (targetUser.email === adminEmail) {
      throw new ForbiddenException("Нельзя удалить себя");
    }

    return this.prisma.user.delete({ where: { id: userId } });
  }

  // ========== COMMENTS MANAGEMENT ==========

  async getAllComments(
    page: number = 1,
    limit: number = 20,
    userId?: number,
    poemId?: number,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (userId) where.userId = userId;
    if (poemId) where.poemId = poemId;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          poem: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCommentById(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        poem: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException("Комментарий не найден");
    }

    return comment;
  }

  async updateComment(id: number, text: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException("Комментарий не найден");
    }

    return this.prisma.comment.update({
      where: { id },
      data: { text },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        poem: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async deleteComment(id: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException("Комментарий не найден");
    }

    return this.prisma.comment.delete({ where: { id } });
  }

  async bulkDeleteComments(ids: number[]) {
    const result = await this.prisma.comment.deleteMany({
      where: { id: { in: ids } },
    });

    return { deletedCount: result.count };
  }

  // ========== LIKES MANAGEMENT ==========

  async getAllLikes(
    page: number = 1,
    limit: number = 20,
    userId?: number,
    poemId?: number,
  ) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const where: any = {};
    if (userId) where.userId = userId;
    if (poemId) where.poemId = poemId;

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          poem: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      this.prisma.like.count({ where }),
    ]);

    return {
      likes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  async getLikesStatistics() {
    const totalLikes = await this.prisma.like.count();
    const likesByPoem = await this.prisma.poem.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        likes: {
          _count: "desc",
        },
      },
      take: 10,
    });

    const likesByDay = await this.prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM \`Like\`
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;

    return {
      totalLikes,
      topPoems: likesByPoem,
      dailyLikes: likesByDay,
    };
  }

  async deleteLike(id: number) {
    const like = await this.prisma.like.findUnique({ where: { id } });
    if (!like) {
      throw new NotFoundException("Лайк не найден");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.like.delete({ where: { id } });

      await tx.poem.update({
        where: { id: like.poemId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      });
    });
  }

  // ========== VIEWS MANAGEMENT ==========

  async getAllViews(page: number = 1, limit: number = 20, poemId?: number) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (poemId) where.poemId = poemId;

    const [views, total] = await Promise.all([
      this.prisma.view.findMany({
        where,
        select: {
          id: true,
          poemId: true,
          userId: true,
          ip: true,
          ipHash: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
    }),
      this.prisma.view.count({ where }),
    ]);

    return {
      views,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getViewsAnalytics() {
    const totalViews = await this.prisma.view.count();
    const uniqueVisitors = await this.prisma.view.groupBy({
      by: ["ip"],
      _count: {
        ip: true,
      },
    });

    // Временное решение: топ стихов по просмотрам через группировку
    const viewsByPoem = await this.prisma.view.groupBy({
      by: ["poemId"],
      _count: {
        poemId: true,
      },
      orderBy: {
        _count: {
          poemId: "desc",
        },
      },
      take: 10,
    });

    // Получаем детали стихов
    const poemIds = viewsByPoem.map((v) => v.poemId);
    const poems = await this.prisma.poem.findMany({
      where: { id: { in: poemIds } },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    const topPoems = poems.map((poem) => {
      const viewCount =
        viewsByPoem.find((v) => v.poemId === poem.id)?._count.poemId || 0;
      return {
        ...poem,
        viewCount,
      };
    });

    const viewsByDay = await this.prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM \`View\`
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;

    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      topPoems: viewsByPoem,
      dailyViews: viewsByDay,
    };
  }

  async resetAllViews() {
    const [deletedViews, updatedPoems] = await Promise.all([
      this.prisma.view.deleteMany(),
      this.prisma.poem.updateMany({
        data: { views: 0 },
      }),
    ]);

    return {
      deletedViewsCount: deletedViews.count,
      resetPoemsCount: updatedPoems.count,
    };
  }

  async getViewsByPoem(poemId: number) {
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!poem) {
      throw new NotFoundException("Твор не найден");
    }

    const views = await this.prisma.view.findMany({
      where: { poemId },
      select: {
        id: true,
        poemId: true,
        userId: true,
        ip: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      poem,
      views,
      count: views.length,
    };
  }

  // ========== STATS ==========

  async getStats() {
    const [poemsCount, usersCount, commentsCount, categoriesCount] =
      await Promise.all([
        this.prisma.poem.count(),
        this.prisma.user.count(),
        this.prisma.comment.count(),
        this.prisma.category.count(),
      ]);

    const adminsCount = await this.prisma.user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });

    return {
      poems: poemsCount,
      users: usersCount,
      admins: adminsCount,
      comments: commentsCount,
      categories: categoriesCount,
    };
  }

  // ========== HELPERS ==========

  private generateSlug(text: string): string {
    const translitMap: Record<string, string> = {
      // Русская и белорусская транслитерация
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "sch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
      " ": "-",
      // Белорусские буквы
      і: "i",
      ў: "u",
      ґ: "g",
    };

    return text
      .toLowerCase()
      .split("")
      .map((char) => translitMap[char] || char)
      .join("")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
