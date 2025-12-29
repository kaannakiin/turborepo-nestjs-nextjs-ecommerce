-- AlterTable
ALTER TABLE "InventoryLocation" ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "latitude" TEXT,
ADD COLUMN     "longitude" TEXT;

-- CreateTable
CREATE TABLE "InventoryLocationServiceZone" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "cityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedDeliveryDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLocationServiceZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryLocationServiceZone_countryId_stateId_idx" ON "InventoryLocationServiceZone"("countryId", "stateId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLocationServiceZone_locationId_countryId_stateId_key" ON "InventoryLocationServiceZone"("locationId", "countryId", "stateId");

-- AddForeignKey
ALTER TABLE "InventoryLocation" ADD CONSTRAINT "InventoryLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLocation" ADD CONSTRAINT "InventoryLocation_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLocation" ADD CONSTRAINT "InventoryLocation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLocation" ADD CONSTRAINT "InventoryLocation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLocationServiceZone" ADD CONSTRAINT "InventoryLocationServiceZone_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "InventoryLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLocationServiceZone" ADD CONSTRAINT "InventoryLocationServiceZone_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLocationServiceZone" ADD CONSTRAINT "InventoryLocationServiceZone_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;
