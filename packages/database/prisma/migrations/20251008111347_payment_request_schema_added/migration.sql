-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('IYZICO', 'PAYTR', 'STRIPE', 'PAYPAL');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "PaymentRequestSchema" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'IYZICO',
    "status" "PaymentRequestStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "request" JSONB,
    "response" JSONB,
    "cartId" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRequestSchema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequestSchema_cartId_key" ON "PaymentRequestSchema"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequestSchema_orderId_key" ON "PaymentRequestSchema"("orderId");

-- AddForeignKey
ALTER TABLE "PaymentRequestSchema" ADD CONSTRAINT "PaymentRequestSchema_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequestSchema" ADD CONSTRAINT "PaymentRequestSchema_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
