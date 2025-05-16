/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BillSponsors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_supporterId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_billId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "_BillSponsors" DROP CONSTRAINT "_BillSponsors_A_fkey";

-- DropForeignKey
ALTER TABLE "_BillSponsors" DROP CONSTRAINT "_BillSponsors_B_fkey";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "paymentMethod",
DROP COLUMN "requestId";

-- DropTable
DROP TABLE "Request";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "Wallet";

-- DropTable
DROP TABLE "_BillSponsors";
