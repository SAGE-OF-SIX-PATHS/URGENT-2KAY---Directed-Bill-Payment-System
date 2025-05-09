/*
  Warnings:

  - You are about to drop the column `description` on the `Bill` table. All the data in the column will be lost.
  - Added the required column `billName` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "description",
ADD COLUMN     "billName" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_BillSponsors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BillSponsors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BillSponsors_B_index" ON "_BillSponsors"("B");

-- AddForeignKey
ALTER TABLE "_BillSponsors" ADD CONSTRAINT "_BillSponsors_A_fkey" FOREIGN KEY ("A") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BillSponsors" ADD CONSTRAINT "_BillSponsors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
