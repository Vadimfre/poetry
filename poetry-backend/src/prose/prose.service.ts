import {
  localizeAuthor,
  localizeProseChapter,
  localizeProseChapters,
  localizeProseWork,
  localizeProseWorks,
} from "@/i18n/content-localizer";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ProseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const works = await this.prisma.proseWork.findMany({
      include: {
        author: true,
        _count: { select: { chapters: true } },
      },
      orderBy: { title: "asc" },
    });
    return localizeProseWorks(works).map((w) => ({
      ...w,
      author: localizeAuthor(w.author as Record<string, unknown>),
      chapterCount: (w as { _count?: { chapters: number } })._count?.chapters ?? 0,
    }));
  }

  async findByAuthorSlug(slug: string) {
    const author = await this.prisma.author.findUnique({ where: { slug } });
    if (!author) throw new NotFoundException("Author not found");

    const works = await this.prisma.proseWork.findMany({
      where: { authorId: author.id },
      include: { _count: { select: { chapters: true } } },
      orderBy: { year: "asc" },
    });

    return localizeProseWorks(works).map((w) => ({
      ...w,
      chapterCount: (w as { _count?: { chapters: number } })._count?.chapters ?? 0,
    }));
  }

  async findBySlug(slug: string) {
    const work = await this.prisma.proseWork.findUnique({
      where: { slug },
      include: {
        author: true,
        chapters: { orderBy: { order: "asc" } },
        quizzes: {
          select: { id: true, title: true, description: true, icon: true, color: true },
        },
      },
    });
    if (!work) throw new NotFoundException("Prose work not found");

    const localized = localizeProseWork(work);
    return {
      ...localized,
      author: localizeAuthor(work.author as Record<string, unknown>),
      chapters: localizeProseChapters(work.chapters).map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        order: c.order,
      })),
      quizzes: work.quizzes,
    };
  }

  async findChapter(workSlug: string, chapterSlug: string) {
    const work = await this.prisma.proseWork.findUnique({
      where: { slug: workSlug },
      include: {
        author: true,
        chapters: { orderBy: { order: "asc" } },
      },
    });
    if (!work) throw new NotFoundException("Prose work not found");

    const chapter = work.chapters.find((c) => c.slug === chapterSlug);
    if (!chapter) throw new NotFoundException("Chapter not found");

    const chapterIndex = work.chapters.findIndex((c) => c.id === chapter.id);
    const prev = chapterIndex > 0 ? work.chapters[chapterIndex - 1] : null;
    const next =
      chapterIndex < work.chapters.length - 1
        ? work.chapters[chapterIndex + 1]
        : null;

    return {
      work: {
        ...localizeProseWork(work),
        author: localizeAuthor(work.author as Record<string, unknown>),
      },
      chapter: localizeProseChapter(chapter),
      navigation: {
        prev: prev ? { slug: prev.slug, title: prev.title, order: prev.order } : null,
        next: next ? { slug: next.slug, title: next.title, order: next.order } : null,
        total: work.chapters.length,
        current: chapterIndex + 1,
      },
      toc: work.chapters.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        order: c.order,
      })),
    };
  }
}
