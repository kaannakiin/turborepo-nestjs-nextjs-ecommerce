/*
  Warnings:

  - You are about to drop the column `couponId` on the `CouponUsage` table. All the data in the column will be lost.
  - Added the required column `discountId` to the `CouponUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CouponUsage" DROP CONSTRAINT "CouponUsage_couponId_fkey";

-- DropIndex
DROP INDEX "public"."CouponUsage_couponId_idx";

-- AlterTable
ALTER TABLE "public"."CouponUsage" DROP COLUMN "couponId",
ADD COLUMN     "discountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CouponUsage" ADD CONSTRAINT "CouponUsage_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
