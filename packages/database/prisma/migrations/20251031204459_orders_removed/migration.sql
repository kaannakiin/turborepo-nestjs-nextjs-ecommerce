/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentRequestSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."DiscountUsage" DROP CONSTRAINT "DiscountUsage_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_cartId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentRequestSchema" DROP CONSTRAINT "PaymentRequestSchema_cargoRuleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentRequestSchema" DROP CONSTRAINT "PaymentRequestSchema_cartId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentRequestSchema" DROP CONSTRAINT "PaymentRequestSchema_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentRequestSchema" DROP CONSTRAINT "PaymentRequestSchema_userId_fkey";

-- DropTable
DROP TABLE "public"."Order";

-- DropTable
DROP TABLE "public"."OrderItem";

-- DropTable
DROP TABLE "public"."PaymentRequestSchema";

-- DropEnum
DROP TYPE "public"."OrderStatus";

-- DropEnum
DROP TYPE "public"."PaymentRequestStatus";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."PaymentType";
