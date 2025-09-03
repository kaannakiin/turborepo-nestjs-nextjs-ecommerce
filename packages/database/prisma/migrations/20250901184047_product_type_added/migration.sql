-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('DIGITAL', 'PHYSICAL');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "isVariant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "public"."ProductType" NOT NULL DEFAULT 'PHYSICAL';
