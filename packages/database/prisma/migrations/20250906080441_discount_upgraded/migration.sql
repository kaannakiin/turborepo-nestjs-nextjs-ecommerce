-- CreateEnum
CREATE TYPE "public"."CouponGenerationType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterEnum
ALTER TYPE "public"."DiscountType" ADD VALUE 'BUY_X_GET_Y';

-- AlterTable
ALTER TABLE "public"."Discount" ADD COLUMN     "buyQuantity" INTEGER,
ADD COLUMN     "buyXGetYDiscountPercentage" DECIMAL(65,30),
ADD COLUMN     "couponGeneration" "public"."CouponGenerationType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "getQuantity" INTEGER,
ADD COLUMN     "maxApplicationsPerCart" INTEGER;

-- CreateTable
CREATE TABLE "public"."DiscountBuyProduct" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountBuyProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountBuyVariant" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountBuyVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountBuyCategory" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountBuyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountBuyBrand" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountBuyBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountGetProduct" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountGetProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountGetVariant" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountGetVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountGetCategory" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountGetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiscountGetBrand" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountGetBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountBuyProduct_discountId_idx" ON "public"."DiscountBuyProduct"("discountId");

-- CreateIndex
CREATE INDEX "DiscountBuyProduct_productId_idx" ON "public"."DiscountBuyProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountBuyProduct_discountId_productId_key" ON "public"."DiscountBuyProduct"("discountId", "productId");

-- CreateIndex
CREATE INDEX "DiscountBuyVariant_discountId_idx" ON "public"."DiscountBuyVariant"("discountId");

-- CreateIndex
CREATE INDEX "DiscountBuyVariant_combinationId_idx" ON "public"."DiscountBuyVariant"("combinationId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountBuyVariant_discountId_combinationId_key" ON "public"."DiscountBuyVariant"("discountId", "combinationId");

-- CreateIndex
CREATE INDEX "DiscountBuyCategory_discountId_idx" ON "public"."DiscountBuyCategory"("discountId");

-- CreateIndex
CREATE INDEX "DiscountBuyCategory_categoryId_idx" ON "public"."DiscountBuyCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountBuyCategory_discountId_categoryId_key" ON "public"."DiscountBuyCategory"("discountId", "categoryId");

-- CreateIndex
CREATE INDEX "DiscountBuyBrand_discountId_idx" ON "public"."DiscountBuyBrand"("discountId");

-- CreateIndex
CREATE INDEX "DiscountBuyBrand_brandId_idx" ON "public"."DiscountBuyBrand"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountBuyBrand_discountId_brandId_key" ON "public"."DiscountBuyBrand"("discountId", "brandId");

-- CreateIndex
CREATE INDEX "DiscountGetProduct_discountId_idx" ON "public"."DiscountGetProduct"("discountId");

-- CreateIndex
CREATE INDEX "DiscountGetProduct_productId_idx" ON "public"."DiscountGetProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountGetProduct_discountId_productId_key" ON "public"."DiscountGetProduct"("discountId", "productId");

-- CreateIndex
CREATE INDEX "DiscountGetVariant_discountId_idx" ON "public"."DiscountGetVariant"("discountId");

-- CreateIndex
CREATE INDEX "DiscountGetVariant_combinationId_idx" ON "public"."DiscountGetVariant"("combinationId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountGetVariant_discountId_combinationId_key" ON "public"."DiscountGetVariant"("discountId", "combinationId");

-- CreateIndex
CREATE INDEX "DiscountGetCategory_discountId_idx" ON "public"."DiscountGetCategory"("discountId");

-- CreateIndex
CREATE INDEX "DiscountGetCategory_categoryId_idx" ON "public"."DiscountGetCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountGetCategory_discountId_categoryId_key" ON "public"."DiscountGetCategory"("discountId", "categoryId");

-- CreateIndex
CREATE INDEX "DiscountGetBrand_discountId_idx" ON "public"."DiscountGetBrand"("discountId");

-- CreateIndex
CREATE INDEX "DiscountGetBrand_brandId_idx" ON "public"."DiscountGetBrand"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountGetBrand_discountId_brandId_key" ON "public"."DiscountGetBrand"("discountId", "brandId");

-- CreateIndex
CREATE INDEX "Discount_couponGeneration_idx" ON "public"."Discount"("couponGeneration");

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyProduct" ADD CONSTRAINT "DiscountBuyProduct_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyProduct" ADD CONSTRAINT "DiscountBuyProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyVariant" ADD CONSTRAINT "DiscountBuyVariant_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyVariant" ADD CONSTRAINT "DiscountBuyVariant_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyCategory" ADD CONSTRAINT "DiscountBuyCategory_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyCategory" ADD CONSTRAINT "DiscountBuyCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyBrand" ADD CONSTRAINT "DiscountBuyBrand_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountBuyBrand" ADD CONSTRAINT "DiscountBuyBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetProduct" ADD CONSTRAINT "DiscountGetProduct_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetProduct" ADD CONSTRAINT "DiscountGetProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetVariant" ADD CONSTRAINT "DiscountGetVariant_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetVariant" ADD CONSTRAINT "DiscountGetVariant_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetCategory" ADD CONSTRAINT "DiscountGetCategory_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetCategory" ADD CONSTRAINT "DiscountGetCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetBrand" ADD CONSTRAINT "DiscountGetBrand_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountGetBrand" ADD CONSTRAINT "DiscountGetBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
