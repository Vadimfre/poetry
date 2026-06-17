import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const readingProgress = await prisma.readingProgress.deleteMany();
  const readingAssignments = await prisma.readingAssignment.deleteMany();
  const schoolGrades = await prisma.proseWorkSchoolGrade.deleteMany();
  const chapters = await prisma.proseChapter.deleteMany();
  const works = await prisma.proseWork.deleteMany();

  console.log("Removed prose content:");
  console.log(`  ReadingProgress: ${readingProgress.count}`);
  console.log(`  ReadingAssignment: ${readingAssignments.count}`);
  console.log(`  ProseWorkSchoolGrade: ${schoolGrades.count}`);
  console.log(`  ProseChapter: ${chapters.count}`);
  console.log(`  ProseWork: ${works.count}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
