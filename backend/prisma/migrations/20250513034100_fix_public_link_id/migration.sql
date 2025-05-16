/*
  Warnings:

  - Made the column `publicLinkId` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "publicLinkId" SET NOT NULL;
