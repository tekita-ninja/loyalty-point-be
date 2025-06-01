/*
  Warnings:

  - Added the required column `urlPicture` to the `master_promotions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_promotions" ADD COLUMN     "urlPicture" VARCHAR(255) NOT NULL;
