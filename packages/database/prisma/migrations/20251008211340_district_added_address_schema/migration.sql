-- AlterTable
ALTER TABLE "AddressSchema" ADD COLUMN     "districtId" TEXT;

-- AddForeignKey
ALTER TABLE "AddressSchema" ADD CONSTRAINT "AddressSchema_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
