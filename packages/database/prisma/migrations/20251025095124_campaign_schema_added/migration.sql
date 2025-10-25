-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('CROSS_SELLING', 'UP_SELLING');

-- CreateEnum
CREATE TYPE "CampaignOfferTargetPage" AS ENUM ('CHECKOUT_PAGE', 'POST_CHECKOUT', 'PRODUCT');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "campaignType" "CampaignType" NOT NULL,
    "validCurrencies" "Currency"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dates" JSONB NOT NULL,
    "requirements" JSONB NOT NULL,
    "conditionsIsAllProducts" BOOLEAN,
    "campaignOfferType" "CampaignOfferTargetPage",

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignBuyableProduct" (
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CampaignBuyableProduct_pkey" PRIMARY KEY ("campaignId","productId")
);

-- CreateTable
CREATE TABLE "CampaignBuyableVariant" (
    "campaignId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "CampaignBuyableVariant_pkey" PRIMARY KEY ("campaignId","variantId")
);

-- CreateTable
CREATE TABLE "CampaignConditionProduct" (
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CampaignConditionProduct_pkey" PRIMARY KEY ("campaignId","productId")
);

-- CreateTable
CREATE TABLE "CampaignConditionVariant" (
    "campaignId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "CampaignConditionVariant_pkey" PRIMARY KEY ("campaignId","variantId")
);

-- CreateTable
CREATE TABLE "CampaignOffer" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "discountValueAppliedByPrice" "AllowedDiscountedItemsBy" NOT NULL,
    "addCountDown" BOOLEAN NOT NULL,
    "countDownMinute" INTEGER,
    "showPrroductIfInCart" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "CampaignOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignOffer_campaignId_idx" ON "CampaignOffer"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignOffer_productId_idx" ON "CampaignOffer"("productId");

-- CreateIndex
CREATE INDEX "CampaignOffer_variantId_idx" ON "CampaignOffer"("variantId");

-- AddForeignKey
ALTER TABLE "CampaignBuyableProduct" ADD CONSTRAINT "CampaignBuyableProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableProduct" ADD CONSTRAINT "CampaignBuyableProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableVariant" ADD CONSTRAINT "CampaignBuyableVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignBuyableVariant" ADD CONSTRAINT "CampaignBuyableVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionProduct" ADD CONSTRAINT "CampaignConditionProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionProduct" ADD CONSTRAINT "CampaignConditionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionVariant" ADD CONSTRAINT "CampaignConditionVariant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignConditionVariant" ADD CONSTRAINT "CampaignConditionVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOffer" ADD CONSTRAINT "CampaignOffer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOffer" ADD CONSTRAINT "CampaignOffer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignOffer" ADD CONSTRAINT "CampaignOffer_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
