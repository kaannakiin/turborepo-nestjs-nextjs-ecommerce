-- DropIndex
DROP INDEX "public"."PaymentRequestSchema_cartId_key";

-- DropIndex
DROP INDEX "public"."PaymentRequestSchema_orderId_key";

-- DropIndex
DROP INDEX "public"."PaymentRequestSchema_paymentId_key";

-- CreateIndex
CREATE INDEX "PaymentRequestSchema_cartId_idx" ON "PaymentRequestSchema"("cartId");

-- CreateIndex
CREATE INDEX "PaymentRequestSchema_orderId_idx" ON "PaymentRequestSchema"("orderId");

-- CreateIndex
CREATE INDEX "PaymentRequestSchema_paymentId_idx" ON "PaymentRequestSchema"("paymentId");
