/*
  Warnings:

  - You are about to drop the `DiscountSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AllowedDiscountedItemsBy" AS ENUM ('price', 'discounted_price');

-- CreateEnum
CREATE TYPE "FilterOperator" AS ENUM ('AND', 'OR');

-- CreateEnum
CREATE TYPE "DiscountConditionType" AS ENUM ('PRODUCT', 'CATEGORY', 'BRAND');

-- DropTable
DROP TABLE "public"."DiscountSchema";

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currencies" "Currency"[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isLimitPurchase" BOOLEAN NOT NULL DEFAULT false,
    "minPurchaseAmount" DOUBLE PRECISION,
    "maxPurchaseAmount" DOUBLE PRECISION,
    "isLimitItemQuantity" BOOLEAN NOT NULL DEFAULT false,
    "minItemQuantity" INTEGER,
    "maxItemQuantity" INTEGER,
    "allowDiscountedItems" BOOLEAN NOT NULL DEFAULT false,
    "allowedDiscountedItemsBy" "AllowedDiscountedItemsBy",
    "mergeOtherCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "isLimitTotalUsage" BOOLEAN NOT NULL DEFAULT false,
    "totalUsageLimit" INTEGER,
    "isLimitTotalUsagePerCustomer" BOOLEAN NOT NULL DEFAULT false,
    "totalUsageLimitPerCustomer" INTEGER,
    "discountValue" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,
    "isAllCustomers" BOOLEAN NOT NULL DEFAULT true,
    "isAllProducts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountTier" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "minQuantity" INTEGER,
    "maxQuantity" INTEGER,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "discountPercentage" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,

    CONSTRAINT "DiscountTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCustomer" (
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DiscountCustomer_pkey" PRIMARY KEY ("discountId","userId")
);

-- CreateTable
CREATE TABLE "DiscountConditionGroup" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "operator" "FilterOperator" NOT NULL,

    CONSTRAINT "DiscountConditionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountProduct" (
    "groupId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "DiscountProduct_pkey" PRIMARY KEY ("groupId","productId")
);

-- CreateTable
CREATE TABLE "DiscountCategory" (
    "groupId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "DiscountCategory_pkey" PRIMARY KEY ("groupId","categoryId")
);

-- CreateTable
CREATE TABLE "DiscountBrand" (
    "groupId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "DiscountBrand_pkey" PRIMARY KEY ("groupId","brandId")
);

-- CreateTable
CREATE TABLE "DiscountProductVariant" (
    "groupId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "DiscountProductVariant_pkey" PRIMARY KEY ("groupId","variantId")
);

-- CreateTable
CREATE TABLE "DiscountUsage" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Discount_isActive_startDate_endDate_idx" ON "Discount"("isActive", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_discountId_idx" ON "Coupon"("discountId");

-- CreateIndex
CREATE INDEX "DiscountTier_discountId_idx" ON "DiscountTier"("discountId");

-- CreateIndex
CREATE INDEX "DiscountConditionGroup_discountId_idx" ON "DiscountConditionGroup"("discountId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountUsage_orderId_key" ON "DiscountUsage"("orderId");

-- CreateIndex
CREATE INDEX "DiscountUsage_discountId_idx" ON "DiscountUsage"("discountId");

-- CreateIndex
CREATE INDEX "DiscountUsage_couponId_idx" ON "DiscountUsage"("couponId");

-- CreateIndex
CREATE INDEX "DiscountUsage_userId_idx" ON "DiscountUsage"("userId");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountTier" ADD CONSTRAINT "DiscountTier_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCustomer" ADD CONSTRAINT "DiscountCustomer_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCustomer" ADD CONSTRAINT "DiscountCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountConditionGroup" ADD CONSTRAINT "DiscountConditionGroup_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProduct" ADD CONSTRAINT "DiscountProduct_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProduct" ADD CONSTRAINT "DiscountProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCategory" ADD CONSTRAINT "DiscountCategory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCategory" ADD CONSTRAINT "DiscountCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountBrand" ADD CONSTRAINT "DiscountBrand_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountBrand" ADD CONSTRAINT "DiscountBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProductVariant" ADD CONSTRAINT "DiscountProductVariant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "DiscountConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountProductVariant" ADD CONSTRAINT "DiscountProductVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountUsage" ADD CONSTRAINT "DiscountUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
