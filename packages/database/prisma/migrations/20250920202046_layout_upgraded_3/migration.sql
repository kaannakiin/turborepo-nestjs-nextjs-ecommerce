-- AlterTable
ALTER TABLE "public"."LayoutComponent" ADD COLUMN     "productListCarouselId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."LayoutComponent" ADD CONSTRAINT "LayoutComponent_productListCarouselId_fkey" FOREIGN KEY ("productListCarouselId") REFERENCES "public"."ProductListCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
