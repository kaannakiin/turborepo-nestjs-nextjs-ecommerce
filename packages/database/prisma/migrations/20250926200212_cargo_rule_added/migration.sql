-- CreateEnum
CREATE TYPE "public"."RuleType" AS ENUM ('SalesPrice', 'ProductWeight');

-- CreateTable
CREATE TABLE "public"."CountryCurrencyMap" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryCurrencyMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CargoRule" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ruleType" "public"."RuleType" NOT NULL DEFAULT 'SalesPrice',
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryCurrencyMap_countryId_key" ON "public"."CountryCurrencyMap"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "CargoRule_uniqueId_key" ON "public"."CargoRule"("uniqueId");

-- CreateIndex
CREATE INDEX "CargoRule_ruleType_idx" ON "public"."CargoRule"("ruleType");

-- AddForeignKey
ALTER TABLE "public"."CountryCurrencyMap" ADD CONSTRAINT "CountryCurrencyMap_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CargoRule" ADD CONSTRAINT "CargoRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
