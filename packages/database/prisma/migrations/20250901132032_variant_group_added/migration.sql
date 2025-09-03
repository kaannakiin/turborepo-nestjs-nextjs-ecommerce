-- CreateEnum
CREATE TYPE "public"."Locale" AS ENUM ('TR', 'EN', 'DE');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('TRY', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "public"."VariantGroupType" AS ENUM ('LIST', 'COLOR');

-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT');

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "type" "public"."AssetType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariantGroupTranslationSchema" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "variantGroupId" TEXT NOT NULL,

    CONSTRAINT "VariantGroupTranslationSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariantGroup" (
    "id" TEXT NOT NULL,
    "type" "public"."VariantGroupType" NOT NULL DEFAULT 'LIST',
    "color" TEXT,
    "assetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariantGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_url_key" ON "public"."Asset"("url");

-- CreateIndex
CREATE INDEX "Asset_url_idx" ON "public"."Asset"("url");

-- CreateIndex
CREATE INDEX "VariantGroupTranslationSchema_locale_slug_idx" ON "public"."VariantGroupTranslationSchema"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroupTranslationSchema_locale_variantGroupId_key" ON "public"."VariantGroupTranslationSchema"("locale", "variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroupTranslationSchema_locale_slug_key" ON "public"."VariantGroupTranslationSchema"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroup_assetId_key" ON "public"."VariantGroup"("assetId");

-- AddForeignKey
ALTER TABLE "public"."VariantGroupTranslationSchema" ADD CONSTRAINT "VariantGroupTranslationSchema_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "public"."VariantGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantGroup" ADD CONSTRAINT "VariantGroup_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
