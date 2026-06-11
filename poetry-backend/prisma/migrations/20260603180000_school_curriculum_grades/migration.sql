-- CreateEnum
CREATE TYPE "CurriculumKind" AS ENUM ('STUDY', 'MEMORIZE', 'DISCUSSION', 'EXTRA');

-- CreateTable
CREATE TABLE "PoemSchoolGrade" (
    "poemId" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL,
    "kind" "CurriculumKind" NOT NULL DEFAULT 'STUDY',

    CONSTRAINT "PoemSchoolGrade_pkey" PRIMARY KEY ("poemId","grade","kind")
);

-- CreateTable
CREATE TABLE "ProseWorkSchoolGrade" (
    "proseWorkId" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL,
    "kind" "CurriculumKind" NOT NULL DEFAULT 'STUDY',

    CONSTRAINT "ProseWorkSchoolGrade_pkey" PRIMARY KEY ("proseWorkId","grade","kind")
);

-- CreateIndex
CREATE INDEX "PoemSchoolGrade_grade_idx" ON "PoemSchoolGrade"("grade");

-- CreateIndex
CREATE INDEX "PoemSchoolGrade_grade_kind_idx" ON "PoemSchoolGrade"("grade", "kind");

-- CreateIndex
CREATE INDEX "ProseWorkSchoolGrade_grade_idx" ON "ProseWorkSchoolGrade"("grade");

-- CreateIndex
CREATE INDEX "ProseWorkSchoolGrade_grade_kind_idx" ON "ProseWorkSchoolGrade"("grade", "kind");

-- AddForeignKey
ALTER TABLE "PoemSchoolGrade" ADD CONSTRAINT "PoemSchoolGrade_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "Poem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProseWorkSchoolGrade" ADD CONSTRAINT "ProseWorkSchoolGrade_proseWorkId_fkey" FOREIGN KEY ("proseWorkId") REFERENCES "ProseWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
