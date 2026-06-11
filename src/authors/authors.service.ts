import {
  localizeAuthor,
  localizeAuthors,
  localizeCategory,
  localizePoems,
  localizeProseWorks,
} from "@/i18n/content-localizer";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const authors = await this.prisma.author.findMany({
      include: {
        _count: { select: { poems: true } },
      },
      orderBy: { name: "asc" },
    });
    return localizeAuthors(authors);
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { poems: true },
    });
    if (!author) throw new NotFoundException("Author not found");
    return {
      ...localizeAuthor(author),
      poems: localizePoems(author.poems),
    };
  }

  async findBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: {
        poems: {
          include: { categories: true },
          orderBy: { year: "asc" },
        },
        proseWorks: {
          include: { _count: { select: { chapters: true } } },
          orderBy: { year: "asc" },
        },
      },
    });
    if (!author) throw new NotFoundException("Author not found");
    return {
      ...localizeAuthor(author),
      poems: localizePoems(author.poems).map((poem) => ({
        ...poem,
        category: poem.categories?.[0]
          ? localizeCategory(poem.categories[0] as Record<string, unknown>)
          : null,
      })),
      proseWorks: localizeProseWorks(author.proseWorks).map((w) => ({
        id: w.id,
        title: w.title,
        slug: w.slug,
        kind: (w as { kind?: string }).kind,
        year: (w as { year?: number | null }).year,
        description: (w as { description?: string | null }).description,
        chapterCount:
          (w as { _count?: { chapters: number } })._count?.chapters ?? 0,
      })),
    };
  }
}
