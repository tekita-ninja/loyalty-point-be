/*
  Warnings:

  - A unique constraint covering the columns `[rulePointId]` on the table `master_ranking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "master_ranking" ADD COLUMN     "rulePointId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "master_ranking_rulePointId_key" ON "master_ranking"("rulePointId");

-- AddForeignKey
ALTER TABLE "master_ranking" ADD CONSTRAINT "master_ranking_rulePointId_fkey" FOREIGN KEY ("rulePointId") REFERENCES "master_rule_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
