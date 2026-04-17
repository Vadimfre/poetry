-- CreateIndex
CREATE INDEX "Item_questionId_idx" ON "Item"("questionId");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Zone_questionId_idx" ON "Zone"("questionId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_correctZoneId_fkey" FOREIGN KEY ("correctZoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
