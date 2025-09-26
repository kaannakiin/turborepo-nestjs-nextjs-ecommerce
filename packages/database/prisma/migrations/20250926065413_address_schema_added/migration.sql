-- CreateTable
CREATE TABLE "public"."AddressSchema" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "zipCode" TEXT,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT,
    "cityId" TEXT,
    "userId" TEXT,
    "addressLocationType" "public"."CountryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddressSchema_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AddressSchema" ADD CONSTRAINT "AddressSchema_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddressSchema" ADD CONSTRAINT "AddressSchema_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddressSchema" ADD CONSTRAINT "AddressSchema_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddressSchema" ADD CONSTRAINT "AddressSchema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
