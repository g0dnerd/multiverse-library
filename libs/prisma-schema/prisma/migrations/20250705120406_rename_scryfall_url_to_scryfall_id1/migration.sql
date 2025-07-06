/*
  Warnings:

  - A unique constraint covering the columns `[scryfallId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "scryfallId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Card_scryfallId_key" ON "Card"("scryfallId");

-- CreateIndex
CREATE INDEX "Card_scryfallId_idx" ON "Card"("scryfallId");
