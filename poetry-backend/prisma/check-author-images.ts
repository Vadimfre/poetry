import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const authors = await prisma.author.findMany({
    select: { slug: true, name: true, image: true },
    orderBy: { name: "asc" },
  });
  const noImage = authors.filter((a) => !a.image);
  const withImage = authors.filter((a) => a.image);
  console.log(`Total: ${authors.length}, with image: ${withImage.length}, no image: ${noImage.length}`);
  if (noImage.length) {
    console.log("\nNo image:");
    noImage.forEach((a) => console.log(`  ${a.slug} - ${a.name}`));
  }
  console.log("\nSample images:");
  withImage.slice(0, 5).forEach((a) => console.log(`  ${a.slug}: ${a.image?.slice(0, 80)}...`));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
