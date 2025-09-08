/*
  Warnings:

  - You are about to drop the column `addEndDate` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `addStartDate` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `hasMaximumAmount` on the `DiscountCondition` table. All the data in the column will be lost.
  - You are about to drop the column `hasMaximumQuantity` on the `DiscountCondition` table. All the data in the column will be lost.
  - You are about to drop the column `hasMinimumAmount` on the `DiscountCondition` table. All the data in the column will be lost.
  - You are about to drop the column `hasMinimumQuantity` on the `DiscountCondition` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Discount_startDate_endDate_idx";

-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "addEndDate",
DROP COLUMN "addStartDate",
DROP COLUMN "endDate",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "public"."DiscountCondition" DROP COLUMN "hasMaximumAmount",
DROP COLUMN "hasMaximumQuantity",
DROP COLUMN "hasMinimumAmount",
DROP COLUMN "hasMinimumQuantity",
ADD COLUMN     "addEndDate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "addStartDate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "hasAmountCondition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasQuantityCondition" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."DiscountIncludedVariant" (
    "id" TEXT NOT NULL,
    "combinationId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,

    CONSTRAINT "DiscountIncludedVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountIncludedVariant_conditionId_idx" ON "public"."DiscountIncludedVariant"("conditionId");

-- CreateIndex
CREATE INDEX "DiscountIncludedVariant_combinationId_idx" ON "public"."DiscountIncludedVariant"("combinationId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountIncludedVariant_combinationId_conditionId_key" ON "public"."DiscountIncludedVariant"("combinationId", "conditionId");

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedVariant" ADD CONSTRAINT "DiscountIncludedVariant_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."DiscountCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiscountIncludedVariant" ADD CONSTRAINT "DiscountIncludedVariant_combinationId_fkey" FOREIGN KEY ("combinationId") REFERENCES "public"."ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
