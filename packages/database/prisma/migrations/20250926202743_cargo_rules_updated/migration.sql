/*
  Warnings:

  - You are about to drop the column `cityIds` on the `CargoRule` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `CargoRule` table. All the data in the column will be lost.
  - You are about to drop the column `stateIds` on the `CargoRule` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueId` on the `CargoRule` table. All the data in the column will be lost.
  - You are about to drop the `CountryCurrencyMap` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CargoRule" DROP CONSTRAINT "CargoRule_countryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CountryCurrencyMap" DROP CONSTRAINT "CountryCurrencyMap_countryId_fkey";

-- DropIndex
DROP INDEX "public"."CargoRule_uniqueId_key";

-- AlterTable
ALTER TABLE "public"."CargoRule" DROP COLUMN "cityIds",
DROP COLUMN "countryId",
DROP COLUMN "stateIds",
DROP COLUMN "uniqueId",
ADD COLUMN     "cargoZoneId" TEXT,
ADD COLUMN     "currency" "public"."Currency" NOT NULL DEFAULT 'TRY';

-- DropTable
DROP TABLE "public"."CountryCurrencyMap";

-- CreateTable
CREATE TABLE "public"."CountryDefaultSettings" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'TRY',
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "translations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryDefaultSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CargoZone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "cargoZoneId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "cityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryDefaultSettings_countryId_key" ON "public"."CountryDefaultSettings"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_countryId_stateId_cityId_key" ON "public"."Location"("countryId", "stateId", "cityId");

-- AddForeignKey
ALTER TABLE "public"."CountryDefaultSettings" ADD CONSTRAINT "CountryDefaultSettings_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_cargoZoneId_fkey" FOREIGN KEY ("cargoZoneId") REFERENCES "public"."CargoZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CargoRule" ADD CONSTRAINT "CargoRule_cargoZoneId_fkey" FOREIGN KEY ("cargoZoneId") REFERENCES "public"."CargoZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
