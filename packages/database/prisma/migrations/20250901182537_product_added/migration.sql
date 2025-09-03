/*
  Warnings:

  - You are about to drop the `VariantGroupTranslationSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VariantGroupTranslationSchema" DROP CONSTRAINT "VariantGroupTranslationSchema_variantGroupId_fkey";

-- DropTable
DROP TABLE "public"."VariantGroupTranslationSchema";

-- CreateTable
CREATE TABLE "public"."VariantGroupTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "variantGroupId" TEXT NOT NULL,

    CONSTRAINT "VariantGroupTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductPrice" (
    "id" TEXT NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'TRY',
    "price" DOUBLE PRECISION NOT NULL,
    "buyedPrice" DOUBLE PRECISION,
    "discountedPrice" DOUBLE PRECISION,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductAsset" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "assetId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VariantGroupTranslation_locale_slug_idx" ON "public"."VariantGroupTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "VariantGroupTranslation_variantGroupId_idx" ON "public"."VariantGroupTranslation"("variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroupTranslation_locale_variantGroupId_key" ON "public"."VariantGroupTranslation"("locale", "variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "VariantGroupTranslation_locale_slug_key" ON "public"."VariantGroupTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "ProductTranslation_locale_slug_productId_idx" ON "public"."ProductTranslation"("locale", "slug", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_locale_productId_key" ON "public"."ProductTranslation"("locale", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_locale_slug_key" ON "public"."ProductTranslation"("locale", "slug");

-- CreateIndex
CREATE INDEX "ProductPrice_productId_currency_idx" ON "public"."ProductPrice"("productId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_currency_key" ON "public"."ProductPrice"("productId", "currency");

-- CreateIndex
CREATE INDEX "ProductAsset_productId_order_idx" ON "public"."ProductAsset"("productId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAsset_productId_order_key" ON "public"."ProductAsset"("productId", "order");

-- AddForeignKey
ALTER TABLE "public"."VariantGroupTranslation" ADD CONSTRAINT "VariantGroupTranslation_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "public"."VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductAsset" ADD CONSTRAINT "ProductAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductAsset" ADD CONSTRAINT "ProductAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
