-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING');

-- DropIndex
DROP INDEX "public"."City_id_name_idx";

-- DropIndex
DROP INDEX "public"."Country_id_name_idx";

-- DropIndex
DROP INDEX "public"."State_id_name_idx";

-- CreateTable
CREATE TABLE "public"."Discount" (
    "id" TEXT NOT NULL,
    "type" "public"."DiscountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "addStartDate" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "addEndDate" BOOLEAN NOT NULL DEFAULT false,
    "endDate" TIMESTAMP(3),
    "discountPercentage" DECIMAL(65,30),
    "discountAmount" DECIMAL(65,30),
    "currency" "public"."Currency",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL,
    "discountTitle" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "discountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountCoupon" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(128) NOT NULL,
    "limit" INTEGER,
    "perUserLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "discountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CouponUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "couponId" TEXT NOT NULL,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountCondition" (
    "id" TEXT NOT NULL,
    "allProducts" BOOLEAN NOT NULL DEFAULT false,
    "allUser" BOOLEAN NOT NULL DEFAULT false,
    "onlyRegisteredUsers" BOOLEAN NOT NULL DEFAULT false,
    "hasMinimumAmount" BOOLEAN NOT NULL DEFAULT false,
    "minimumAmount" DECIMAL(65,30),
    "hasMaximumAmount" BOOLEAN NOT NULL DEFAULT false,
    "maximumAmount" DECIMAL(65,30),
    "hasMinimumQuantity" BOOLEAN NOT NULL DEFAULT false,
    "minimumQuantity" INTEGER,
    "hasMaximumQuantity" BOOLEAN NOT NULL DEFAULT false,
    "maximumQuantity" INTEGER,
    "discountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountIncludedProduct" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,

    CONSTRAINT "DiscountIncludedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountIncludedCategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,

    CONSTRAINT "DiscountIncludedCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountIncludedBrand" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,

    CONSTRAINT "DiscountIncludedBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountIncludedUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,

    CONSTRAINT "DiscountIncludedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Discount_type_idx" ON "public"."Discount"("type");

-- CreateIndex
CREATE INDEX "Discount_isActive_idx" ON "public"."Discount"("isActive");

-- CreateIndex
CREATE INDEX "Discount_startDate_endDate_idx" ON "public"."Discount"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Discount_createdAt_idx" ON "public"."Discount"("createdAt");

-- CreateIndex
CREATE INDEX "DiscountTranslation_discountId_idx" ON "public"."DiscountTranslation"("discountId");

-- CreateIndex
CREATE INDEX "DiscountTranslation_locale_idx" ON "public"."DiscountTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountTranslation_locale_discountId_key" ON "public"."DiscountTranslation"("locale", "discountId");

-- CreateIndex
CREATE INDEX "DiscountCoupon_discountId_idx" ON "public"."DiscountCoupon"("discountId");

-- CreateIndex
CREATE INDEX "DiscountCoupon_code_idx" ON "public"."DiscountCoupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCoupon_code_key" ON "public"."DiscountCoupon"("code");

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_idx" ON "public"."CouponUsage"("couponId");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_idx" ON "public"."CouponUsage"("userId");

-- CreateIndex
CREATE INDEX "CouponUsage_orderId_idx" ON "public"."CouponUsage"("orderId");

-- CreateIndex
CREATE INDEX "CouponUsage_usedAt_idx" ON "public"."CouponUsage"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCondition_discountId_key" ON "public"."DiscountCondition"("discountId");

-- CreateIndex
CREATE INDEX "DiscountCondition_discountId_idx" ON "public"."DiscountCondition"("discountId");

-- CreateIndex
CREATE INDEX "DiscountIncludedProduct_conditionId_idx" ON "public"."DiscountIncludedProduct"("conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedProduct_productId_idx" ON "public"."DiscountIncludedProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountIncludedProduct_productId_conditionId_key" ON "public"."DiscountIncludedProduct"("productId", "conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedCategory_conditionId_idx" ON "public"."DiscountIncludedCategory"("conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedCategory_categoryId_idx" ON "public"."DiscountIncludedCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountIncludedCategory_categoryId_conditionId_key" ON "public"."DiscountIncludedCategory"("categoryId", "conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedBrand_conditionId_idx" ON "public"."DiscountIncludedBrand"("conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedBrand_brandId_idx" ON "public"."DiscountIncludedBrand"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountIncludedBrand_brandId_conditionId_key" ON "public"."DiscountIncludedBrand"("brandId", "conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedUser_conditionId_idx" ON "public"."DiscountIncludedUser"("conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedUser_userId_idx" ON "public"."DiscountIncludedUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountIncludedUser_userId_conditionId_key" ON "public"."DiscountIncludedUser"("userId", "conditionId");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "public"."City"("name");

-- CreateIndex
CREATE INDEX "City_stateId_name_idx" ON "public"."City"("stateId", "name");

-- CreateIndex
CREATE INDEX "City_countryId_stateId_idx" ON "public"."City"("countryId", "stateId");

-- CreateIndex
CREATE INDEX "City_latitude_longitude_idx" ON "public"."City"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "CityTranslation_cityId_idx" ON "public"."CityTranslation"("cityId");

-- CreateIndex
CREATE INDEX "CityTranslation_locale_idx" ON "public"."CityTranslation"("locale");

-- CreateIndex
CREATE INDEX "CityTranslation_name_idx" ON "public"."CityTranslation"("name");

-- CreateIndex
CREATE INDEX "Country_name_idx" ON "public"."Country"("name");

-- CreateIndex
CREATE INDEX "Country_iso2_idx" ON "public"."Country"("iso2");

-- CreateIndex
CREATE INDEX "Country_iso3_idx" ON "public"."Country"("iso3");

-- CreateIndex
CREATE INDEX "Country_region_idx" ON "public"."Country"("region");

-- CreateIndex
CREATE INDEX "Country_subregion_idx" ON "public"."Country"("subregion");

-- CreateIndex
CREATE INDEX "Country_currency_idx" ON "public"."Country"("currency");

-- CreateIndex
CREATE INDEX "CountryTranslation_countryId_idx" ON "public"."CountryTranslation"("countryId");

-- CreateIndex
CREATE INDEX "CountryTranslation_locale_idx" ON "public"."CountryTranslation"("locale");

-- CreateIndex
CREATE INDEX "CountryTranslation_name_idx" ON "public"."CountryTranslation"("name");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "public"."Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_taxonomyCategoryId_idx" ON "public"."Product"("taxonomyCategoryId");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "public"."Product"("active");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "public"."Product"("sku");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "public"."Product"("barcode");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "public"."State"("countryId");

-- CreateIndex
CREATE INDEX "State_name_idx" ON "public"."State"("name");

-- CreateIndex
CREATE INDEX "State_stateCode_idx" ON "public"."State"("stateCode");

-- CreateIndex
CREATE INDEX "State_countryId_name_idx" ON "public"."State"("countryId", "name");

-- CreateIndex
CREATE INDEX "StateTranslation_stateId_idx" ON "public"."StateTranslation"("stateId");

-- CreateIndex
CREATE INDEX "StateTranslation_locale_idx" ON "public"."StateTranslation"("locale");

-- CreateIndex
CREATE INDEX "StateTranslation_name_idx" ON "public"."StateTranslation"("name");

-- AddForeignKey
ALTER TABLE "public"."DiscountTranslation" ADD CONSTRAINT "DiscountTranslation_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountCoupon" ADD CONSTRAINT "DiscountCoupon_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "public"."DiscountCoupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountCondition" ADD CONSTRAINT "DiscountCondition_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedProduct" ADD CONSTRAINT "DiscountIncludedProduct_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedProduct" ADD CONSTRAINT "DiscountIncludedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedCategory" ADD CONSTRAINT "DiscountIncludedCategory_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedCategory" ADD CONSTRAINT "DiscountIncludedCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedBrand" ADD CONSTRAINT "DiscountIncludedBrand_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedBrand" ADD CONSTRAINT "DiscountIncludedBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedUser" ADD CONSTRAINT "DiscountIncludedUser_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedUser" ADD CONSTRAINT "DiscountIncludedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
