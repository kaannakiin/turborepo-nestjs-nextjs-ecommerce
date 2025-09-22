-- CreateTable
CREATE TABLE "public"."ProductListCarouselTranslation" (
    "id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL DEFAULT 'TR',
    "title" TEXT NOT NULL,
    "productListCarouselId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListCarouselTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductListCarousel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductListCarouselItem" (
    "id" TEXT NOT NULL,
    "productListCarouselId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductListCarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductListCarouselTranslation_productListCarouselId_idx" ON "public"."ProductListCarouselTranslation"("productListCarouselId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListCarouselTranslation_locale_productListCarouselId_key" ON "public"."ProductListCarouselTranslation"("locale", "productListCarouselId");

-- CreateIndex
CREATE INDEX "ProductListCarouselItem_productListCarouselId_order_idx" ON "public"."ProductListCarouselItem"("productListCarouselId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListCarouselItem_productListCarouselId_productId_var_key" ON "public"."ProductListCarouselItem"("productListCarouselId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductListCarouselItem_productListCarouselId_order_key" ON "public"."ProductListCarouselItem"("productListCarouselId", "order");

-- AddForeignKey
ALTER TABLE "public"."ProductListCarouselTranslation" ADD CONSTRAINT "ProductListCarouselTranslation_productListCarouselId_fkey" FOREIGN KEY ("productListCarouselId") REFERENCES "public"."ProductListCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductListCarouselItem" ADD CONSTRAINT "ProductListCarouselItem_productListCarouselId_fkey" FOREIGN KEY ("productListCarouselId") REFERENCES "public"."ProductListCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductListCarouselItem" ADD CONSTRAINT "ProductListCarouselItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductListCarouselItem" ADD CONSTRAINT "ProductListCarouselItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
