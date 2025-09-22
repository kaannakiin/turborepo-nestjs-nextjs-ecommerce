/*
  Warnings:

  - You are about to drop the column `endDate` on the `SliderItemSchema` table. All the data in the column will be lost.
  - You are about to drop the column `sliderSchemaId` on the `SliderItemSchema` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `SliderItemSchema` table. All the data in the column will be lost.
  - You are about to drop the `SliderSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."LayoutComponent" DROP CONSTRAINT "LayoutComponent_sliderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_sliderSchemaId_fkey";

-- DropIndex
DROP INDEX "public"."SliderItemSchema_sliderSchemaId_idx";

-- DropIndex
DROP INDEX "public"."SliderItemSchema_sliderSchemaId_order_key";

-- DropIndex
DROP INDEX "public"."SliderItemSchema_startDate_endDate_idx";

-- AlterTable
ALTER TABLE "public"."SliderItemSchema" DROP COLUMN "endDate",
DROP COLUMN "sliderSchemaId",
DROP COLUMN "startDate";

-- DropTable
DROP TABLE "public"."SliderSchema";

-- CreateTable
CREATE TABLE "public"."SliderSettings" (
    "id" TEXT NOT NULL,
    "isAutoPlay" BOOLEAN NOT NULL DEFAULT false,
    "autoPlayInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SliderSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."LayoutComponent" ADD CONSTRAINT "LayoutComponent_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "public"."SliderSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
