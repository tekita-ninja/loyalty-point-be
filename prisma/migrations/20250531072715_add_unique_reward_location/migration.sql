/*
  Warnings:

  - A unique constraint covering the columns `[rewardId,locationId]` on the table `reward_location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reward_location_rewardId_locationId_key" ON "reward_location"("rewardId", "locationId");
