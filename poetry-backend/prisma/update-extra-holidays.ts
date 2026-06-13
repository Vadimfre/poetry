import { PrismaClient, Season } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { extraLiteraryEvents } from "./data/extra-literary-events";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getSeason(month: number): Season {
  if (month === 12 || month <= 2) return Season.WINTER;
  if (month >= 3 && month <= 5) return Season.SPRING;
  if (month >= 6 && month <= 8) return Season.SUMMER;
  return Season.AUTUMN;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яёўі0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function getSeasonImage(month: number): string {
  if (month === 12 || month <= 2) return "/images/seasons/winter.jpg";
  if (month >= 3 && month <= 5) return "/images/seasons/spring.jpg";
  if (month >= 6 && month <= 8) return "/images/seasons/summer.jpg";
  return "/images/seasons/autumn.jpg";
}

async function main() {
  let count = 0;
  for (const event of extraLiteraryEvents) {
    const slug = createSlug(event.name);
    const season = getSeason(event.month);
    const poemRecords = await prisma.poem.findMany({
      where: { title: { in: event.poems } },
      select: { id: true },
    });

    await prisma.holiday.upsert({
      where: { slug },
      update: {
        name: event.name,
        day: event.day,
        month: event.month,
        season,
        image: getSeasonImage(event.month),
        description: event.description,
        poems: { set: poemRecords.map((p) => ({ id: p.id })) },
      },
      create: {
        name: event.name,
        slug,
        day: event.day,
        month: event.month,
        season,
        image: getSeasonImage(event.month),
        description: event.description,
        poems: { connect: poemRecords.map((p) => ({ id: p.id })) },
      },
    });
    count += 1;
  }
  console.log(`Upserted ${count} extra literary events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
