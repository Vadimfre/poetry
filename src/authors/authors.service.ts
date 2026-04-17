import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.author.findMany({
      include: {
        _count: { select: { poems: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { poems: true },
    });
    if (!author) throw new NotFoundException("Author not found");
    return author;
  }

  async findBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: { poems: true },
    });
    if (!author) throw new NotFoundException("Author not found");
    return author;
  }
}
