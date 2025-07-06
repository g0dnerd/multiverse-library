/*
  Warnings:

  - You are about to drop the column `scryfallUrl` on the `Card` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Card_scryfallUrl_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "scryfallUrl";
