/*
  Warnings:

  - A unique constraint covering the columns `[scryfallUrl]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "backFaceImg" TEXT,
ADD COLUMN     "frontFaceImg" TEXT,
ADD COLUMN     "isDoubleFaced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scryfallUrl" TEXT NOT NULL DEFAULT 'fo';

-- CreateIndex
CREATE UNIQUE INDEX "Card_scryfallUrl_key" ON "Card"("scryfallUrl");
