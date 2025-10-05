/*
  Warnings:

  - A unique constraint covering the columns `[orderId,productId,variantId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('THREE_D_SECURE', 'NON_THREE_D_SECURE', 'BANK_TRANSFER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'THREE_D_SECURE';

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_productId_variantId_key" ON "OrderItem"("orderId", "productId", "variantId");
