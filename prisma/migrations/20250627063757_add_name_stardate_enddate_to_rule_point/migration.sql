/*
  Warnings:

  - You are about to drop the column `expired` on the `customer_point` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customer_point" DROP COLUMN "expired";

-- AlterTable
ALTER TABLE "master_rule_points" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "startDate" TIMESTAMP(3);
