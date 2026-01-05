/*
  Warnings:

  - You are about to drop the column `stateId` on the `InventoryLocationServiceZone` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[locationId,countryId]` on the table `InventoryLocationServiceZone` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `countryType` to the `InventoryLocationServiceZone` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryLocationServiceZone" DROP CONSTRAINT "InventoryLocationServiceZone_stateId_fkey";

-- DropIndex
DROP INDEX "InventoryLocationServiceZone_countryId_stateId_idx";

-- DropIndex
DROP INDEX "InventoryLocationServiceZone_locationId_countryId_stateId_key";

-- AlterTable
ALTER TABLE "InventoryLocationServiceZone" DROP COLUMN "stateId",
ADD COLUMN     "countryType" "CountryType" NOT NULL,
ADD COLUMN     "stateIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "InventoryLocationServiceZone_countryId_idx" ON "InventoryLocationServiceZone"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLocationServiceZone_locationId_countryId_key" ON "InventoryLocationServiceZone"("locationId", "countryId");
