/*
  Warnings:

  - You are about to drop the `TransactionLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TransactionLog" DROP CONSTRAINT "TransactionLog_customerPointId_fkey";

-- DropTable
DROP TABLE "TransactionLog";

-- CreateTable
CREATE TABLE "transaction_logs" (
    "id" TEXT NOT NULL,
    "customerPointId" TEXT NOT NULL,
    "oldPoints" INTEGER NOT NULL,
    "newPoints" INTEGER NOT NULL,
    "pointDifference" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "transaction_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_customerPointId_fkey" FOREIGN KEY ("customerPointId") REFERENCES "customer_point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
