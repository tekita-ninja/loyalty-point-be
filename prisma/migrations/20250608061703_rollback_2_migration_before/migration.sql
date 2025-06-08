/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `TempUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isPhoneVerified` to the `TempUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TempUser" ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TempUser_phone_key" ON "TempUser"("phone");
