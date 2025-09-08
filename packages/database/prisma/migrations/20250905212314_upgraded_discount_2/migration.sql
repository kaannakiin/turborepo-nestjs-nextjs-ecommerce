/*
  Warnings:

  - You are about to drop the column `currency` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Discount" DROP COLUMN "currency",
ADD COLUMN     "allowedCurrencies" "public"."Currency"[];
