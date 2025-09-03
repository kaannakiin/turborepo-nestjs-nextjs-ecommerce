/*
  Warnings:

  - You are about to drop the column `assetId` on the `VariantGroup` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `VariantGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VariantGroup" DROP CONSTRAINT "VariantGroup_assetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantGroupTranslationSchema" DROP CONSTRAINT "VariantGroupTranslationSchema_variantGroupId_fkey";

-- DropIndex
DROP INDEX "public"."VariantGroup_assetId_key";

-- AlterTable
ALTER TABLE "public"."VariantGroup" DROP COLUMN "assetId",
DROP COLUMN "color";

-- AlterTable
ALTER TABLE "public"."VariantGroupTranslationSchema" ALTER COLUMN "locale" SET DEFAULT 'TR';

-- CreateTable
CREATE TABLE "public"."VariantOptionTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "variantOptionId" TEXT NOT NULL,

    CONSTRAINT "VariantOptionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariantOption" (
    "id" TEXT NOT NULL,
    "hexValue" TEXT,
    "assetId" TEXT,
    "variantGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VariantOptionTranslation_locale_slug_idx" ON "public"."VariantOptionTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "VariantOptionTranslation_variantOptionId_idx" ON "public"."VariantOptionTranslation"("variantOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOptionTranslation_variantOptionId_locale_key" ON "public"."VariantOptionTranslation"("variantOptionId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOptionTranslation_locale_slug_key" ON "public"."VariantOptionTranslation"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "VariantOption_assetId_key" ON "public"."VariantOption"("assetId");

-- CreateIndex
CREATE INDEX "VariantOption_variantGroupId_idx" ON "public"."VariantOption"("variantGroupId");

-- CreateIndex
CREATE INDEX "VariantOption_hexValue_idx" ON "public"."VariantOption"("hexValue");

-- CreateIndex
CREATE INDEX "VariantGroup_type_idx" ON "public"."VariantGroup"("type");

-- CreateIndex
CREATE INDEX "VariantGroupTranslationSchema_variantGroupId_idx" ON "public"."VariantGroupTranslationSchema"("variantGroupId");

-- AddForeignKey
ALTER TABLE "public"."VariantGroupTranslationSchema" ADD CONSTRAINT "VariantGroupTranslationSchema_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "public"."VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantOptionTranslation" ADD CONSTRAINT "VariantOptionTranslation_variantOptionId_fkey" FOREIGN KEY ("variantOptionId") REFERENCES "public"."VariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantOption" ADD CONSTRAINT "VariantOption_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariantOption" ADD CONSTRAINT "VariantOption_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "public"."VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
