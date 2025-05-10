-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'PENDING';
