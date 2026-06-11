/**
 * Fix MATCH quizzes where all draggable authors (or zones) repeat the same text.
 * Run: npx ts-node prisma/fix-quiz-match-links.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function hasUniformContent(values: string[]): boolean {
  return values.length > 1 && values.every((value) => value === values[0]);
}

async function main() {
  const questions = await prisma.question.findMany({
    where: { type: "MATCH" },
    include: { items: true, zones: true },
  });

  let fixed = 0;

  for (const question of questions) {
    const flexible =
      hasUniformContent(question.items.map((item) => item.content)) ||
      hasUniformContent(question.zones.map((zone) => zone.content));

    if (!flexible) continue;

    await prisma.itemZone.deleteMany({
      where: {
        OR: [
          { item: { questionId: question.id } },
          { zone: { questionId: question.id } },
        ],
      },
    });

    for (const item of question.items) {
      for (const zone of question.zones) {
        await prisma.itemZone.create({
          data: {
            itemId: item.id,
            zoneId: zone.id,
            isCorrect: true,
          },
        });
      }
    }

    fixed++;
  }

  console.log(`Fixed ${fixed} MATCH questions with duplicate labels`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
