-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "View" ADD COLUMN     "ip" TEXT;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
