/*
  Warnings:

  - A unique constraint covering the columns `[orderNumber]` on the table `OrderSchema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `OrderSchema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderSchema" ADD COLUMN     "orderNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrderSchema_orderNumber_key" ON "OrderSchema"("orderNumber");
