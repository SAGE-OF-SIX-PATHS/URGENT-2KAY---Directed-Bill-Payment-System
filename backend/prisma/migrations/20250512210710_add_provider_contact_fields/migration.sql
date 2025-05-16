/*
  Warnings:

  - You are about to drop the column `priority` on the `Request` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "priority";

-- CreateIndex
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");
