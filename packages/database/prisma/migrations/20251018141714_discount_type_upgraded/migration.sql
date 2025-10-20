-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DiscountType" ADD VALUE 'PERCENTAGE_GROW_QUANTITY';
ALTER TYPE "DiscountType" ADD VALUE 'PERCENTAGE_GROW_PRICE';
ALTER TYPE "DiscountType" ADD VALUE 'PERCENTAGE_MAX_DISCOUNT';
ALTER TYPE "DiscountType" ADD VALUE 'FIXED_AMOUNT_GROW_QUANTITY';
ALTER TYPE "DiscountType" ADD VALUE 'FIXED_AMOUNT_GROW_PRICE';
