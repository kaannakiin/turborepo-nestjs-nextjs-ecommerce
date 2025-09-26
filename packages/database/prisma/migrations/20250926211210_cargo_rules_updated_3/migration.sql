/*
  Warnings:

  - You are about to drop the column `cityId` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `stateId` on the `Location` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cargoZoneId,countryId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_cityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_stateId_fkey";

-- DropIndex
DROP INDEX "public"."Location_countryId_stateId_cityId_key";

-- AlterTable
ALTER TABLE "public"."Location" DROP COLUMN "cityId",
DROP COLUMN "stateId",
ADD COLUMN     "cityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "stateIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Location_cargoZoneId_countryId_key" ON "public"."Location"("cargoZoneId", "countryId");
