/*
  Warnings:

  - Added the required column `locationId` to the `master_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "master_transactions" ADD COLUMN     "locationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "master_transactions" ADD CONSTRAINT "master_transactions_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "master_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
