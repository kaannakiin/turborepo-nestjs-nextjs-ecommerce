-- CreateEnum
CREATE TYPE "public"."WhereAdded" AS ENUM ('PRODUCT_PAGE', 'CATEGORY_PAGE', 'BRAND_PAGE', 'CART_PAGE');

-- AlterTable
ALTER TABLE "public"."CartItem" ADD COLUMN     "whereAdded" "public"."WhereAdded" NOT NULL DEFAULT 'PRODUCT_PAGE';
