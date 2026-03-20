/*
  Warnings:

  - You are about to drop the column `author` on the `Poem` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Poem` table. All the data in the column will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Poem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Poem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Poem" DROP CONSTRAINT "Poem_collectionId_fkey";

-- DropIndex
DROP INDEX "Poem_collectionId_idx";

-- AlterTable
ALTER TABLE "Poem" DROP COLUMN "author",
DROP COLUMN "collectionId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "Collection";

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "Poem_categoryId_idx" ON "Poem"("categoryId");

-- CreateIndex
CREATE INDEX "Poem_authorId_idx" ON "Poem"("authorId");

-- AddForeignKey
ALTER TABLE "Poem" ADD CONSTRAINT "Poem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poem" ADD CONSTRAINT "Poem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
