/*
  Warnings:

  - You are about to drop the column `stock` on the `master_rewards` table. All the data in the column will be lost.
  - Added the required column `stocks` to the `master_rewards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_rewards" DROP COLUMN "stock",
ADD COLUMN     "stocks" INTEGER NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL;
