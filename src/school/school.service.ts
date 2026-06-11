import { Injectable, NotFoundException } from "@nestjs/common";
import {
  localizePoems,
  localizeProseWorks,
} from "../i18n/content-localizer";
import { restrictPoemsContentForGuest } from "../lib/poem-guest-access";
import { PrismaService } from "../prisma/prisma.service";
import { CurriculumKind } from "@prisma/client";

const GRADES = [5, 6, 7, 8, 9, 10, 11] as const;

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaService) {}

  async getGradesOverview() {
    const [poemCounts, proseCounts, memorizeCounts] = await Promise.all([
      this.prisma.poemSchoolGrade.groupBy({
        by: ["grade"],
        _count: { poemId: true },
      }),
      this.prisma.proseWorkSchoolGrade.groupBy({
        by: ["grade"],
        _count: { proseWorkId: true },
      }),
      this.prisma.poemSchoolGrade.groupBy({
        by: ["grade"],
        where: { kind: CurriculumKind.MEMORIZE },
        _count: { poemId: true },
      }),
    ]);

    const poemMap = Object.fromEntries(
      poemCounts.map((r) => [r.grade, r._count.poemId]),
    );
    const proseMap = Object.fromEntries(
      proseCounts.map((r) => [r.grade, r._count.proseWorkId]),
    );
    const memMap = Object.fromEntries(
      memorizeCounts.map((r) => [r.grade, r._count.poemId]),
    );

    return {
      grades: GRADES.map((grade) => ({
        grade,
        poemCount: poemMap[grade] ?? 0,
        proseCount: proseMap[grade] ?? 0,
        memorizeCount: memMap[grade] ?? 0,
      })),
    };
  }

  async getGradeCurriculum(grade: number, userId?: number) {
    if (!GRADES.includes(grade as (typeof GRADES)[number])) {
      throw new NotFoundException("Grade not found");
    }

    const [poemLinks, proseLinks] = await Promise.all([
      this.prisma.poemSchoolGrade.findMany({
        where: { grade },
        include: {
          poem: {
            include: {
              author: true,
              categories: true,
              _count: { select: { favorites: true, comments: true } },
            },
          },
        },
        orderBy: [{ kind: "asc" }, { poem: { title: "asc" } }],
      }),
      this.prisma.proseWorkSchoolGrade.findMany({
        where: { grade },
        include: {
          proseWork: {
            include: {
              author: true,
              _count: { select: { chapters: true } },
            },
          },
        },
        orderBy: [{ kind: "asc" }, { proseWork: { title: "asc" } }],
      }),
    ]);

    const byKind = (kind: CurriculumKind) =>
      restrictPoemsContentForGuest(
        localizePoems(poemLinks.filter((l) => l.kind === kind).map((l) => l.poem)),
        userId,
      );

    const proseByKind = (kind: CurriculumKind) =>
      localizeProseWorks(
        proseLinks
          .filter((l) => l.kind === kind)
          .map((l) => l.proseWork),
      ).map((w) => ({
        ...w,
        chapterCount:
          (w as { _count?: { chapters: number } })._count?.chapters ?? 0,
      }));

    return {
      grade,
      study: byKind(CurriculumKind.STUDY),
      memorize: byKind(CurriculumKind.MEMORIZE),
      discussion: byKind(CurriculumKind.DISCUSSION),
      extra: byKind(CurriculumKind.EXTRA),
      prose: {
        study: proseByKind(CurriculumKind.STUDY),
        memorize: proseByKind(CurriculumKind.MEMORIZE),
        discussion: proseByKind(CurriculumKind.DISCUSSION),
        extra: proseByKind(CurriculumKind.EXTRA),
      },
      totals: {
        poems: poemLinks.length,
        prose: proseLinks.length,
      },
    };
  }
}
