/*
  Warnings:

  - You are about to drop the column `provder` on the `StorePaymentProvider` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider]` on the table `StorePaymentProvider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `StorePaymentProvider` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."StorePaymentProvider_provder_key";

-- AlterTable
ALTER TABLE "StorePaymentProvider" DROP COLUMN "provder",
ADD COLUMN     "isTestMode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StorePaymentProvider_provider_key" ON "StorePaymentProvider"("provider");
