/*
  Warnings:

  - You are about to drop the column `rankingId` on the `master_promotions` table. All the data in the column will be lost.
  - You are about to drop the `CustomerPoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `master_rewards` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `master_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `master_location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `master_rule_points` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `master_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomerPoint" DROP CONSTRAINT "CustomerPoint_rulePointId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerPoint" DROP CONSTRAINT "CustomerPoint_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "master_promotions" DROP CONSTRAINT "master_promotions_rankingId_fkey";

-- DropForeignKey
ALTER TABLE "master_rewards" DROP CONSTRAINT "master_rewards_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "master_rewards" DROP CONSTRAINT "master_rewards_locationId_fkey";

-- DropForeignKey
ALTER TABLE "master_transactions" DROP CONSTRAINT "master_transactions_rewardId_fkey";

-- AlterTable
ALTER TABLE "master_categories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "master_location" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "master_promotions" DROP COLUMN "rankingId";

-- AlterTable
ALTER TABLE "master_rule_points" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "master_transactions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

-- DropTable
DROP TABLE "CustomerPoint";

-- DropTable
DROP TABLE "master_rewards";

-- CreateTable
CREATE TABLE "PromotionRanking" (
    "id" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "PromotionRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardLocation" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "RewardLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_location" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "urlPicture" VARCHAR(100) NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "reward_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_point" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rulePointId" TEXT,
    "transactionId" TEXT,
    "note" VARCHAR(255) NOT NULL,
    "price" DECIMAL(15,2),
    "point" INTEGER NOT NULL,
    "expired" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "customer_point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_point_transactionId_key" ON "customer_point"("transactionId");

-- AddForeignKey
ALTER TABLE "PromotionRanking" ADD CONSTRAINT "PromotionRanking_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "master_ranking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionRanking" ADD CONSTRAINT "PromotionRanking_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "master_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLocation" ADD CONSTRAINT "RewardLocation_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "reward_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLocation" ADD CONSTRAINT "RewardLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "master_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_location" ADD CONSTRAINT "reward_location_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "master_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_transactions" ADD CONSTRAINT "master_transactions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "reward_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_point" ADD CONSTRAINT "customer_point_rulePointId_fkey" FOREIGN KEY ("rulePointId") REFERENCES "master_rule_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_point" ADD CONSTRAINT "customer_point_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "master_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
