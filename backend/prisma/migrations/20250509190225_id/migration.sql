/*
  Warnings:

  - Made the column `dueDate` on table `Bill` required. This step will fail if there are existing NULL values in that column.
  - Made the column `providerId` on table `Bill` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_providerId_fkey";

-- AlterTable
ALTER TABLE "Bill" ALTER COLUMN "dueDate" SET NOT NULL,
ALTER COLUMN "providerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
