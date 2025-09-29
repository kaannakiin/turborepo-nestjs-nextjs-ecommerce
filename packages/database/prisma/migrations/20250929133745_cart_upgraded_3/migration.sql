-- CreateEnum
CREATE TYPE "public"."inVisibleCause" AS ENUM ('DELETED', 'OUT_OF_STOCK', 'CURRENCY_MISMATCH', 'LOCALE_MISMATCH');

-- AlterTable
ALTER TABLE "public"."CartItem" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "visibleCause" "public"."inVisibleCause";
