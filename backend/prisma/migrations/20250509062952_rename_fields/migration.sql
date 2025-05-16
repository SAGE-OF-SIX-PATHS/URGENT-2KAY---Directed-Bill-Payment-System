/*
  Warnings:

  - You are about to drop the column `category` on the `Bill` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "category";

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");
