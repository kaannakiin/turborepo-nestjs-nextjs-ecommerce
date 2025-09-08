-- CreateTable
CREATE TABLE "public"."CityTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "CityTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CityTranslation_locale_cityId_key" ON "public"."CityTranslation"("locale", "cityId");

-- CreateIndex
CREATE INDEX "City_stateId_idx" ON "public"."City"("stateId");

-- CreateIndex
CREATE INDEX "City_id_name_idx" ON "public"."City"("id", "name");

-- CreateIndex
CREATE INDEX "City_countryId_idx" ON "public"."City"("countryId");

-- CreateIndex
CREATE INDEX "Country_id_name_idx" ON "public"."Country"("id", "name");

-- CreateIndex
CREATE INDEX "State_id_name_idx" ON "public"."State"("id", "name");

-- AddForeignKey
ALTER TABLE "public"."CityTranslation" ADD CONSTRAINT "CityTranslation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
