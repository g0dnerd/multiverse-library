-- CreateEnum
CREATE TYPE "BulkDataType" AS ENUM ('ORACLE_CARDS', 'UNIQUE_ARTWORK', 'DEFAULT_CARDS', 'ALL_CARDS', 'RULINGS');

-- CreateTable
CREATE TABLE "BulkUrl" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "bulkDataType" "BulkDataType" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkUrl_pkey" PRIMARY KEY ("id")
);
