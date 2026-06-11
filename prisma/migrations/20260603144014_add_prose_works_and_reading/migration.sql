-- CreateEnum
CREATE TYPE "ProseKind" AS ENUM ('NOVEL', 'POEM', 'STORY', 'PLAY');

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "proseWorkId" INTEGER;

-- CreateTable
CREATE TABLE "ProseWork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "ProseKind" NOT NULL DEFAULT 'NOVEL',
    "description" TEXT,
    "i18n" JSONB,
    "authorId" INTEGER NOT NULL,
    "year" INTEGER,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProseWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProseChapter" (
    "id" SERIAL NOT NULL,
    "proseWorkId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "i18n" JSONB,

    CONSTRAINT "ProseChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingAssignment" (
    "id" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "proseWorkId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "lastChapterId" INTEGER,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProseWork_slug_key" ON "ProseWork"("slug");

-- CreateIndex
CREATE INDEX "ProseWork_authorId_idx" ON "ProseWork"("authorId");

-- CreateIndex
CREATE INDEX "ProseChapter_proseWorkId_idx" ON "ProseChapter"("proseWorkId");

-- CreateIndex
CREATE UNIQUE INDEX "ProseChapter_proseWorkId_slug_key" ON "ProseChapter"("proseWorkId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProseChapter_proseWorkId_order_key" ON "ProseChapter"("proseWorkId", "order");

-- CreateIndex
CREATE INDEX "ReadingAssignment_classroomId_idx" ON "ReadingAssignment"("classroomId");

-- CreateIndex
CREATE INDEX "ReadingAssignment_proseWorkId_idx" ON "ReadingAssignment"("proseWorkId");

-- CreateIndex
CREATE INDEX "ReadingAssignment_status_idx" ON "ReadingAssignment"("status");

-- CreateIndex
CREATE INDEX "ReadingProgress_studentId_idx" ON "ReadingProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_assignmentId_studentId_key" ON "ReadingProgress"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "Quiz_proseWorkId_idx" ON "Quiz"("proseWorkId");

-- AddForeignKey
ALTER TABLE "ProseWork" ADD CONSTRAINT "ProseWork_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProseChapter" ADD CONSTRAINT "ProseChapter_proseWorkId_fkey" FOREIGN KEY ("proseWorkId") REFERENCES "ProseWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_proseWorkId_fkey" FOREIGN KEY ("proseWorkId") REFERENCES "ProseWork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingAssignment" ADD CONSTRAINT "ReadingAssignment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingAssignment" ADD CONSTRAINT "ReadingAssignment_proseWorkId_fkey" FOREIGN KEY ("proseWorkId") REFERENCES "ProseWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ReadingAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_lastChapterId_fkey" FOREIGN KEY ("lastChapterId") REFERENCES "ProseChapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
