/*
  Warnings:

  - A unique constraint covering the columns `[publicLinkId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "publicLinkId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Request_publicLinkId_key" ON "Request"("publicLinkId");
