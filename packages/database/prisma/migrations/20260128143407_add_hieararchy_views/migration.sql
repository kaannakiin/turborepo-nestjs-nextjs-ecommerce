/*
  Warnings:

  - You are about to drop the `CategoryGridComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Layout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LayoutComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarqueeSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PageTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductListCarousel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductListCarouselItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductListCarouselTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SliderItemSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SliderSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Theme` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_categoryGridComponentId_fkey";

-- DropForeignKey
ALTER TABLE "LayoutComponent" DROP CONSTRAINT "LayoutComponent_categoryGridComponentId_fkey";

-- DropForeignKey
ALTER TABLE "LayoutComponent" DROP CONSTRAINT "LayoutComponent_layoutId_fkey";

-- DropForeignKey
ALTER TABLE "LayoutComponent" DROP CONSTRAINT "LayoutComponent_marqueeId_fkey";

-- DropForeignKey
ALTER TABLE "LayoutComponent" DROP CONSTRAINT "LayoutComponent_productListCarouselId_fkey";

-- DropForeignKey
ALTER TABLE "LayoutComponent" DROP CONSTRAINT "LayoutComponent_sliderId_fkey";

-- DropForeignKey
ALTER TABLE "PageTemplate" DROP CONSTRAINT "PageTemplate_themeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductListCarouselItem" DROP CONSTRAINT "ProductListCarouselItem_productListCarouselId_fkey";

-- DropForeignKey
ALTER TABLE "ProductListCarouselItem" DROP CONSTRAINT "ProductListCarouselItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductListCarouselTranslation" DROP CONSTRAINT "ProductListCarouselTranslation_productListCarouselId_fkey";

-- DropForeignKey
ALTER TABLE "SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_desktopAssetId_fkey";

-- DropForeignKey
ALTER TABLE "SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_mobileAssetId_fkey";

-- DropForeignKey
ALTER TABLE "SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_sliderSettingsId_fkey";

-- DropTable
DROP TABLE "CategoryGridComponent";

-- DropTable
DROP TABLE "Layout";

-- DropTable
DROP TABLE "LayoutComponent";

-- DropTable
DROP TABLE "MarqueeSchema";

-- DropTable
DROP TABLE "PageTemplate";

-- DropTable
DROP TABLE "ProductListCarousel";

-- DropTable
DROP TABLE "ProductListCarouselItem";

-- DropTable
DROP TABLE "ProductListCarouselTranslation";

-- DropTable
DROP TABLE "SliderItemSchema";

-- DropTable
DROP TABLE "SliderSettings";

-- DropTable
DROP TABLE "Theme";

-- DropEnum
DROP TYPE "PageType";
