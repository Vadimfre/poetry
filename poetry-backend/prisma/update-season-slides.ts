import { PrismaClient, Season } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEASON_IMAGES: Record<Season, string[]> = {
  WINTER: [
    "/images/seasons/winter-1.png",
    "/images/seasons/winter-2.png",
    "/images/seasons/winter-3.png",
  ],
  SPRING: [
    "/images/seasons/spring-1.png",
    "/images/seasons/spring-2.png",
    "/images/seasons/spring-3.png",
  ],
  SUMMER: [
    "/images/seasons/summer-1.png",
    "/images/seasons/summer-2.png",
    "/images/seasons/summer-3.png",
  ],
  AUTUMN: [
    "/images/seasons/autumn-1.png",
    "/images/seasons/autumn-2.png",
    "/images/seasons/autumn-3.png",
  ],
};

function buildSlides(season: Season) {
  return SEASON_IMAGES[season].map((imageUrl, index) => {
    return {
      title: season.toLowerCase(),
      subtitle: "",
      season,
      imageUrl,
      altText: `${season.toLowerCase()} ${index + 1}`,
      order: index + 1,
      isActive: true,
    };
  });
}

const seasonSlidesData = [
  ...buildSlides(Season.WINTER),
  ...buildSlides(Season.SPRING),
  ...buildSlides(Season.SUMMER),
  ...buildSlides(Season.AUTUMN),
];

async function main() {
  await prisma.seasonSlide.updateMany({
    where: { order: { gt: 3 } },
    data: { isActive: false },
  });

  for (const slide of seasonSlidesData) {
    await prisma.seasonSlide.upsert({
      where: { season_order: { season: slide.season, order: slide.order } },
      update: slide,
      create: slide,
    });
  }
  console.log(`Updated ${seasonSlidesData.length} season slides (curated images)`);
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
