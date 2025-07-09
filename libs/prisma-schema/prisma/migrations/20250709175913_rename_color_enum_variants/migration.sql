/*
  Warnings:

  - The values [WHITE,BLUE,BLACK,RED,GREEN] on the enum `Color` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Color_new" AS ENUM ('W', 'U', 'B', 'R', 'G');
ALTER TABLE "Card" ALTER COLUMN "colors" TYPE "Color_new"[] USING ("colors"::text::"Color_new"[]);
ALTER TYPE "Color" RENAME TO "Color_old";
ALTER TYPE "Color_new" RENAME TO "Color";
DROP TYPE "Color_old";
COMMIT;
