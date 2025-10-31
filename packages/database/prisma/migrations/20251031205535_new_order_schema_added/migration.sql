-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCEL_REQUESTED', 'CANCEL_REJECTED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUND_REQUEST_ACCEPTED', 'REFUND_REJECTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('FAILED', 'PAID', 'PARTIALLY_PAID', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('APP_PAYMENT', 'BANK_REDIRECT', 'BUY_ONLINE_PAY_AT_STORE', 'CASH', 'CASH_ON_DELIVERY', 'CREDIT_CARD', 'CREDIT_CARD_ON_DELIVERY', 'DIRECT_DEBIT', 'GIFT_CARD', 'MONEY_ORDER', 'OTHER', 'PAY_LATER', 'SLICE_IT', 'WALLET');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "OrderItemSchema" (
    "id" TEXT NOT NULL,
    "buyedPrice" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "totalFinalPrice" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30),
    "productSnapshot" JSONB NOT NULL,
    "variantSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "variantId" TEXT,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shipmentId" TEXT,

    CONSTRAINT "OrderItemSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderSchema" (
    "id" TEXT NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "totalFinalPrice" DECIMAL(65,30) NOT NULL,
    "discountAmount" DECIMAL(65,30),
    "taxAmount" DECIMAL(65,30),
    "shippingCost" DECIMAL(65,30),
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "orderNote" TEXT,
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'IYZICO',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddressSnapshot" JSONB,
    "billingAddressSnapshot" JSONB,
    "cargoRuleSnapshot" JSONB,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cartId" TEXT,
    "userId" TEXT,
    "shippingAddressRecordId" TEXT,
    "billingAddressRecordId" TEXT,
    "cargoRuleId" TEXT,

    CONSTRAINT "OrderSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTransactionSchema" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "providerTransactionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTransactionSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "trackingCode" TEXT,
    "shippingProvider" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderTransactionSchema_providerTransactionId_key" ON "OrderTransactionSchema"("providerTransactionId");

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemSchema" ADD CONSTRAINT "OrderItemSchema_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_shippingAddressRecordId_fkey" FOREIGN KEY ("shippingAddressRecordId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_billingAddressRecordId_fkey" FOREIGN KEY ("billingAddressRecordId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSchema" ADD CONSTRAINT "OrderSchema_cargoRuleId_fkey" FOREIGN KEY ("cargoRuleId") REFERENCES "CargoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTransactionSchema" ADD CONSTRAINT "OrderTransactionSchema_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
