/*
  Warnings:

  - Added the required column `type` to the `customer_point` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customer_point" ADD COLUMN     "isCancel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" INTEGER NOT NULL;
