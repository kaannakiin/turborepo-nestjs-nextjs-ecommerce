/*
  Warnings:

  - You are about to drop the column `billingAddressId` on the `PaymentRequestSchema` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddressId` on the `PaymentRequestSchema` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentRequestSchema" DROP CONSTRAINT "PaymentRequestSchema_billingAddressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentRequestSchema" DROP CONSTRAINT "PaymentRequestSchema_shippingAddressId_fkey";

-- AlterTable
ALTER TABLE "PaymentRequestSchema" DROP COLUMN "billingAddressId",
DROP COLUMN "shippingAddressId",
ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "shippingAddress" JSONB;
