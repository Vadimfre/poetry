-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Favorite_poemId_createdAt_idx" ON "Favorite"("poemId", "createdAt");

-- CreateIndex
CREATE INDEX "Like_userId_createdAt_idx" ON "Like"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Like_poemId_createdAt_idx" ON "Like"("poemId", "createdAt");

-- CreateIndex
CREATE INDEX "Poem_likesCount_idx" ON "Poem"("likesCount");

-- CreateIndex
CREATE INDEX "Poem_favoritesCount_idx" ON "Poem"("favoritesCount");

-- CreateIndex
CREATE INDEX "Poem_likesCount_favoritesCount_idx" ON "Poem"("likesCount", "favoritesCount");
