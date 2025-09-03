/*
  Warnings:

  - A unique constraint covering the columns `[combinationId,order]` on the table `ProductAsset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[combinationId,currency]` on the table `ProductPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."ProductAsset" ADD COLUMN     "combinationId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProductPrice" ADD COLUMN     "combinationId" TEXT;

-- CreateTable
CREATE TABLE "public"."ProductVariantGroup" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantGroupId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariantOption" (
    "id" TEXT NOT NULL,
    "productVariantGroupId" TEXT NOT NULL,
    "variantOptionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariantCombination" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariantCombinationOption" (
    "id" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "productVariantOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantCombinationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariantTranslation" (
    "id" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariantGroup_productId_idx" ON "public"."ProductVariantGroup"("productId");

-- CreateIndex
CREATE INDEX "ProductVariantGroup_variantGroupId_idx" ON "public"."ProductVariantGroup"("variantGroupId");

-- CreateIndex
CREATE INDEX "ProductVariantGroup_productId_order_idx" ON "public"."ProductVariantGroup"("productId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantGroup_productId_variantGroupId_key" ON "public"."ProductVariantGroup"("productId", "variantGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantGroup_productId_order_key" ON "public"."ProductVariantGroup"("productId", "order");

-- CreateIndex
CREATE INDEX "ProductVariantOption_productVariantGroupId_idx" ON "public"."ProductVariantOption"("productVariantGroupId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_variantOptionId_idx" ON "public"."ProductVariantOption"("variantOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantOption_productVariantGroupId_order_idx" ON "public"."ProductVariantOption"("productVariantGroupId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantOption_productVariantGroupId_variantOptionId_key" ON "public"."ProductVariantOption"("productVariantGroupId", "variantOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantOption_productVariantGroupId_order_key" ON "public"."ProductVariantOption"("productVariantGroupId", "order");

-- CreateIndex
CREATE INDEX "ProductVariantCombination_productId_idx" ON "public"."ProductVariantCombination"("productId");

-- CreateIndex
CREATE INDEX "ProductVariantCombination_active_idx" ON "public"."ProductVariantCombination"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombination_productId_sku_key" ON "public"."ProductVariantCombination"("productId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombination_productId_barcode_key" ON "public"."ProductVariantCombination"("productId", "barcode");

-- CreateIndex
CREATE INDEX "ProductVariantCombinationOption_combinationId_idx" ON "public"."ProductVariantCombinationOption"("combinationId");

-- CreateIndex
CREATE INDEX "ProductVariantCombinationOption_productVariantOptionId_idx" ON "public"."ProductVariantCombinationOption"("productVariantOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantCombinationOption_combinationId_productVarian_key" ON "public"."ProductVariantCombinationOption"("combinationId", "productVariantOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantTranslation_combinationId_locale_idx" ON "public"."ProductVariantTranslation"("combinationId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantTranslation_combinationId_locale_key" ON "public"."ProductVariantTranslation"("combinationId", "locale");

-- CreateIndex
CREATE INDEX "ProductAsset_combinationId_order_idx" ON "public"."ProductAsset"("combinationId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAsset_combinationId_order_key" ON "public"."ProductAsset"("combinationId", "order");

-- CreateIndex
CREATE INDEX "ProductPrice_combinationId_currency_idx" ON "public"."ProductPrice"("combinationId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_combinationId_currency_key" ON "public"."ProductPrice"("combinationId", "currency");

-- AddForeignKey
ALTER TABLE "public"."ProductPrice" ADD CONSTRAINT "ProductPrice_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductAsset" ADD CONSTRAINT "ProductAsset_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantGroup" ADD CONSTRAINT "ProductVariantGroup_variantGroupId_fkey" FOREIGN KEY ("variantGroupId") REFERENCES "public"."VariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_productVariantGroupId_fkey" FOREIGN KEY ("productVariantGroupId") REFERENCES "public"."ProductVariantGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantOptionId_fkey" FOREIGN KEY ("variantOptionId") REFERENCES "public"."VariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantCombination" ADD CONSTRAINT "ProductVariantCombination_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantCombinationOption" ADD CONSTRAINT "ProductVariantCombinationOption_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantCombinationOption" ADD CONSTRAINT "ProductVariantCombinationOption_productVariantOptionId_fkey" FOREIGN KEY ("productVariantOptionId") REFERENCES "public"."ProductVariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariantTranslation" ADD CONSTRAINT "ProductVariantTranslation_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
