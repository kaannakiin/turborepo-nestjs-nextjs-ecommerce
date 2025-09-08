-- CreateTable
CREATE TABLE "public"."CountryTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "CountryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iso2" TEXT,
    "iso3" TEXT,
    "phoneCode" TEXT,
    "capital" TEXT,
    "currency" TEXT,
    "native" TEXT,
    "region" TEXT,
    "subregion" TEXT,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryTranslation_locale_countryId_key" ON "public"."CountryTranslation"("locale", "countryId");

-- AddForeignKey
ALTER TABLE "public"."CountryTranslation" ADD CONSTRAINT "CountryTranslation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
