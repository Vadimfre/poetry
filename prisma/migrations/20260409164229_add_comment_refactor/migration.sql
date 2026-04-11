-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropIndex
DROP INDEX "Comment_poemId_idx";

-- DropIndex
DROP INDEX "Comment_userId_idx";

-- CreateIndex
CREATE INDEX "Comment_poemId_createdAt_idx" ON "Comment"("poemId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_userId_createdAt_idx" ON "Comment"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
