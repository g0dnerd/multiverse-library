/*
  Warnings:

  - Made the column `scryfallId` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "scryfallId" SET NOT NULL;
