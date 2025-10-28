-- CreateEnum
CREATE TYPE "VariantGroupRenderType" AS ENUM ('DROPDOWN', 'BADGE');

-- AlterTable
ALTER TABLE "ProductVariantGroup" ADD COLUMN     "renderVisibleType" "VariantGroupRenderType" NOT NULL DEFAULT 'DROPDOWN';
