/*
  Warnings:

  - You are about to drop the column `type` on the `Cart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Cart" DROP COLUMN "type",
ADD COLUMN     "status" "public"."CartStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."CartItem" ADD COLUMN     "deletedAt" TIMESTAMP(3);
