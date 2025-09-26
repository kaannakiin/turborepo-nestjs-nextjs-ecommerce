/*
  Warnings:

  - You are about to drop the column `stateId` on the `City` table. All the data in the column will be lost.
  - You are about to drop the `CityTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StateTranslation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."City" DROP CONSTRAINT "City_stateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CityTranslation" DROP CONSTRAINT "CityTranslation_cityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StateTranslation" DROP CONSTRAINT "StateTranslation_stateId_fkey";

-- DropIndex
DROP INDEX "public"."City_countryId_stateId_idx";

-- DropIndex
DROP INDEX "public"."City_stateId_idx";

-- DropIndex
DROP INDEX "public"."City_stateId_name_idx";

-- AlterTable
ALTER TABLE "public"."City" DROP COLUMN "stateId";

-- DropTable
DROP TABLE "public"."CityTranslation";

-- DropTable
DROP TABLE "public"."StateTranslation";

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
