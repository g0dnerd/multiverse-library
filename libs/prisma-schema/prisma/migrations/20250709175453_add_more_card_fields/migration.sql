-- CreateEnum
CREATE TYPE "Color" AS ENUM ('WHITE', 'BLUE', 'BLACK', 'RED', 'GREEN');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "colors" "Color"[],
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "manaValue" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "types" TEXT[];
