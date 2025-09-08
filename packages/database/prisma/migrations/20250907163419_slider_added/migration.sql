-- CreateTable
CREATE TABLE "public"."SliderItemSchema" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "mobileAssetId" TEXT,
    "desktopAssetId" TEXT,
    "customLink" TEXT,
    "productLink" TEXT,
    "categoryLink" TEXT,
    "brandLink" TEXT,
    "sliderSchemaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SliderItemSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SliderSchema" (
    "id" TEXT NOT NULL,
    "isAutoPlay" BOOLEAN NOT NULL DEFAULT false,
    "autoPlayInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SliderSchema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SliderItemSchema_sliderSchemaId_idx" ON "public"."SliderItemSchema"("sliderSchemaId");

-- CreateIndex
CREATE INDEX "SliderItemSchema_isActive_idx" ON "public"."SliderItemSchema"("isActive");

-- CreateIndex
CREATE INDEX "SliderItemSchema_startDate_endDate_idx" ON "public"."SliderItemSchema"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "SliderItemSchema_sliderSchemaId_order_key" ON "public"."SliderItemSchema"("sliderSchemaId", "order");

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_mobileAssetId_fkey" FOREIGN KEY ("mobileAssetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_desktopAssetId_fkey" FOREIGN KEY ("desktopAssetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_sliderSchemaId_fkey" FOREIGN KEY ("sliderSchemaId") REFERENCES "public"."SliderSchema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_productLink_fkey" FOREIGN KEY ("productLink") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_categoryLink_fkey" FOREIGN KEY ("categoryLink") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_brandLink_fkey" FOREIGN KEY ("brandLink") REFERENCES "public"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
