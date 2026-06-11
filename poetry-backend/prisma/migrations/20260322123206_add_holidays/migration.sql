/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Poem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Season" AS ENUM ('WINTER', 'SPRING', 'SUMMER', 'AUTUMN');

-- DropForeignKey
ALTER TABLE "Poem" DROP CONSTRAINT "Poem_categoryId_fkey";

-- DropIndex
DROP INDEX "Poem_categoryId_idx";

-- AlterTable
ALTER TABLE "Poem" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PoemCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PoemCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_HolidayPoems" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HolidayPoems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_slug_key" ON "Holiday"("slug");

-- CreateIndex
CREATE INDEX "Holiday_month_day_idx" ON "Holiday"("month", "day");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_day_month_slug_key" ON "Holiday"("day", "month", "slug");

-- CreateIndex
CREATE INDEX "_PoemCategories_B_index" ON "_PoemCategories"("B");

-- CreateIndex
CREATE INDEX "_HolidayPoems_B_index" ON "_HolidayPoems"("B");

-- AddForeignKey
ALTER TABLE "_PoemCategories" ADD CONSTRAINT "_PoemCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PoemCategories" ADD CONSTRAINT "_PoemCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Poem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HolidayPoems" ADD CONSTRAINT "_HolidayPoems_A_fkey" FOREIGN KEY ("A") REFERENCES "Holiday"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HolidayPoems" ADD CONSTRAINT "_HolidayPoems_B_fkey" FOREIGN KEY ("B") REFERENCES "Poem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
