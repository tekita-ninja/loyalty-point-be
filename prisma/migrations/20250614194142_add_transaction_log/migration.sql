-- CreateTable
CREATE TABLE "TransactionLog" (
    "id" TEXT NOT NULL,
    "customerPointId" TEXT NOT NULL,
    "oldPoints" INTEGER NOT NULL,
    "newPoints" INTEGER NOT NULL,
    "pointDifference" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,

    CONSTRAINT "TransactionLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransactionLog" ADD CONSTRAINT "TransactionLog_customerPointId_fkey" FOREIGN KEY ("customerPointId") REFERENCES "customer_point"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
