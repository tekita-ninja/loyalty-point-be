-- AlterTable
ALTER TABLE "customer_point" ADD COLUMN     "isExpired" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "exprPoints" TIMESTAMP(3);
