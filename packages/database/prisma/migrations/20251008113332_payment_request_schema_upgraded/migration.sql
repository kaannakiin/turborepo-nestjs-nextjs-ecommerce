/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `PaymentRequestSchema` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentRequestStatus" ADD VALUE 'WAITING_THREE_D_SECURE';
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'THREE_D_SECURE_FAILED';
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'THREE_D_SECURE_SUCCESS';

-- AlterTable
ALTER TABLE "PaymentRequestSchema" ADD COLUMN     "paymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequestSchema_paymentId_key" ON "PaymentRequestSchema"("paymentId");
