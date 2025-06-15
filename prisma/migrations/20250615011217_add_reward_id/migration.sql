/*
  Warnings:

  - You are about to drop the `master_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "customer_point" DROP CONSTRAINT "customer_point_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "master_transactions" DROP CONSTRAINT "master_transactions_locationId_fkey";

-- DropForeignKey
ALTER TABLE "master_transactions" DROP CONSTRAINT "master_transactions_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "master_transactions" DROP CONSTRAINT "master_transactions_userId_fkey";

-- DropTable
DROP TABLE "master_transactions";

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL,
    "cutPoint" INTEGER NOT NULL,
    "expired" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "master_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "master_rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_point" ADD CONSTRAINT "customer_point_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
