/*
  Warnings:

  - You are about to drop the column `ip` on the `View` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[poemId,userId,date]` on the table `View` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[poemId,ipHash,date]` on the table `View` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "View" DROP COLUMN "ip";

-- CreateIndex
CREATE UNIQUE INDEX "View_poemId_userId_date_key" ON "View"("poemId", "userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "View_poemId_ipHash_date_key" ON "View"("poemId", "ipHash", "date");
