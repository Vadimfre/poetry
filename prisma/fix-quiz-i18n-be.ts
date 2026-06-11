/**
 * Backfill i18n.be from scalar columns for quizzes (fixes EN showing on BE/RU UI).
 * Run: npx ts-node prisma/fix-quiz-i18n-be.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type I18nJson = Record<string, Record<string, string>>;

function withBe(
  existing: I18nJson | null,
  be: Record<string, string>,
): I18nJson {
  return { ...(existing ?? {}), be: { ...be, ...(existing?.be ?? {}) } };
}

async function main() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      questions: { include: { items: true, zones: true } },
    },
  });

  let n = 0;
  for (const quiz of quizzes) {
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        i18n: withBe(quiz.i18n as I18nJson | null, {
          title: quiz.title,
          description: quiz.description ?? "",
        }),
      },
    });
    n++;

    for (const q of quiz.questions) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          i18n: withBe(q.i18n as I18nJson | null, { text: q.text }),
        },
      });
      n++;

      for (const item of q.items) {
        await prisma.item.update({
          where: { id: item.id },
          data: {
            i18n: withBe(item.i18n as I18nJson | null, {
              content: item.content,
              subtitle: item.subtitle ?? "",
            }),
          },
        });
        n++;
      }

      for (const zone of q.zones) {
        await prisma.zone.update({
          where: { id: zone.id },
          data: {
            i18n: withBe(zone.i18n as I18nJson | null, {
              content: zone.content,
            }),
          },
        });
        n++;
      }
    }
  }

  console.log(`✅ Quiz i18n.be backfilled for ${quizzes.length} quizzes (${n} rows)`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
