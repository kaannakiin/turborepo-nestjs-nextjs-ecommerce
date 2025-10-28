/*
  Warnings:

  - A unique constraint covering the columns `[provder]` on the table `StorePaymentProvider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StorePaymentProvider_provder_key" ON "StorePaymentProvider"("provder");
