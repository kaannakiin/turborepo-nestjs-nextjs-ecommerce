-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "billingAddressId" TEXT,
ADD COLUMN     "shippingAddressId" TEXT;

-- CreateIndex
CREATE INDEX "AddressSchema_userId_idx" ON "public"."AddressSchema"("userId");

-- CreateIndex
CREATE INDEX "AddressSchema_countryId_idx" ON "public"."AddressSchema"("countryId");

-- CreateIndex
CREATE INDEX "AddressSchema_stateId_idx" ON "public"."AddressSchema"("stateId");

-- CreateIndex
CREATE INDEX "AddressSchema_cityId_idx" ON "public"."AddressSchema"("cityId");

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "public"."AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
