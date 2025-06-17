/*
  Warnings:

  - Added the required column `endDate` to the `master_rewards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `master_rewards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `master_rewards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_rewards" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isLimited" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL;
