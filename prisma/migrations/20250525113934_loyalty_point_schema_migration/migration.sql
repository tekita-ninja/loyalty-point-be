/*
  Warnings:

  - You are about to drop the column `fullname` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birthDate` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstname` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_parentId_fkey";

-- DropForeignKey
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_menuId_fkey";

-- DropForeignKey
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_roleId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_roleId_fkey";

-- DropIndex
DROP INDEX "users_email_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullname",
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "firstname" VARCHAR(100) NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "lastname" VARCHAR(100) NOT NULL,
ADD COLUMN     "phone" VARCHAR(100) NOT NULL,
ADD COLUMN     "rankingId" TEXT,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100);

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "master_roles" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_permissions" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "method" VARCHAR(64) NOT NULL,
    "path" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_menus" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isGroup" BOOLEAN DEFAULT false,
    "icon" TEXT,
    "path" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_ranking" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "minPoints" INTEGER NOT NULL,
    "minSpendings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_benefits" (
    "id" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,
    "benefitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "ranking_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_benefits" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_promotions" (
    "id" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isPush" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedBy" TEXT,

    CONSTRAINT "master_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "master_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_location" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "master_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_rewards" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "urlPicture" VARCHAR(100) NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "master_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_transactions" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" VARCHAR(255) NOT NULL,
    "status" INTEGER NOT NULL,
    "cutPoint" INTEGER NOT NULL,
    "expired" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_rule_points" (
    "id" TEXT NOT NULL,
    "multiplier" DECIMAL(10,6) NOT NULL,
    "point" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "isActive" INTEGER NOT NULL,

    CONSTRAINT "master_rule_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rulePointId" TEXT,
    "transactionId" TEXT,
    "note" VARCHAR(255) NOT NULL,
    "price" DECIMAL(15,2),
    "point" INTEGER NOT NULL,
    "expired" TIMESTAMP(3),

    CONSTRAINT "CustomerPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_permissions_code_key" ON "master_permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPoint_transactionId_key" ON "CustomerPoint"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_firstname_lastname_email_phone_idx" ON "users"("firstname", "lastname", "email", "phone");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "master_ranking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "master_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "master_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "master_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_menus" ADD CONSTRAINT "master_menus_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "master_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "master_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "master_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_benefits" ADD CONSTRAINT "ranking_benefits_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "master_ranking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_benefits" ADD CONSTRAINT "ranking_benefits_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "master_benefits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_promotions" ADD CONSTRAINT "master_promotions_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "master_ranking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rewards" ADD CONSTRAINT "master_rewards_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "master_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_rewards" ADD CONSTRAINT "master_rewards_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "master_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_transactions" ADD CONSTRAINT "master_transactions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "master_rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_transactions" ADD CONSTRAINT "master_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPoint" ADD CONSTRAINT "CustomerPoint_rulePointId_fkey" FOREIGN KEY ("rulePointId") REFERENCES "master_rule_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPoint" ADD CONSTRAINT "CustomerPoint_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "master_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
