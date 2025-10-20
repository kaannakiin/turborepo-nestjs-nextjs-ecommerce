/*
  Warnings:

  - The values [BUY_X_GET_Y] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('PERCENTAGE', 'PERCENTAGE_GROW_QUANTITY', 'PERCENTAGE_GROW_PRICE', 'FIXED_AMOUNT', 'FIXED_AMOUNT_GROW_QUANTITY', 'FIXED_AMOUNT_GROW_PRICE', 'FREE_SHIPPING');
ALTER TABLE "public"."DiscountSchema" ALTER COLUMN "discountType" DROP DEFAULT;
ALTER TABLE "DiscountSchema" ALTER COLUMN "discountType" TYPE "DiscountType_new" USING ("discountType"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "public"."DiscountType_old";
ALTER TABLE "DiscountSchema" ALTER COLUMN "discountType" SET DEFAULT 'PERCENTAGE';
COMMIT;
