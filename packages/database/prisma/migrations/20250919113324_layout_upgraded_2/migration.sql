/*
  Warnings:

  - You are about to drop the column `brandLink` on the `SliderItemSchema` table. All the data in the column will be lost.
  - You are about to drop the column `categoryLink` on the `SliderItemSchema` table. All the data in the column will be lost.
  - You are about to drop the column `productLink` on the `SliderItemSchema` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_brandLink_fkey";

-- DropForeignKey
ALTER TABLE "public"."SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_categoryLink_fkey";

-- DropForeignKey
ALTER TABLE "public"."SliderItemSchema" DROP CONSTRAINT "SliderItemSchema_productLink_fkey";

-- AlterTable
ALTER TABLE "public"."SliderItemSchema" DROP COLUMN "brandLink",
DROP COLUMN "categoryLink",
DROP COLUMN "productLink";
