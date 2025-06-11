/*
  Warnings:

  - You are about to drop the column `point` on the `master_rule_points` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `master_rule_points` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "master_rule_points" DROP COLUMN "point",
DROP COLUMN "price";
