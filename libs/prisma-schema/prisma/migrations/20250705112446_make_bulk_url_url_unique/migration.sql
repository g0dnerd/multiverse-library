/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `BulkUrl` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BulkUrl_url_key" ON "BulkUrl"("url");
