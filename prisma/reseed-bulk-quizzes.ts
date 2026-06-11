/**
 * Пересоздаёт bulk-квизы с нормальными MATCH-заданиями (разные аўтары).
 * Run: npx ts-node prisma/reseed-bulk-quizzes.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import {
  deleteQuizzesExcept,
  type AuthorRefs,
} from "./lib/quiz-seed-helpers";
import { seedBulkQuizzes } from "./seed";

const FEATURED_QUIZ_TITLES = [
  "Аўтар і твор",
  "Храналогія паэтаў",
  "Устаў пропушчанае слова",
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const authors = await prisma.author.findMany({
    select: { id: true, name: true, birthYear: true },
  });

  const authorRefs: AuthorRefs = {};
  for (const author of authors) {
    authorRefs[author.name] = {
      id: author.id,
      name: author.name,
      birthYear: author.birthYear,
    };
  }

  const deleted = await deleteQuizzesExcept(prisma, FEATURED_QUIZ_TITLES);
  console.log(`Removed ${deleted} bulk quizzes`);

  await seedBulkQuizzes(authorRefs);
  console.log("Recreated bulk quizzes with mixed-author MATCH tasks");
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
