/*
  Warnings:

  - You are about to drop the column `maxApplicationsPerCart` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the `DiscountBuyBrand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountBuyCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountBuyProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountBuyVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountGetBrand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountGetCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountGetProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountGetVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DiscountBuyBrand" DROP CONSTRAINT "DiscountBuyBrand_brandId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyBrand" DROP CONSTRAINT "DiscountBuyBrand_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyCategory" DROP CONSTRAINT "DiscountBuyCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyCategory" DROP CONSTRAINT "DiscountBuyCategory_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyProduct" DROP CONSTRAINT "DiscountBuyProduct_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyProduct" DROP CONSTRAINT "DiscountBuyProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyVariant" DROP CONSTRAINT "DiscountBuyVariant_combinationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountBuyVariant" DROP CONSTRAINT "DiscountBuyVariant_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetBrand" DROP CONSTRAINT "DiscountGetBrand_brandId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetBrand" DROP CONSTRAINT "DiscountGetBrand_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetCategory" DROP CONSTRAINT "DiscountGetCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetCategory" DROP CONSTRAINT "DiscountGetCategory_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetProduct" DROP CONSTRAINT "DiscountGetProduct_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetProduct" DROP CONSTRAINT "DiscountGetProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetVariant" DROP CONSTRAINT "DiscountGetVariant_combinationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountGetVariant" DROP CONSTRAINT "DiscountGetVariant_discountId_fkey";

-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "maxApplicationsPerCart",
ADD COLUMN     "buyProductId" TEXT,
ADD COLUMN     "buyVariantId" TEXT,
ADD COLUMN     "getProductId" TEXT,
ADD COLUMN     "getVariantId" TEXT;

-- DropTable
DROP TABLE "public"."DiscountBuyBrand";

-- DropTable
DROP TABLE "public"."DiscountBuyCategory";

-- DropTable
DROP TABLE "public"."DiscountBuyProduct";

-- DropTable
DROP TABLE "public"."DiscountBuyVariant";

-- DropTable
DROP TABLE "public"."DiscountGetBrand";

-- DropTable
DROP TABLE "public"."DiscountGetCategory";

-- DropTable
DROP TABLE "public"."DiscountGetProduct";

-- DropTable
DROP TABLE "public"."DiscountGetVariant";

-- CreateIndex
CREATE INDEX "Brand_parentBrandId_idx" ON "public"."Brand"("parentBrandId");

-- CreateIndex
CREATE INDEX "Discount_buyProductId_idx" ON "public"."Discount"("buyProductId");

-- CreateIndex
CREATE INDEX "Discount_buyVariantId_idx" ON "public"."Discount"("buyVariantId");

-- CreateIndex
CREATE INDEX "Discount_getProductId_idx" ON "public"."Discount"("getProductId");

-- CreateIndex
CREATE INDEX "Discount_getVariantId_idx" ON "public"."Discount"("getVariantId");
