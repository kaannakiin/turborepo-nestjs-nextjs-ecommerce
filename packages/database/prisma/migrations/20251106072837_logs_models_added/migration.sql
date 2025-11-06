/*
  Warnings:

  - A unique constraint covering the columns `[orderId,productId,variantId]` on the table `OrderItemSchema` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cartId]` on the table `OrderSchema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `OrderTransactionSchema` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CartActivityType" AS ENUM ('CART_CREATED', 'CART_MERGED', 'CART_STATUS_CHANGED', 'ITEM_ADDED', 'ITEM_REMOVED', 'ITEM_QUANTITY_CHANGED', 'ITEM_VISIBILITY_CHANGED', 'SHIPPING_ADDRESS_SET', 'BILLING_ADDRESS_SET', 'PAYMENT_ATTEMPT_FAILED', 'PAYMENT_ATTEMPT_SUCCESS');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CardAssociation" AS ENUM ('VISA', 'MASTER_CARD', 'AMERICAN_EXPRESS', 'TROY', 'DISCOVER', 'DINERS_CLUB', 'JCB', 'UNIONPAY', 'MAESTRO', 'MIR', 'CUP', 'UNKNOWN');

-- DropIndex
DROP INDEX "public"."OrderTransactionSchema_providerTransactionId_key";

-- AlterTable
ALTER TABLE "OrderItemSchema" ALTER COLUMN "productSnapshot" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderTransactionSchema" ADD COLUMN     "binNumber" TEXT,
ADD COLUMN     "cardAssociation" "CardAssociation",
ADD COLUMN     "cardFamilyName" TEXT,
ADD COLUMN     "lastFourDigits" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL,
ALTER COLUMN "providerTransactionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CartActivityLog" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "cartItemId" TEXT,
    "activityType" "CartActivityType" NOT NULL,
    "actorType" "ActorType" NOT NULL DEFAULT 'USER',
    "actorId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartPaymentCheckAttempts" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "message" TEXT,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartPaymentCheckAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "errorCode" TEXT,
    "context" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CartActivityLog_cartId_createdAt_idx" ON "CartActivityLog"("cartId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CartActivityLog_cartItemId_idx" ON "CartActivityLog"("cartItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CartPaymentCheckAttempts_cartId_key" ON "CartPaymentCheckAttempts"("cartId");

-- CreateIndex
CREATE INDEX "ErrorLog_context_idx" ON "ErrorLog"("context");

-- CreateIndex
CREATE INDEX "ErrorLog_createdAt_idx" ON "ErrorLog"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemSchema_orderId_productId_variantId_key" ON "OrderItemSchema"("orderId", "productId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSchema_cartId_key" ON "OrderSchema"("cartId");

-- AddForeignKey
ALTER TABLE "CartActivityLog" ADD CONSTRAINT "CartActivityLog_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartActivityLog" ADD CONSTRAINT "CartActivityLog_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartPaymentCheckAttempts" ADD CONSTRAINT "CartPaymentCheckAttempts_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
