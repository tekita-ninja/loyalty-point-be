/*
  Warnings:

  - You are about to drop the column `categoryId` on the `reward_location` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `reward_location` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `reward_location` table. All the data in the column will be lost.
  - You are about to drop the column `urlPicture` on the `reward_location` table. All the data in the column will be lost.
  - You are about to drop the `PromotionRanking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RewardLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `master_location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ranking_benefits` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `locationId` to the `reward_location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rewardId` to the `reward_location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PromotionRanking" DROP CONSTRAINT "PromotionRanking_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionRanking" DROP CONSTRAINT "PromotionRanking_rankingId_fkey";

-- DropForeignKey
ALTER TABLE "RewardLocation" DROP CONSTRAINT "RewardLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "RewardLocation" DROP CONSTRAINT "RewardLocation_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "master_transactions" DROP CONSTRAINT "master_transactions_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "ranking_benefits" DROP CONSTRAINT "ranking_benefits_benefitId_fkey";

-- DropForeignKey
ALTER TABLE "ranking_benefits" DROP CONSTRAINT "ranking_benefits_rankingId_fkey";

-- DropForeignKey
ALTER TABLE "reward_location" DROP CONSTRAINT "reward_location_categoryId_fkey";

-- AlterTable
ALTER TABLE "reward_location" DROP COLUMN "categoryId",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "urlPicture",
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "rewardId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PromotionRanking";

-- DropTable
DROP TABLE "RewardLocation";

-- DropTable
DROP TABLE "master_location";

-- DropTable
DROP TABLE "ranking_benefits";

-- CreateTable
CREATE TABLE "ranking_benefit" (
    "id" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "ranking_benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_ranking" (
    "id" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "promotion_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_locations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_rewards" (
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

    CONSTRAINT "master_rewards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ranking_benefit" ADD CONSTRAINT "ranking_benefit_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "master_ranking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_benefit" ADD CONSTRAINT "ranking_benefit_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "master_benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_ranking" ADD CONSTRAINT "promotion_ranking_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "master_ranking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_ranking" ADD CONSTRAINT "promotion_ranking_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "master_promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_location" ADD CONSTRAINT "reward_location_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "master_rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_location" ADD CONSTRAINT "reward_location_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "master_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rewards" ADD CONSTRAINT "master_rewards_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "master_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_transactions" ADD CONSTRAINT "master_transactions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "master_rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
