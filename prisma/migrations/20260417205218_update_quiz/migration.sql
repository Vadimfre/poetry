/*
  Warnings:

  - You are about to drop the column `correctZoneId` on the `Item` table. All the data in the column will be lost.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MATCH', 'ORDER', 'FILL');

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_correctZoneId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "correctZoneId",
ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "type" "QuestionType" NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "order" INTEGER;

-- CreateTable
CREATE TABLE "ItemZone" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,

    CONSTRAINT "ItemZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "zoneId" TEXT,
    "order" INTEGER,
    "isCorrect" BOOLEAN,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemZone_itemId_idx" ON "ItemZone"("itemId");

-- CreateIndex
CREATE INDEX "ItemZone_zoneId_idx" ON "ItemZone"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemZone_itemId_zoneId_key" ON "ItemZone"("itemId", "zoneId");

-- AddForeignKey
ALTER TABLE "ItemZone" ADD CONSTRAINT "ItemZone_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemZone" ADD CONSTRAINT "ItemZone_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
