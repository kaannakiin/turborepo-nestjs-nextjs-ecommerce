/*
  Warnings:

  - You are about to drop the column `locale` on the `PaymentRequestSchema` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `PaymentRequestSchema` table. All the data in the column will be lost.
  - You are about to drop the column `request` on the `PaymentRequestSchema` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `PaymentRequestSchema` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PaymentRequestSchema` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `PaymentRequestSchema` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[orderId]` on the table `PaymentRequestSchema` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentRequestStatus" ADD VALUE 'PENDING';
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'TIMEOUT';

-- AlterTable
ALTER TABLE "PaymentRequestSchema" DROP COLUMN "locale",
DROP COLUMN "provider",
DROP COLUMN "request",
DROP COLUMN "response",
DROP COLUMN "status",
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "billingAddressId" TEXT,
ADD COLUMN     "binNumber" TEXT,
ADD COLUMN     "cardAssociation" TEXT,
ADD COLUMN     "cardFamily" TEXT,
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "cargoRuleId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(10,2),
ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "errorGroup" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "installment" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastFourDigits" TEXT,
ADD COLUMN     "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'IYZICO',
ADD COLUMN     "paymentStatus" "PaymentRequestStatus" NOT NULL DEFAULT 'WAITING_THREE_D_SECURE',
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "shippingAddressId" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(10,2),
ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "taxAmount" DECIMAL(10,2),
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequestSchema_orderId_key" ON "PaymentRequestSchema"("orderId");

-- CreateIndex
CREATE INDEX "PaymentRequestSchema_paymentStatus_idx" ON "PaymentRequestSchema"("paymentStatus");

-- CreateIndex
CREATE INDEX "PaymentRequestSchema_userId_idx" ON "PaymentRequestSchema"("userId");

-- CreateIndex
CREATE INDEX "PaymentRequestSchema_createdAt_idx" ON "PaymentRequestSchema"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentRequestSchema" ADD CONSTRAINT "PaymentRequestSchema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequestSchema" ADD CONSTRAINT "PaymentRequestSchema_cargoRuleId_fkey" FOREIGN KEY ("cargoRuleId") REFERENCES "CargoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequestSchema" ADD CONSTRAINT "PaymentRequestSchema_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequestSchema" ADD CONSTRAINT "PaymentRequestSchema_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
